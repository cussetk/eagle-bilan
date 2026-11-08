/* =====================================================================
   STOCKAGE
   - NeonStore : comptes (Managed Better Auth) + base Postgres (Data API, RLS)
   - DemoStore : tout reste dans ce navigateur (mode démo / formation)
   ===================================================================== */
import { createClient } from "@neon/neon-js";

export const NEON = {
  auth: "https://ep-little-leaf-b9fp2o61.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth",
  data: "https://ep-little-leaf-b9fp2o61.apirest.c-7.eu-central-1.aws.neon.tech/neondb/rest/v1"
};

const AUTH_ERRORS = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou mot de passe incorrect.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet e-mail. Connecte-toi.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet e-mail. Connecte-toi.",
  EMAIL_NOT_VERIFIED: "Ton e-mail n'est pas encore confirmé : saisis le code reçu par e-mail.",
  INVALID_OTP: "Code incorrect. Vérifie le dernier e-mail reçu.",
  OTP_EXPIRED: "Ce code a expiré : demande un nouveau code.",
  TOO_MANY_ATTEMPTS: "Trop d'essais : demande un nouveau code.",
  PASSWORD_TOO_SHORT: "Mot de passe trop court (8 caractères minimum).",
  INVALID_EMAIL: "Adresse e-mail invalide."
};
export function authMessage(err) {
  if (!err) return "";
  const code = err.code || (err.error && err.error.code) || "";
  return AUTH_ERRORS[code] || err.message || "Une erreur est survenue. Réessaie.";
}

export class NeonStore {
  constructor() {
    this.mode = "neon";
    this.client = createClient({ auth: { url: NEON.auth }, dataApi: { url: NEON.data } });
    this.access = null;
    this.q = new Map();
  }
  _queue(key, fn) { const prev = this.q.get(key) || Promise.resolve(); const next = prev.catch(() => {}).then(fn); this.q.set(key, next); return next; }
  _check(res) { if (res && res.error) { const e = new Error(res.error.message || "Erreur base de données"); e.code = res.error.code; throw e; } return res ? res.data : null; }

  /* ---- Auth ---- */
  async session() { try { const r = await this.client.auth.getSession(); return r && r.data && r.data.session ? r.data : null; } catch (e) { return null; } }
  async signIn(email, password) { return this.client.auth.signIn.email({ email, password }); }
  async signUp(name, email, password) { return this.client.auth.signUp.email({ email, password, name }); }
  async verify(email, otp) { return this.client.auth.emailOtp.verifyEmail({ email, otp }); }
  async resend(email) { return this.client.auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" }); }
  async forgot(email) { return this.client.auth.forgetPassword.emailOtp({ email }); }
  async reset(email, otp, password) { return this.client.auth.emailOtp.resetPassword({ email, otp, password }); }
  async signOut() { try { await this.client.auth.signOut(); } catch (e) {} }
  async myAccess() { this.access = this._check(await this.client.rpc("my_access")); return this.access; }

  /* ---- Données ---- */
  async loadAll() {
    const [cfg, contacts, prof] = await Promise.all([
      this.client.from("app_config").select("data").eq("id", 1).maybeSingle(),
      this.client.from("contacts").select("id, data").limit(5000),
      this.client.from("profiles").select("pseudo, tel, live").eq("user_id", this.access.user_id).maybeSingle()
    ]);
    const c = this._check(cfg); const rows = this._check(contacts) || []; const p = this._check(prof);
    return { cfg: c ? c.data : null, contacts: rows.map((r) => ({ ...r.data, id: r.id })), profil: p ? { pseudo: p.pseudo || "", tel: p.tel || "" } : null, live: p ? p.live : null };
  }
  saveContact(c) { const row = { id: c.id, data: c, updated_at: new Date().toISOString() }; return this._queue("c:" + c.id, async () => this._check(await this.client.from("contacts").upsert(row, { onConflict: "id" }))); }
  deleteContact(id) { return this._queue("c:" + id, async () => { this._check(await this.client.from("rapports").delete().eq("contact_id", id)); this._check(await this.client.from("contacts").delete().eq("id", id)); }); }
  saveProfil(profil, stats) {
    const row = { user_id: this.access.user_id, pseudo: String(profil.pseudo || "").slice(0, 40), tel: String(profil.tel || "").slice(0, 30), stats: stats || null, updated_at: new Date().toISOString() };
    return this._queue("profil", async () => this._check(await this.client.from("profiles").upsert(row, { onConflict: "user_id" })));
  }
  saveLive(live) { return this._queue("live", async () => this._check(await this.client.from("profiles").upsert({ user_id: this.access.user_id, live, updated_at: new Date().toISOString() }, { onConflict: "user_id" }))); }
  async getLive() { const r = this._check(await this.client.from("profiles").select("live").eq("user_id", this.access.user_id).maybeSingle()); return r ? r.live : null; }
  saveConfig(cfg) { return this._queue("cfg", async () => this._check(await this.client.from("app_config").upsert({ id: 1, data: cfg, updated_at: new Date().toISOString() }, { onConflict: "id" }))); }
  async createRapport(token, contactId, data) { this._check(await this.client.from("rapports").insert({ token, contact_id: contactId, data })); }
  async team() { return this._check(await this.client.rpc("team_stats")) || []; }
  async members() { return this._check(await this.client.from("team_members").select("*").order("invited_at", { ascending: true })) || []; }
  async addMember(email, role) { this._check(await this.client.from("team_members").insert({ email: email.toLowerCase().trim(), role })); }
  async updateMember(email, patch) { this._check(await this.client.from("team_members").update(patch).eq("email", email)); }
  async deleteMember(email) { this._check(await this.client.from("team_members").delete().eq("email", email)); }
}

/* Mode démo : même interface, tout reste dans le navigateur */
const LSK = { contacts: "eagle2_demo_contacts", cfg: "eagle2_demo_cfg", profil: "eagle2_demo_profil" };
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
export class DemoStore {
  constructor() { this.mode = "demo"; this.access = { email: "demo@eagle", member: true, leader: true, user_id: "demo" }; this.contacts = lsGet(LSK.contacts, []); this.live = null; }
  async session() { return { user: { email: "demo" } }; }
  async myAccess() { return this.access; }
  async loadAll() { return { cfg: lsGet(LSK.cfg, null), contacts: this.contacts, profil: lsGet(LSK.profil, { pseudo: "" }), live: this.live }; }
  _persist(all) { lsSet(LSK.contacts, all); }
  async saveContact(c, all) { this._persist(all); }
  async deleteContact(id, all) { this._persist(all); }
  async saveProfil(p) { lsSet(LSK.profil, p); }
  async saveLive(l) { this.live = l; }
  async getLive() { return this.live; }
  async saveConfig(cfg) { lsSet(LSK.cfg, cfg); }
  async createRapport(token, contactId, data) { lsSet("eagle2_demo_rapport_" + token, data); }
  async team() { return []; }
  async members() { return [{ email: "demo@eagle", role: "leader", actif: true }]; }
  async addMember() { throw new Error("Indisponible en mode démo"); }
  async updateMember() {} async deleteMember() {}
  async signOut() {}
}
