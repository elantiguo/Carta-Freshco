const CARTA_CONFIG = {
  telefonoWhatsapp: "573123740187",
  nombreNegocio: "Freshco",
  baseUrlImagenes: "https://raw.githubusercontent.com/elantiguo/Carta-Freshco/main/"
};

const CARTA = [
  {
    id: "de-la-casa", atajo: "De la casa", tono: "violeta",
    titulo: "De la <em>casa</em>",
    nota: "Y nuestros vasos Freshco, cargados de hielo y dulces. Pregunta en la barra por los sabores de hoy.",
    items: [
      { nombre: "Chocofresh", imagen: "img/choco_fresh.jpg", vaso: "corto", hielo: true, adornos: ["lima"], color: ["#ffa63d", "#5a2a0c"], precio: null }
    ],
    fotos: [
      { src: "img/vaso-morado.jpg", alt: "Vaso Freshco morado con gomitas y bolitas de colores" },
      { src: "img/vaso-naranja.jpg", alt: "Vaso Freshco naranja con gomitas y borde picante" }
    ]
  },
  {
    id: "cocteles", atajo: "Cócteles", tono: "rojo",
    titulo: "Los <em>cócteles</em>",
    items: [
      { nombre: "Cuba Libre", imagen: "img/cuba-libre.png", vaso: "alto", hielo: true, color: ["#8a4a1c", "#2a1208"], precio: null },
      { nombre: "Blue Lagoon", imagen: "img/blue-lagoon.webp", vaso: "alto", hielo: true, color: ["#3fd0ff", "#0a55ff"], precio: null },
      { nombre: "Tequila Sunrise", imagen: "img/tequilla-sunrise.jpg", vaso: "alto", hielo: true, color: ["#ffc21a", "#ff2a2a"], precio: null },
      { nombre: "Margarita", imagen: "img/margarita.png", vaso: "margarita", color: ["#f6fbc0", "#b5df52"], precio: null },
      { nombre: "Piña Colada", imagen: "img/piñacolada.jpg", vaso: "huracan", color: ["#fffbe0", "#ffdc6b"], precio: null },
      { nombre: "Daiquiri de fresa", imagen: "img/Daiquiri de fresa.jpg", vaso: "copa", color: ["#ff8a98", "#dd0f2d"], precio: null }
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
      { nombre: "Coronita", imagen: "img/coronita.webp", sabor: "Cerveza mexicana", vaso: "botella", etiqueta: "#ffffff", tapa: "#f5c542", color: ["#fff3b0", "#f0bd2a"], precio: null },
      { nombre: "Poker", imagen: "img/poker.webp", sabor: "Cerveza colombiana", vaso: "botella", etiqueta: "#d81e2c", tapa: "#e8e8e8", color: ["#9a5a1a", "#4a2508"], precio: null },
      { nombre: "Águila", imagen: "img/aguila.webp", sabor: "Cerveza colombiana", vaso: "botella", etiqueta: "#ffd21f", tapa: "#2f6bff", color: ["#b06a1e", "#5a2c0a"], precio: null }
    ]
  }
];
