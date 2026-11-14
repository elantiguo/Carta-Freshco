const CARTA = [
  {
    id: "de-la-casa", atajo: "De la casa", tono: "violeta",
    titulo: "De la <em>casa</em>",
    nota: "Y nuestros vasos Freshco, cargados de hielo y dulces. Pregunta en la barra por los sabores de hoy.",
    items: [
      {
        nombre: "Chocofresh", imagen: "img/choco_fresh.jpg", vaso: "corto", hielo: true, adornos: ["lima"],
        ingredientes: "Tequila de chocolate · limón · jugo de naranja", color: ["#ffa63d", "#5a2a0c"], precio: null
      }
    ],
    fotos: [
      { src: "img/vaso-morado.jpg", alt: "Vaso Freshco morado con gomitas y bolitas de colores" },
      { src: "img/vaso-naranja.jpg", alt: "Vaso Freshco naranja con gomitas y borde picante" }
    ]
  },
  {
    id: "populares", atajo: "Populares", tono: "rojo",
    titulo: "Los <em>populares</em>",
    items: [
      {
        nombre: "Cuba Libre", imagen: "img/cuba-libre.png", vaso: "alto", hielo: true, pitillo: "#111827", adornos: ["lima"],
        ingredientes: "Ron · Coca-Cola · limón", color: ["#8a4a1c", "#2a1208"], precio: null
      },
      {
        nombre: "Blue Lagoon", imagen: "img/blue-lagoon.webp", vaso: "alto", hielo: true, adornos: ["limon", "cereza"],
        ingredientes: "Vodka · curazao azul · limonada", color: ["#3fd0ff", "#0a55ff"], precio: null
      },
      {
        nombre: "Tequila Sunrise", imagen: "img/tequilla-sunrise.jpg", vaso: "alto", hielo: true, adornos: ["naranja", "cereza"],
        ingredientes: "Tequila · jugo de naranja · granadina", color: ["#ffc21a", "#ff2a2a"], precio: null
      },
      {
        nombre: "Margarita", imagen: "img/margarita.png", vaso: "margarita", adornos: ["sal", "lima"],
        ingredientes: "Tequila · triple sec · limón · sal", color: ["#f6fbc0", "#b5df52"], precio: null
      }
    ],
    fotos: [
      { src: "img/coctel-limon.jpg", alt: "Cóctel con rodaja de limón sobre la barra de Freshco" },
      { src: "img/coctel-picante.jpg", alt: "Cóctel con borde picante frente al mural de Freshco" }
    ]
  },
  {
    id: "ron-aguardiente", atajo: "Ron y aguardiente", tono: "hielo",
    titulo: "Ron y <em>aguardiente</em>",
    items: [
      {
        nombre: "Piña Colada", imagen: "img/piñacolada.jpg", vaso: "huracan", pitillo: "#ff4d6d", adornos: ["pina", "cereza"],
        ingredientes: "Ron · crema de coco · jugo de piña", color: ["#fffbe0", "#ffdc6b"], precio: null
      },
      {
        nombre: "Daiquiri de fresa", imagen: "img/Daiquiri de fresa.jpg", vaso: "copa", adornos: ["fresa"],
        ingredientes: "Ron blanco · fresas · limón · azúcar", color: ["#ff8a98", "#dd0f2d"], precio: null
      }
    ]
  },
  {
    id: "cervezas", atajo: "Cervezas", tono: "ambar",
    titulo: "Las <em>cervezas</em>",
    items: [
      {
        nombre: "Coronita", imagen: "img/coronita.webp", vaso: "botella", etiqueta: "#ffffff", tapa: "#f5c542",
        ingredientes: "Cerveza mexicana", color: ["#fff3b0", "#f0bd2a"], precio: null
      },
      {
        nombre: "Poker", imagen: "img/poker.webp", vaso: "botella", etiqueta: "#d81e2c", tapa: "#e8e8e8",
        ingredientes: "Cerveza colombiana", color: ["#9a5a1a", "#4a2508"], precio: null
      },
      {
        nombre: "Águila", imagen: "img/aguila.webp", vaso: "botella", etiqueta: "#ffd21f", tapa: "#2f6bff",
        ingredientes: "Cerveza colombiana", color: ["#b06a1e", "#5a2c0a"], precio: null
      }
    ]
  }
];
