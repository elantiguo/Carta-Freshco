// Autenticación del panel: usuario/contraseña desde variables de entorno
// y una cookie de sesión firmada con HMAC (sin estado en el servidor).
const crypto = require("crypto");

const COOKIE = "fc_admin";
const DURACION_MS = 12 * 60 * 60 * 1000; // 12 horas
const PROD = process.env.NODE_ENV === "production";

const USUARIO = process.env.ADMIN_USER || "admin";
let PASSWORD = process.env.ADMIN_PASSWORD;
if (!PASSWORD) {
  if (PROD) throw new Error("Falta la variable de entorno ADMIN_PASSWORD");
  PASSWORD = "freshco-dev";
  console.warn(`[auth] ADMIN_PASSWORD no definida. Modo desarrollo: usuario "${USUARIO}", contraseña "${PASSWORD}"`);
}

let SECRETO = process.env.SESSION_SECRET;
if (!SECRETO) {
  if (PROD) throw new Error("Falta la variable de entorno SESSION_SECRET");
  SECRETO = crypto.randomBytes(32).toString("hex");
}

const sha = s => crypto.createHash("sha256").update(String(s)).digest();
const iguales = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const firmar = datos => crypto.createHmac("sha256", SECRETO).update(datos).digest("base64url");

function credencialesValidas(usuario, password) {
  // Evaluar ambas siempre para no filtrar cuál falló por el tiempo de respuesta
  const okU = iguales(usuario, USUARIO);
  const okP = iguales(password, PASSWORD);
  return okU && okP;
}

function crearToken(usuario) {
  const datos = Buffer.from(JSON.stringify({ u: usuario, exp: Date.now() + DURACION_MS })).toString("base64url");
  return `${datos}.${firmar(datos)}`;
}

function leerToken(token) {
  if (!token || !token.includes(".")) return null;
  const [datos, firma] = token.split(".");
  const esperada = firmar(datos);
  if (firma.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return null;
  try {
    const p = JSON.parse(Buffer.from(datos, "base64url").toString());
    return p.exp > Date.now() ? p : null;
  } catch (e) { return null; }
}

function leerCookie(req, nombre) {
  const h = req.headers.cookie || "";
  for (const parte of h.split(";")) {
    const i = parte.indexOf("=");
    if (i > -1 && parte.slice(0, i).trim() === nombre) return decodeURIComponent(parte.slice(i + 1).trim());
  }
  return null;
}

const opcionesCookie = { httpOnly: true, sameSite: "strict", secure: PROD, path: "/" };

function iniciarSesion(res, usuario) {
  res.cookie(COOKIE, crearToken(usuario), { ...opcionesCookie, maxAge: DURACION_MS });
}

function cerrarSesion(res) {
  res.clearCookie(COOKIE, opcionesCookie);
}

function sesion(req) {
  return leerToken(leerCookie(req, COOKIE));
}

function requiereAdmin(req, res, next) {
  const s = sesion(req);
  if (!s) return res.status(401).json({ error: "No autorizado" });
  req.admin = s;
  next();
}

// Límite simple de intentos de login por IP
const intentos = new Map();
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 8;

function limiteLogin(req, res, next) {
  const ip = req.ip;
  const ahora = Date.now();
  const r = intentos.get(ip);
  if (r && ahora - r.inicio < VENTANA_MS && r.n >= MAX_INTENTOS) {
    return res.status(429).json({ error: "Demasiados intentos. Espera unos minutos." });
  }
  next();
}

function registrarFallo(ip) {
  const ahora = Date.now();
  const r = intentos.get(ip);
  if (!r || ahora - r.inicio >= VENTANA_MS) intentos.set(ip, { inicio: ahora, n: 1 });
  else r.n += 1;
}

function limpiarIntentos(ip) { intentos.delete(ip); }

setInterval(() => {
  const ahora = Date.now();
  for (const [ip, r] of intentos) if (ahora - r.inicio >= VENTANA_MS) intentos.delete(ip);
}, VENTANA_MS).unref();

module.exports = {
  credencialesValidas, iniciarSesion, cerrarSesion, sesion, requiereAdmin,
  limiteLogin, registrarFallo, limpiarIntentos
};
