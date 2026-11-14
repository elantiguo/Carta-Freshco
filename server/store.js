// Almacenamiento de pedidos.
// - Con DATABASE_URL (PostgreSQL): persistente, recomendado en producción.
// - Sin DATABASE_URL: archivo JSON en data/pedidos.json (solo para desarrollo local;
//   en Render el disco se borra en cada reinicio).
const fs = require("fs");
const path = require("path");

const ESTADOS = ["nuevo", "preparando", "listo", "entregado", "cancelado"];
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

function crearStoreArchivo(zona) {
  // Día (AAAA-MM-DD) en la zona horaria del negocio
  const diaDe = fecha => new Intl.DateTimeFormat("en-CA", {
    timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date(fecha));

  const dir = path.join(__dirname, "..", "data");
  const archivo = path.join(dir, "pedidos.json");
  let pedidos = [];
  try { pedidos = JSON.parse(fs.readFileSync(archivo, "utf8")); } catch (e) { pedidos = []; }

  let escribiendo = Promise.resolve();
  const persistir = () => {
    const contenido = JSON.stringify(pedidos, null, 2);
    escribiendo = escribiendo.then(async () => {
      await fs.promises.mkdir(dir, { recursive: true });
      const tmp = archivo + ".tmp";
      await fs.promises.writeFile(tmp, contenido);
      await fs.promises.rename(tmp, archivo);
    });
    return escribiendo;
  };

  return {
    tipo: "archivo",
    async iniciar() {},
    async crear(p) {
      const numero = pedidos.reduce((m, x) => Math.max(m, x.numero), 0) + 1;
      const pedido = { ...p, numero, creado: new Date().toISOString(), actualizado: new Date().toISOString() };
      pedidos.push(pedido);
      await persistir();
      return pedido;
    },
    async obtener(id) {
      return pedidos.find(p => p.id === id) || null;
    },
    async listar({ estados, limite = 200 } = {}) {
      return pedidos
        .filter(p => !estados || estados.includes(p.estado))
        .sort((a, b) => b.numero - a.numero)
        .slice(0, limite);
    },
    async cambiarEstado(id, estado) {
      const p = pedidos.find(x => x.id === id);
      if (!p) return null;
      p.estado = estado;
      p.actualizado = new Date().toISOString();
      await persistir();
      return p;
    },
    // Ventas por día de los últimos `dias` días (los cancelados no suman)
    async resumenDiario({ dias = 60 } = {}) {
      const desde = diaDe(Date.now() - (dias - 1) * 864e5);
      const mapa = new Map();
      for (const p of pedidos) {
        const fecha = diaDe(p.creado);
        if (fecha < desde) continue;
        const r = mapa.get(fecha) || { fecha, pedidos: 0, cancelados: 0, unidades: 0, total: 0 };
        if (p.estado === "cancelado") r.cancelados += 1;
        else { r.pedidos += 1; r.unidades += p.unidades || 0; r.total += p.total || 0; }
        mapa.set(fecha, r);
      }
      return [...mapa.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
    async listarPorDia(fecha) {
      return pedidos.filter(p => diaDe(p.creado) === fecha).sort((a, b) => a.numero - b.numero);
    }
  };
}

function crearStorePostgres(url, zona) {
  const { Pool } = require("pg");
  // pg 8 ya trata require/prefer/verify-ca como verify-full; se explicita para evitar el aviso.
  url = url.replace(/([?&]sslmode=)(require|prefer|verify-ca)\b/, "$1verify-full");
  // Si la URL ya indica sslmode (Neon usa sslmode=require) se respeta tal cual.
  const local = /localhost|127\.0\.0\.1/.test(url);
  const ssl = /[?&]sslmode=/.test(url) ? undefined : local ? false : { rejectUnauthorized: false };
  const pool = new Pool({ connectionString: url, ssl, max: 5, idleTimeoutMillis: 30000 });
  pool.on("error", err => console.error("[store] Error en conexión inactiva de PostgreSQL:", err.message));

  const aPedido = r => ({
    ...r.datos,
    id: r.id,
    numero: r.numero,
    estado: r.estado,
    creado: r.creado.toISOString(),
    actualizado: r.actualizado.toISOString()
  });

  return {
    tipo: "postgres",
    async iniciar() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pedidos (
          id          TEXT PRIMARY KEY,
          numero      SERIAL,
          estado      TEXT NOT NULL DEFAULT 'nuevo',
          datos       JSONB NOT NULL,
          creado      TIMESTAMPTZ NOT NULL DEFAULT now(),
          actualizado TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS pedidos_estado_idx ON pedidos (estado, creado DESC);
      `);
    },
    async crear(p) {
      const { id, estado, ...datos } = p;
      const { rows } = await pool.query(
        "INSERT INTO pedidos (id, estado, datos) VALUES ($1, $2, $3) RETURNING *",
        [id, estado, datos]
      );
      return aPedido(rows[0]);
    },
    async obtener(id) {
      const { rows } = await pool.query("SELECT * FROM pedidos WHERE id = $1", [id]);
      return rows[0] ? aPedido(rows[0]) : null;
    },
    async listar({ estados, limite = 200 } = {}) {
      const { rows } = estados
        ? await pool.query("SELECT * FROM pedidos WHERE estado = ANY($1) ORDER BY numero DESC LIMIT $2", [estados, limite])
        : await pool.query("SELECT * FROM pedidos ORDER BY numero DESC LIMIT $1", [limite]);
      return rows.map(aPedido);
    },
    async cambiarEstado(id, estado) {
      const { rows } = await pool.query(
        "UPDATE pedidos SET estado = $2, actualizado = now() WHERE id = $1 RETURNING *",
        [id, estado]
      );
      return rows[0] ? aPedido(rows[0]) : null;
    },
    // Ventas por día de los últimos `dias` días (los cancelados no suman)
    async resumenDiario({ dias = 60 } = {}) {
      const { rows } = await pool.query(`
        SELECT to_char(creado AT TIME ZONE $1, 'YYYY-MM-DD') AS fecha,
               count(*) FILTER (WHERE estado <> 'cancelado')::int AS pedidos,
               count(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados,
               COALESCE(sum((datos->>'unidades')::int) FILTER (WHERE estado <> 'cancelado'), 0)::int AS unidades,
               COALESCE(sum((datos->>'total')::numeric) FILTER (WHERE estado <> 'cancelado'), 0)::float8 AS total
        FROM pedidos
        WHERE (creado AT TIME ZONE $1)::date >= (now() AT TIME ZONE $1)::date - ($2::int - 1)
        GROUP BY 1
        ORDER BY 1 DESC`, [zona, dias]);
      return rows;
    },
    async listarPorDia(fecha) {
      const { rows } = await pool.query(
        "SELECT * FROM pedidos WHERE (creado AT TIME ZONE $1)::date = $2::date ORDER BY numero",
        [zona, fecha]
      );
      return rows.map(aPedido);
    }
  };
}

function crearStore({ zona = "America/Bogota" } = {}) {
  const url = process.env.DATABASE_URL;
  if (url) return crearStorePostgres(url, zona);
  if (process.env.NODE_ENV === "production") {
    console.warn("[store] ADVERTENCIA: DATABASE_URL no está definida. Los pedidos se guardan en un archivo y se PERDERÁN al reiniciar el servidor.");
  }
  return crearStoreArchivo(zona);
}

module.exports = { crearStore, ESTADOS, FECHA_RE };
