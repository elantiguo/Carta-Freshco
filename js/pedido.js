const CONFIG_PEDIDO = {
  telefono: (typeof CARTA_CONFIG !== "undefined" && CARTA_CONFIG.telefonoWhatsapp) ? CARTA_CONFIG.telefonoWhatsapp : "573123740187",
  nombreLocal: (typeof CARTA_CONFIG !== "undefined" && CARTA_CONFIG.nombreNegocio) ? CARTA_CONFIG.nombreNegocio : "Freshco",
  baseUrlImagenes: (typeof CARTA_CONFIG !== "undefined" && CARTA_CONFIG.baseUrlImagenes) ? CARTA_CONFIG.baseUrlImagenes : "https://raw.githubusercontent.com/elantiguo/Carta-Freshco/main/"
};

const STORAGE_KEY = "freshco_pedido_v1";

const Pedido = {
  items: {},

  resolverImagen(id = "", nombre = "", seccion = "") {
    if (typeof CARTA === "undefined") return "";
    const [sId, n] = id.split("::");
    const sec = CARTA.find(s => s.id === sId || s.atajo === seccion || s.id === seccion);
    if (!sec) return "";
    const it = (sec.items || []).find(i => i.nombre === (n || nombre));
    if (it && it.imagen) return it.imagen;
    if (sec.foto && sec.foto.src) return sec.foto.src;
    if (sec.fotos && sec.fotos.length) return sec.fotos[0].src;
    return "";
  },

  init() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.items = data ? JSON.parse(data) : {};
      Object.values(this.items).forEach(it => {
        if (!it.imagen) it.imagen = this.resolverImagen(it.id, it.nombre, it.seccion);
      });
    } catch (e) { this.items = {}; }
  },

  guardar() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("pedido:actualizado", { detail: this.items }));
  },

  obtenerItems() { return Object.values(this.items); },
  obtenerCantidad(id) { return this.items[id] ? this.items[id].cantidad : 0; },

  agregar(id, datos = {}) {
    const nom = datos.nombre || (id.split("::")[1] || "");
    const sec = datos.seccion || (id.split("::")[0] || "");
    if (!this.items[id]) {
      this.items[id] = {
        id, nombre: nom, seccion: sec, precio: datos.precio || null,
        imagen: datos.imagen || this.resolverImagen(id, nom, sec), cantidad: 0
      };
    }
    if (!this.items[id].imagen) {
      this.items[id].imagen = datos.imagen || this.resolverImagen(id, nom, sec);
    }
    this.items[id].cantidad += 1;
    this.guardar();
  },

  decrementar(id) {
    if (!this.items[id]) return;
    this.items[id].cantidad -= 1;
    if (this.items[id].cantidad <= 0) delete this.items[id];
    this.guardar();
  },

  eliminar(id) {
    if (this.items[id]) { delete this.items[id]; this.guardar(); }
  },

  vaciar() { this.items = {}; this.guardar(); },
  totalItems() { return Object.values(this.items).reduce((acc, it) => acc + it.cantidad, 0); },

  totalPrecio() {
    return Object.values(this.items).reduce((acc, it) => acc + ((Number(it.precio) || 0) * it.cantidad), 0);
  },

  tienePrecios() {
    return Object.values(this.items).some(it => it.precio != null && it.precio > 0);
  },

  _codificarUrl(opts = {}) {
    const { tipo: t = "local", mesa: m = "1", nombre: nm = "", direccion: d = "", notas = "" } = opts;
    const its = this.obtenerItems().map(it => ({
      n: it.nombre, c: it.cantidad, s: it.seccion,
      i: it.imagen || this.resolverImagen(it.id, it.nombre, it.seccion)
    }));
    const json = JSON.stringify({ t, m, nm, d, notas, its });
    const base64 = btoa(encodeURIComponent(json));
    const origen = typeof window !== "undefined" ? window.location.origin : "";
    return `${origen}/pedido.html?p=${base64}`;
  },

  _construirLineas({ tipo = "local", mesa = "1", nombre = "", direccion = "", notas = "" } = {}) {
    const items = this.obtenerItems();
    const lineas = [
      `*PEDIDO - ${CONFIG_PEDIDO.nombreLocal.toUpperCase()}*`,
      "============================"
    ];
    if (tipo === "local") {
      lineas.push(`*Modalidad:* En el local`);
      lineas.push(`*Mesa:* Mesa ${mesa}`);
    } else {
      lineas.push(`*Modalidad:* A domicilio`);
      if (nombre.trim()) lineas.push(`*Cliente:* ${nombre.trim()}`);
      if (direccion.trim()) lineas.push(`*Direccion:* ${direccion.trim()}`);
    }
    lineas.push("----------------------------");
    lineas.push("*DETALLE DEL PEDIDO:*");
    items.forEach(it => {
      const extra = it.seccion ? ` (${it.seccion})` : "";
      const precioStr = it.precio ? ` - $${(it.precio * it.cantidad).toLocaleString("es-CO")}` : "";
      lineas.push(`- ${it.cantidad}x ${it.nombre}${extra}${precioStr}`);
    });
    lineas.push("----------------------------");
    lineas.push(`*Total unidades:* ${this.totalItems()}`);
    if (this.tienePrecios()) {
      lineas.push(`*Total estimado:* $${this.totalPrecio().toLocaleString("es-CO")}`);
    }
    if (notas.trim()) {
      lineas.push("----------------------------");
      lineas.push(`*Notas:* ${notas.trim()}`);
    }
    lineas.push("============================");
    lineas.push("¡Gracias! Espero confirmacion.");
    return lineas;
  },

  crearTextoWhatsapp(opts = {}) {
    return this.obtenerItems().length ? this._construirLineas(opts).join("\n") : "";
  },

  crearEnlaceWhatsapp(opts = {}) {
    if (!this.obtenerItems().length) return "";
    const lineas = this._construirLineas(opts);
    lineas.push("----------------------------");
    lineas.push(`Ver pedido con fotos: ${this._codificarUrl(opts)}`);
    const texto = lineas.join("\n");
    const num = CONFIG_PEDIDO.telefono.replace(/\D/g, "");
    return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
  }
};

Pedido.init();
