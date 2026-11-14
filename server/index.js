const path = require("path");
const crypto = require("crypto");
const express = require("express");
const { crearStore, ESTADOS, FECHA_RE } = require("./store");
const { cargarCarta } = require("./carta");
const auth = require("./auth");

const RAIZ = path.join(__dirname, "..");
const PUERTO = process.env.PORT || 3000;

const carta = cargarCarta();
const store = crearStore({ zona: carta.zonaHoraria });
const app = express();

app.set("trust proxy", 1); // Render está detrás de un proxy (IP real y HTTPS)
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.set({
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin"
  });
  next();
});

app.use("/api", express.json({ limit: "20kb" }), (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ---------- Utilidades ----------
const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function validarPedido(body) {
  const tipo = body.tipo === "domicilio" ? "domicilio" : body.tipo === "local" ? "local" : null;
  if (!tipo) return { error: "Tipo de pedido inválido" };

  const mesa = tipo === "local" ? texto(String(body.mesa ?? ""), 3) : "";
  if (tipo === "local" && !/^\d{1,3}$/.test(mesa)) return { error: "Mesa inválida" };

  const nombre = texto(body.nombre, 40);
  const direccion = texto(body.direccion, 80);
  if (tipo === "domicilio" && (!nombre || !direccion)) return { error: "Nombre y dirección son obligatorios para domicilio" };

  if (!Array.isArray(body.items) || !body.items.length) return { error: "El pedido está vacío" };
  if (body.items.length > 40) return { error: "Demasiados productos distintos" };

  // Los precios se calculan aquí (fecha de Colombia), nunca se toman del cliente
  const promo = carta.esDiaPromo();
  const items = [];
  for (const it of body.items) {
    const prod = carta.producto(it && it.id);
    const cantidad = Number(it && it.cantidad);
    if (!prod) return { error: `Producto no encontrado: ${String(it && it.id).slice(0, 60)}` };
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) return { error: "Cantidad inválida" };
    const precio = carta.precio(prod.precios, { domicilio: tipo === "domicilio", promo });
    items.push({ id: String(it.id), nombre: prod.nombre, seccion: prod.seccion, imagen: prod.imagen, precio, cantidad });
  }

  const unidades = items.reduce((a, i) => a + i.cantidad, 0);
  const total = items.some(i => i.precio != null) ? items.reduce((a, i) => a + (i.precio || 0) * i.cantidad, 0) : null;

  return {
    pedido: {
      id: crypto.randomUUID(),
      estado: "nuevo",
      tipo,
      mesa,
      nombre: tipo === "domicilio" ? nombre : "",
      direccion: tipo === "domicilio" ? direccion : "",
      notas: texto(body.notas, 120),
      items,
      unidades,
      total,
      promo
    }
  };
}

const asyncRuta = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- API pública ----------
app.post("/api/pedidos", asyncRuta(async (req, res) => {
  const { error, pedido } = validarPedido(req.body || {});
  if (error) return res.status(400).json({ error });
  const creado = await store.crear(pedido);
  res.status(201).json({ id: creado.id, numero: creado.numero });
}));

// Seguimiento para el cliente (el id es un UUID imposible de adivinar)
app.get("/api/pedidos/:id", asyncRuta(async (req, res) => {
  const p = await store.obtener(req.params.id);
  if (!p) return res.status(404).json({ error: "Pedido no encontrado" });
  res.json(p);
}));

// ---------- Autenticación ----------
app.post("/api/auth/login", auth.limiteLogin, (req, res) => {
  const { usuario, password } = req.body || {};
  if (typeof usuario !== "string" || typeof password !== "string" || !auth.credencialesValidas(usuario, password)) {
    auth.registrarFallo(req.ip);
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }
  auth.limpiarIntentos(req.ip);
  auth.iniciarSesion(res, usuario);
  res.json({ usuario });
});

app.post("/api/auth/logout", (req, res) => {
  auth.cerrarSesion(res);
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  const s = auth.sesion(req);
  if (!s) return res.status(401).json({ error: "No autorizado" });
  res.json({ usuario: s.u });
});

// ---------- API de administración ----------
app.get("/api/admin/pedidos", auth.requiereAdmin, asyncRuta(async (req, res) => {
  const estados = typeof req.query.estados === "string" && req.query.estados
    ? req.query.estados.split(",").filter(e => ESTADOS.includes(e))
    : null;
  res.json(await store.listar({ estados }));
}));

// Historial: ventas por día (hora de Colombia)
app.get("/api/admin/resumen", auth.requiereAdmin, asyncRuta(async (req, res) => {
  const dias = Math.min(Math.max(parseInt(req.query.dias, 10) || 60, 1), 366);
  res.json(await store.resumenDiario({ dias }));
}));

// Historial: todos los pedidos de un día (AAAA-MM-DD)
app.get("/api/admin/dia/:fecha", auth.requiereAdmin, asyncRuta(async (req, res) => {
  if (!FECHA_RE.test(req.params.fecha)) return res.status(400).json({ error: "Fecha inválida" });
  res.json(await store.listarPorDia(req.params.fecha));
}));

app.patch("/api/admin/pedidos/:id", auth.requiereAdmin, asyncRuta(async (req, res) => {
  const estado = req.body && req.body.estado;
  if (!ESTADOS.includes(estado)) return res.status(400).json({ error: "Estado inválido" });
  const p = await store.cambiarEstado(req.params.id, estado);
  if (!p) return res.status(404).json({ error: "Pedido no encontrado" });
  res.json(p);
}));

app.use("/api", (req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ---------- Archivos estáticos (solo lo público) ----------
const estatico = { dotfiles: "ignore", maxAge: "1h" };
app.use("/css", express.static(path.join(RAIZ, "css"), estatico));
app.use("/js", express.static(path.join(RAIZ, "js"), estatico));
app.use("/img", express.static(path.join(RAIZ, "img"), { ...estatico, maxAge: "7d" }));

const pagina = archivo => (req, res) => res.sendFile(path.join(RAIZ, archivo));
app.get(["/", "/index.html"], pagina("index.html"));
app.get("/pedido.html", pagina("pedido.html"));
app.get(["/admin", "/admin.html"], (req, res, next) => { res.set("Cache-Control", "no-store"); next(); }, pagina("admin.html"));

app.use((req, res) => res.status(404).sendFile(path.join(RAIZ, "404.html")));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "JSON inválido" });
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

store.iniciar()
  .then(() => app.listen(PUERTO, () => console.log(`Freshco en http://localhost:${PUERTO} (almacenamiento: ${store.tipo})`)))
  .catch(err => { console.error("No se pudo iniciar el almacenamiento:", err); process.exit(1); });
