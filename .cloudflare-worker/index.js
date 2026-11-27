var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _middleware.js
var SESSION_TTL_SECONDS = 8 * 60 * 60;
var CSRF_TTL_SECONDS = 10 * 60;
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
__name(bytesToBase64Url, "bytesToBase64Url");
function randomToken() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}
__name(randomToken, "randomToken");
function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => part.trim().split(/=(.*)/s, 2)).filter(([key, value]) => key && value !== void 0).map(([key, value]) => [key, decodeURIComponent(value)]));
}
__name(parseCookies, "parseCookies");
function cookie(value, maxAge = SESSION_TTL_SECONDS) {
  return `ultra_admin_session=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
__name(cookie, "cookie");
function csrfCookie(value, maxAge = CSRF_TTL_SECONDS) {
  return `ultra_admin_csrf=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
__name(csrfCookie, "csrfCookie");
async function onRequest(context) {
  const { request, env, next, data } = context;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/admin/")) return next();
  let stage = "read-cookies";
  try {
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const rawSession = cookies.ultra_admin_session;
    let session = null;
    if (rawSession && env.DB) {
      stage = "lookup-admin-session";
      session = await env.DB.prepare("SELECT admin_id, csrf_hash, expires_at FROM admin_sessions WHERE sid_hash = ? AND expires_at > ?").bind(await sha256(rawSession), Math.floor(Date.now() / 1e3)).first();
    }
    if (!session && url.pathname === "/api/admin/session") {
      const csrfToken = randomToken();
      data.csrfToken = csrfToken;
      data.session = null;
      stage = "create-admin-session-response";
      const response2 = await next();
      const headers2 = new Headers(response2.headers);
      headers2.append("Set-Cookie", csrfCookie(csrfToken));
      headers2.set("Cache-Control", "no-store");
      return new Response(response2.body, { status: response2.status, statusText: response2.statusText, headers: headers2 });
    }
    if (!session && url.pathname !== "/api/admin/login") {
      data.session = null;
      data.sessionId = rawSession;
      data.csrfValid = false;
      stage = "handle-unauthenticated-admin-request";
      const response2 = await next();
      const headers2 = new Headers(response2.headers);
      headers2.set("Cache-Control", "no-store");
      return new Response(response2.body, { status: response2.status, statusText: response2.statusText, headers: headers2 });
    }
    data.session = session?.admin_id ? session : null;
    data.sessionId = rawSession;
    if (session?.admin_id) {
      stage = "validate-session-csrf";
      data.csrfValid = request.method === "GET" || await sha256(request.headers.get("X-CSRF-Token") || "") === session.csrf_hash;
    } else if (url.pathname === "/api/admin/login") {
      stage = "validate-login-csrf";
      const provided = request.headers.get("X-CSRF-Token") || "";
      const csrfCookieValue = cookies.ultra_admin_csrf || "";
      data.csrfValid = Boolean(csrfCookieValue && csrfCookieValue === provided && (!session || await sha256(provided) === session.csrf_hash));
    } else {
      data.csrfValid = false;
    }
    stage = "run-admin-handler";
    const response = await next();
    const headers = new Headers(response.headers);
    if (response.status === 401 && session?.admin_id) {
      headers.append("Set-Cookie", cookie("", 0));
      stage = "remove-invalid-admin-session";
      await env.DB.prepare("DELETE FROM admin_sessions WHERE sid_hash = ?").bind(await sha256(rawSession)).run();
    }
    headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error("Admin middleware request failed", {
      path: url.pathname,
      stage,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : void 0
    });
    return json({ message: "Admin request failed. Please try again." }, 500);
  }
}
__name(onRequest, "onRequest");
async function sessionHash(value) {
  return sha256(value);
}
__name(sessionHash, "sessionHash");
function makeToken() {
  return randomToken();
}
__name(makeToken, "makeToken");
function sessionCookie(value, maxAge = SESSION_TTL_SECONDS) {
  return cookie(value, maxAge);
}
__name(sessionCookie, "sessionCookie");
function clearCsrfCookie() {
  return csrfCookie("", 0);
}
__name(clearCsrfCookie, "clearCsrfCookie");
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });
}
__name(json, "json");

// api/admin/leads/[id]/status.js
var statuses = ["New", "Contacted", "Qualified", "Converted", "Lost"];
async function onRequestPatch({ request, params, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: "Please sign in to continue." }, 401);
  if (!data.csrfValid) return json({ message: "Your session expired. Refresh and try again." }, 403);
  if (!/^\d+$/.test(params.id)) return json({ message: "Lead ID is invalid." }, 400);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Request body must be valid JSON." }, 400);
  }
  if (typeof body?.status !== "string" || !statuses.includes(body.status)) return json({ message: "Choose a valid lead status." }, 400);
  const result = await env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(body.status, Number(params.id)).run();
  if (!result.meta.changes) return json({ message: "Lead was not found." }, 404);
  const lead = await env.DB.prepare("SELECT id, full_name, phone_number, email, service_required, status, created_at FROM leads WHERE id = ?").bind(Number(params.id)).first();
  return json({ lead });
}
__name(onRequestPatch, "onRequestPatch");

// api/admin/leads/[id].js
var selection = "id, full_name, phone_number, email, service_required, status, created_at";
async function onRequestGet({ params, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: "Please sign in to continue." }, 401);
  if (!/^\d+$/.test(params.id)) return json({ message: "Lead ID is invalid." }, 400);
  const lead = await env.DB.prepare(`SELECT ${selection} FROM leads WHERE id = ?`).bind(Number(params.id)).first();
  return lead ? json({ lead }) : json({ message: "Lead was not found." }, 404);
}
__name(onRequestGet, "onRequestGet");
async function onRequestDelete({ params, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: "Please sign in to continue." }, 401);
  if (!data.csrfValid) return json({ message: "Your session expired. Refresh and try again." }, 403);
  if (!/^\d+$/.test(params.id)) return json({ message: "Lead ID is invalid." }, 400);
  const result = await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(Number(params.id)).run();
  return result.meta.changes ? json({ message: "Lead deleted." }) : json({ message: "Lead was not found." }, 404);
}
__name(onRequestDelete, "onRequestDelete");

// api/admin/leads.js
var statuses2 = ["New", "Contacted", "Qualified", "Converted", "Lost"];
var services = ["Project Execution", "Project design", "Design and execution", "Mechanical services", "Electrical services", "Plumbing services"];
var validDate = /* @__PURE__ */ __name((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN((/* @__PURE__ */ new Date(`${value}T00:00:00.000Z`)).getTime()) && (/* @__PURE__ */ new Date(`${value}T00:00:00.000Z`)).toISOString().slice(0, 10) === value, "validDate");
async function onRequestGet2({ request, env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: "Please sign in to continue." }, 401);
  const params = new URL(request.url).searchParams;
  const page = params.get("page") || "1";
  const limit = params.get("limit") || "10";
  const q = params.get("q") || "";
  const service = params.get("service") || "";
  const status = params.get("status") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  if (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 1e6 || !["10", "25", "50"].includes(limit)) return json({ message: "Page or page size is invalid." }, 400);
  if (q.length > 120 || service && !services.includes(service) || status && !statuses2.includes(status)) return json({ message: "Search or filter is invalid." }, 400);
  if (from && !validDate(from) || to && !validDate(to) || from && to && from > to) return json({ message: "Date range is invalid." }, 400);
  const where = [];
  const values = [];
  if (q.trim()) {
    where.push("(instr(lower(full_name), lower(?)) > 0 OR instr(lower(phone_number), lower(?)) > 0 OR instr(lower(email), lower(?)) > 0)");
    values.push(q.trim(), q.trim(), q.trim());
  }
  if (service) {
    where.push("service_required = ?");
    values.push(service);
  }
  if (status) {
    where.push("status = ?");
    values.push(status);
  }
  if (from) {
    where.push("created_at >= ?");
    values.push(`${from}T00:00:00.000Z`);
  }
  if (to) {
    where.push("created_at <= ?");
    values.push(`${to}T23:59:59.999Z`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const totalResult = await env.DB.prepare(`SELECT COUNT(*) AS total FROM leads ${whereSql}`).bind(...values).first();
  const total = Number(totalResult.total);
  const results = await env.DB.prepare(`SELECT id, full_name, phone_number, email, service_required, status, created_at FROM leads ${whereSql}
    ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`).bind(...values, Number(limit), (Number(page) - 1) * Number(limit)).all();
  return json({ leads: results.results, page: Number(page), limit: Number(limit), total, totalPages: Math.max(1, Math.ceil(total / Number(limit))) });
}
__name(onRequestGet2, "onRequestGet");

// api/admin/login.js
function decodeBase64Url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  return Uint8Array.from(atob(normalized + "=".repeat((4 - normalized.length % 4) % 4)), (character) => character.charCodeAt(0));
}
__name(decodeBase64Url, "decodeBase64Url");
async function hashPassword(password, salt) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: decodeBase64Url(salt), iterations: 1e5 }, material, 256);
  return [...new Uint8Array(bits)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function onRequestPost({ request, env, data }) {
  if (!data.csrfValid) return json({ message: "Security check expired. Refresh the page and try again." }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Request body must be valid JSON." }, 400);
  }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || new TextEncoder().encode(password).length > 72) return json({ message: "Enter a valid email and password." }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await sessionHash(ip);
  const now = Math.floor(Date.now() / 1e3);
  const attempts = await env.DB.prepare("SELECT attempts, window_started_at, blocked_until FROM login_attempts WHERE ip_hash = ?").bind(ipHash).first();
  if (attempts?.blocked_until > now) return json({ message: "Too many sign-in attempts. Please wait and try again." }, 429);
  const admin = await env.DB.prepare("SELECT id, email, password_hash FROM admin_users WHERE email = ? COLLATE NOCASE").bind(email).first();
  const [salt, expected] = (admin?.password_hash || "").split("$");
  const actual = salt ? await hashPassword(password, salt) : "";
  if (!admin || !expected || actual !== expected) {
    const windowStart = attempts && now - attempts.window_started_at < 900 ? attempts.window_started_at : now;
    const count = attempts && windowStart === attempts.window_started_at ? attempts.attempts + 1 : 1;
    const blockedUntil = count >= 5 ? now + 900 : 0;
    await env.DB.prepare(`INSERT INTO login_attempts (ip_hash, attempts, window_started_at, blocked_until) VALUES (?, ?, ?, ?)
      ON CONFLICT(ip_hash) DO UPDATE SET attempts = excluded.attempts, window_started_at = excluded.window_started_at, blocked_until = excluded.blocked_until`).bind(ipHash, count, windowStart, blockedUntil).run();
    return json({ message: blockedUntil ? "Too many sign-in attempts. Please wait and try again." : "Email or password is incorrect." }, blockedUntil ? 429 : 401);
  }
  if (!data.csrfValid) return json({ message: "Your session expired. Refresh and try again." }, 403);
  await env.DB.prepare("DELETE FROM login_attempts WHERE ip_hash = ?").bind(ipHash).run();
  const sid = makeToken();
  const csrf = makeToken();
  const nowSeconds = Math.floor(Date.now() / 1e3);
  await env.DB.prepare("DELETE FROM admin_sessions WHERE sid_hash = ?").bind(await sessionHash(data.sessionId || "")).run();
  await env.DB.prepare("INSERT INTO admin_sessions (sid_hash, admin_id, csrf_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(await sessionHash(sid), admin.id, await sessionHash(csrf), nowSeconds + 8 * 60 * 60, nowSeconds).run();
  const response = json({ authenticated: true, email: admin.email, csrfToken: csrf });
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", sessionCookie(sid));
  headers.append("Set-Cookie", clearCsrfCookie());
  return new Response(response.body, { status: response.status, headers });
}
__name(onRequestPost, "onRequestPost");

// api/admin/logout.js
async function onRequestPost2({ env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: "Please sign in to continue." }, 401);
  if (!data.csrfValid) return json({ message: "Your session expired. Refresh and try again." }, 403);
  await env.DB.prepare("DELETE FROM admin_sessions WHERE sid_hash = ?").bind(await sessionHash(data.sessionId)).run();
  return json({ message: "Signed out." }, 200, { "Set-Cookie": sessionCookie("", 0) });
}
__name(onRequestPost2, "onRequestPost");

// api/admin/overview.js
async function onRequestGet3({ env, data }) {
  if (!Number.isInteger(data.session?.admin_id)) return json({ message: "Please sign in to continue." }, 401);
  const counts = await env.DB.prepare(`SELECT COUNT(*) AS total,
    COALESCE(SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END), 0) AS new_leads,
    COALESCE(SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END), 0) AS contacted_leads,
    COALESCE(SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END), 0) AS converted_leads FROM leads`).first();
  const byService = await env.DB.prepare("SELECT service_required AS service, COUNT(*) AS total FROM leads GROUP BY service_required ORDER BY service_required").all();
  return json({ total: counts.total, new: counts.new_leads, contacted: counts.contacted_leads, converted: counts.converted_leads, byService: byService.results });
}
__name(onRequestGet3, "onRequestGet");

// api/admin/session.js
function onRequestGet4({ data }) {
  return json({ authenticated: Number.isInteger(data.session?.admin_id), csrfToken: data.csrfToken || "" });
}
__name(onRequestGet4, "onRequestGet");

// api/contact.js
var services2 = /* @__PURE__ */ new Set(["Project Execution", "Project design", "Design and execution"]);
function clean(value) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim() : "";
}
__name(clean, "clean");
async function onRequestPost3({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Request body must be valid JSON." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ message: "Please provide your contact details." }, 400);
  const lead = {
    fullName: clean(body.fullName),
    phoneNumber: clean(body.phoneNumber),
    email: clean(body.email).toLowerCase(),
    serviceRequired: clean(body.serviceRequired)
  };
  if (!lead.fullName || lead.fullName.length > 100) return json({ message: "Enter your name (up to 100 characters)." }, 400);
  const digits = (lead.phoneNumber.match(/\d/g) || []).length;
  if (!lead.phoneNumber || lead.phoneNumber.length > 30 || !/^[+()\d.\s-]+$/.test(lead.phoneNumber) || digits < 7 || digits > 15) return json({ message: "Enter a valid phone number." }, 400);
  if (lead.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return json({ message: "Enter a valid email address." }, 400);
  if (!services2.has(lead.serviceRequired)) return json({ message: "Choose one of the listed services." }, 400);
  const result = await env.DB.prepare("INSERT INTO leads (full_name, phone_number, email, service_required) VALUES (?, ?, ?, ?)").bind(lead.fullName, lead.phoneNumber, lead.email, lead.serviceRequired).run();
  let emailSent = false;
  if (env.RESEND_API_KEY && env.CONTACT_RECIPIENT && env.SMTP_FROM) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.SMTP_FROM,
          to: [env.CONTACT_RECIPIENT],
          reply_to: lead.email,
          subject: "New Contact Request \u2013 Ultra",
          text: `A new contact request was submitted on the Ultra website.

Full Name: ${lead.fullName}
Phone Number: ${lead.phoneNumber}
Email: ${lead.email}
Service Required: ${lead.serviceRequired}`
        })
      });
      emailSent = response.ok;
    } catch (error) {
      console.error("Lead notification email failed:", error);
    }
  }
  return json({ message: "Thank you. Your request has been received.", emailSent, id: result.meta.last_row_id }, 201);
}
__name(onRequestPost3, "onRequestPost");

// ../.wrangler/tmp/pages-ZkM5c0/functionsRoutes-0.44405995218529815.mjs
var routes = [
  {
    routePath: "/api/admin/leads/:id/status",
    mountPath: "/api/admin/leads/:id",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/admin/leads/:id",
    mountPath: "/api/admin/leads",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/admin/leads/:id",
    mountPath: "/api/admin/leads",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/admin/leads",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/admin/login",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin/logout",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/admin/overview",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/admin/session",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
