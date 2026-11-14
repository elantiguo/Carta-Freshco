const CARTA_CONFIG = {
  telefonoWhatsapp: "573123740187",
  nombreNegocio: "Freshco",
  urlWeb: "https://carta-freshco-j7at.onrender.com",
  baseUrlImagenes: "https://raw.githubusercontent.com/elantiguo/Carta-Freshco/main/",
  zonaHoraria: "America/Bogota",
  // Días de promoción (formato AAAA-MM-DD, hora de Colombia)
  diasPromo: ["2026-11-14", "2026-11-21"]
};

// Precios: { normal, promo, domicilio, domicilioPromo }. Solo "normal" es obligatorio.
// Se pueden poner en la sección (aplica a todos sus productos) o en cada producto.
const P_COCTEL = { normal: 15000, promo: 14000 };

const CARTA = [
  {
    id: "de-la-casa", atajo: "De la casa", tono: "violeta",
    titulo: "De la <em>casa</em>",
    nota: "Y nuestros vasos Freshco, cargados de hielo y dulces. Pregunta en la barra por los sabores de hoy.",
    items: [
      { nombre: "Chocofresh", imagen: "img/choco_fresh.jpg", vaso: "corto", hielo: true, adornos: ["lima"], color: ["#ffa63d", "#5a2a0c"] }
    ],
    fotos: [
      { src: "img/vaso-morado.jpg", alt: "Vaso Freshco morado con gomitas y bolitas de colores" },
      { src: "img/vaso-naranja.jpg", alt: "Vaso Freshco naranja con gomitas y borde picante" }
    ]
  },
  {
    id: "cocteles", atajo: "Cócteles", tono: "rojo",
    titulo: "Los <em>cócteles</em>",
    precios: P_COCTEL,
    items: [
      { nombre: "Cuba Libre", imagen: "img/cuba-libre.png", vaso: "alto", hielo: true, color: ["#8a4a1c", "#2a1208"] },
      { nombre: "Blue Lagoon", imagen: "img/blue-lagoon.webp", vaso: "alto", hielo: true, color: ["#3fd0ff", "#0a55ff"] },
      { nombre: "Tequila Sunrise", imagen: "img/tequilla-sunrise.jpg", vaso: "alto", hielo: true, color: ["#ffc21a", "#ff2a2a"] },
      { nombre: "Margarita", imagen: "img/margarita.png", vaso: "margarita", color: ["#f6fbc0", "#b5df52"] },
      { nombre: "Piña Colada", imagen: "img/piñacolada.jpg", vaso: "huracan", color: ["#fffbe0", "#ffdc6b"] },
      { nombre: "Daiquiri de fresa", imagen: "img/Daiquiri de fresa.jpg", vaso: "copa", color: ["#ff8a98", "#dd0f2d"] }
    ],
    fotos: [
      { src: "img/coctel-limon.jpg", alt: "Cóctel con rodaja de limón sobre la barra de Freshco" },
      { src: "img/coctel-picante.jpg", alt: "Cóctel con borde picante frente al mural de Freshco" }
    ]
  },
  {
    id: "con-licor", atajo: "Granizados con licor", tono: "violeta",
    titulo: "Granizados <em>con licor</em>",
    simple: true,
    precios: { normal: 16000, promo: 15000, domicilio: 17000, domicilioPromo: 16000 },
    foto: { src: "img/vaso-morado.jpg", alt: "Granizado Freshco con licor" },
    items: [
      { nombre: "Ardiente" },
      { nombre: "Mora Blue" },
      { nombre: "Fresa Intensa" },
      { nombre: "Mar Azul" },
      { nombre: "Caipirinha" },
      { nombre: "Rosé Summer" },
      { nombre: "Smirnoff" },
      { nombre: "Sex On The Beach" },
      { nombre: "Mulberry" },
      { nombre: "Margarita" },
      { nombre: "Jumanji" }
    ]
  },
  {
    id: "sin-licor", atajo: "Granizados sin licor", tono: "hielo",
    titulo: "Granizados <em>sin licor</em>",
    simple: true,
    precios: { normal: 15000, promo: 14000, domicilio: 17000, domicilioPromo: 16000 },
    foto: { src: "img/vaso-naranja.jpg", alt: "Granizado Freshco sin licor" },
    items: [
      { nombre: "Mora Azul" },
      { nombre: "Maracuyá" },
      { nombre: "Mango Biche" },
      { nombre: "Bubbachella" },
      { nombre: "Sandía" },
      { nombre: "Frambuesa" },
      { nombre: "Fresa" }
    ]
  },
  {
    id: "cervezas", atajo: "Cervezas", tono: "ambar",
    titulo: "<em>cervezas</em>",
    items: [
      { nombre: "Coronita", imagen: "img/coronita.webp", sabor: "Cerveza mexicana", vaso: "botella", etiqueta: "#ffffff", tapa: "#f5c542", color: ["#fff3b0", "#f0bd2a"], precios: { normal: 5000, promo: 4000 } },
      { nombre: "Six pack Coronita", imagen: "img/coronita.webp", sabor: "6 Coronitas", vaso: "botella", etiqueta: "#ffffff", tapa: "#f5c542", color: ["#fff3b0", "#f0bd2a"], precios: { normal: 30000, promo: 24000 } },
      { nombre: "Poker", imagen: "img/poker.webp", sabor: "Cerveza colombiana", vaso: "botella", etiqueta: "#d81e2c", tapa: "#e8e8e8", color: ["#9a5a1a", "#4a2508"], precios: { normal: 3500 } },
      { nombre: "Águila", imagen: "img/aguila.webp", sabor: "Cerveza colombiana", vaso: "botella", etiqueta: "#ffd21f", tapa: "#2f6bff", color: ["#b06a1e", "#5a2c0a"], precios: { normal: 3500 } }
    ]
  }
];

// ---------- Precios y promociones (usado por la carta y por el servidor) ----------
function fechaColombia(fecha = new Date()) {
  // "en-CA" da el formato AAAA-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CARTA_CONFIG.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(fecha);
}

function esDiaPromo(fecha = new Date()) {
  return (CARTA_CONFIG.diasPromo || []).includes(fechaColombia(fecha));
}

function buscarProducto(id = "") {
  const [sId, nombre] = String(id).split("::");
  const sec = CARTA.find(s => s.id === sId);
  const item = sec && (sec.items || []).find(i => i.nombre === nombre);
  if (!item) return null;
  return {
    item, seccion: sec,
    precios: item.precios || sec.precios || null,
    imagen: item.imagen || (sec.foto && sec.foto.src) || (sec.fotos && sec.fotos[0] && sec.fotos[0].src) || ""
  };
}

// Precio unitario según tipo de entrega y si es día de promo. null si no tiene precio.
function precioDe(precios, { domicilio = false, promo = esDiaPromo() } = {}) {
  if (!precios || precios.normal == null) return null;
  if (domicilio && precios.domicilio != null) {
    return promo && precios.domicilioPromo != null ? precios.domicilioPromo : precios.domicilio;
  }
  return promo && precios.promo != null ? precios.promo : precios.normal;
}

// ---------- Teléfono de contacto (domicilios) ----------
// Acepta "300 123 4567", "+57 300-123-4567", "6011234567"... Devuelve 10 dígitos o null.
// Válido: celular (empieza por 3) o fijo nacional (empieza por 60).
function normalizarTelefono(t) {
  let d = String(t || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("57")) d = d.slice(2);
  return /^(3\d{9}|60\d{8})$/.test(d) ? d : null;
}

function formatearTelefono(d) {
  return d && d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : String(d || "");
}

// ---------- Ubicación: permiso e instrucciones según el celular ----------
// Estado del permiso: "granted", "denied", "prompt" o "desconocido" (navegadores sin Permissions API)
function estadoPermisoUbicacion() {
  if (!navigator.permissions || !navigator.permissions.query) return Promise.resolve("desconocido");
  return navigator.permissions.query({ name: "geolocation" }).then(r => r.state, () => "desconocido");
}

// Navegadores dentro de apps (Instagram, Facebook, TikTok...) suelen no permitir la ubicación
function enNavegadorDeApp() {
  return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Line\//i.test(navigator.userAgent);
}

function instruccionesUbicacion() {
  const ua = navigator.userAgent;
  if (enNavegadorDeApp()) {
    return "Estás dentro de Instagram/Facebook/TikTok, que no deja compartir la ubicación. Toca el menú (⋮ o ···) y elige «Abrir en el navegador» (Chrome o Safari).";
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return "En iPhone: toca «aA» junto a la dirección de la página → Configuración del sitio web → Ubicación → Permitir. Si no aparece: Ajustes → Privacidad y seguridad → Localización (activada) → Sitios web de Safari → «Mientras se usa».";
  }
  if (/Android/i.test(ua)) {
    return "En Android: toca el candado o el ícono junto a la dirección de la página → Permisos → Ubicación → Permitir. Revisa también que la Ubicación del celular esté encendida (desliza desde arriba).";
  }
  return "Toca el candado o el ícono de ubicación en la barra de direcciones → Ubicación → Permitir, y vuelve a intentar.";
}
