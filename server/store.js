// Almacenamiento de pedidos.
// - Con DATABASE_URL (PostgreSQL): persistente, recomendado en producción.
// - Sin DATABASE_URL: archivo JSON en data/pedidos.json (solo para desarrollo local;
//   en Render el disco se borra en cada reinicio).
const fs = require("fs");
const path = require("path");

const ESTADOS = ["nuevo", "preparando", "listo", "entregado", "cancelado"];

function crearStoreArchivo() {
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
    }
  };
}

function crearStorePostgres(url) {
  const { Pool } = require("pg");
  const local = /localhost|127\.0\.0\.1/.test(url);
  const pool = new Pool({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });

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
    }
  };
}

function crearStore() {
  const url = process.env.DATABASE_URL;
  if (url) return crearStorePostgres(url);
  if (process.env.NODE_ENV === "production") {
    console.warn("[store] ADVERTENCIA: DATABASE_URL no está definida. Los pedidos se guardan en un archivo y se PERDERÁN al reiniciar el servidor.");
  }
  return crearStoreArchivo();
}

module.exports = { crearStore, ESTADOS };
