const CARTA = [
  {
    id: "de-la-casa", atajo: "De la casa", tono: "violeta",
    titulo: "De la <em>casa</em>",
    nota: "Y nuestros vasos Freshco, cargados de hielo y dulces. Pregunta en la barra por los sabores de hoy.",
    items: [
      { nombre: "Chocofresh", imagen: "img/choco_fresh.jpg", sabor: "Tequila de chocolate con naranja", vaso: "corto", hielo: true, adornos: ["lima"], color: ["#ffa63d", "#5a2a0c"], precio: null }
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
      { nombre: "Cuba Libre", imagen: "img/cuba-libre.png", sabor: "Ron con cola y limón", vaso: "alto", hielo: true, color: ["#8a4a1c", "#2a1208"], precio: null },
      { nombre: "Blue Lagoon", imagen: "img/blue-lagoon.webp", sabor: "Vodka con curazao azul", vaso: "alto", hielo: true, color: ["#3fd0ff", "#0a55ff"], precio: null },
      { nombre: "Tequila Sunrise", imagen: "img/tequilla-sunrise.jpg", sabor: "Tequila con naranja y granadina", vaso: "alto", hielo: true, color: ["#ffc21a", "#ff2a2a"], precio: null },
      { nombre: "Margarita", imagen: "img/margarita.png", sabor: "Tequila con lima y sal", vaso: "margarita", color: ["#f6fbc0", "#b5df52"], precio: null },
      { nombre: "Piña Colada", imagen: "img/piñacolada.jpg", sabor: "Ron con crema de coco y piña", vaso: "huracan", color: ["#fffbe0", "#ffdc6b"], precio: null },
      { nombre: "Daiquiri de fresa", imagen: "img/Daiquiri de fresa.jpg", sabor: "Ron blanco con fresas", vaso: "copa", color: ["#ff8a98", "#dd0f2d"], precio: null }
    ],
    fotos: [
      { src: "img/coctel-limon.jpg", alt: "Cóctel con rodaja de limón sobre la barra de Freshco" },
      { src: "img/coctel-picante.jpg", alt: "Cóctel con borde picante frente al mural de Freshco" }
    ]
  },
  {
    id: "con-licor", atajo: "Con licor", tono: "violeta",
    titulo: "Granizados <em>con licor</em>",
    items: [
      { nombre: "Ardiente", sabor: "Aguardiente con chile", vaso: "alto", hielo: true, color: ["#ff4a3d", "#8b0000"], precio: null },
      { nombre: "Mora Blue", sabor: "Mora con curazao azul", vaso: "alto", hielo: true, color: ["#7b2fff", "#1a0066"], precio: null },
      { nombre: "Fresa Intensa", sabor: "Fresa concentrada con vodka", vaso: "alto", hielo: true, color: ["#ff4466", "#990022"], precio: null },
      { nombre: "Mar Azul", sabor: "Curazao azul con cítricos", vaso: "alto", hielo: true, color: ["#00bfff", "#003366"], precio: null },
      { nombre: "Caipirinha", sabor: "Lima y cachaza brasileña", vaso: "alto", hielo: true, color: ["#c8ff66", "#2e7a00"], precio: null },
      { nombre: "Rosé Summer", sabor: "Vino rosado con frutas", vaso: "alto", hielo: true, color: ["#ffb3c6", "#cc3366"], precio: null },
      { nombre: "Smirnoff", sabor: "Vodka con frutas cítricas", vaso: "alto", hielo: true, color: ["#e0f0ff", "#4dabff"], precio: null },
      { nombre: "Sex On The Beach", sabor: "Durazno, naranja y vodka", vaso: "alto", hielo: true, color: ["#ffaa33", "#ff4444"], precio: null },
      { nombre: "Mulberry", sabor: "Mora silvestre con ron", vaso: "alto", hielo: true, color: ["#c44dbb", "#3d003d"], precio: null },
      { nombre: "Margarita", sabor: "Lima con tequila y sal", vaso: "alto", hielo: true, color: ["#e6ff80", "#669900"], precio: null },
      { nombre: "Jumanji", sabor: "Mix de frutas tropicales con ron", vaso: "alto", hielo: true, color: ["#33cc66", "#004d1a"], precio: null }
    ]
  },
  {
    id: "sin-licor", atajo: "Sin licor", tono: "hielo",
    titulo: "Granizados <em>sin licor</em>",
    items: [
      { nombre: "Mora Azul", sabor: "Mora azul natural", vaso: "alto", hielo: true, color: ["#6644cc", "#220066"], precio: null },
      { nombre: "Maracuyá", sabor: "Fruta de la pasión", vaso: "alto", hielo: true, color: ["#ffcc00", "#cc8800"], precio: null },
      { nombre: "Mango Biche", sabor: "Mango verde", vaso: "alto", hielo: true, color: ["#99cc33", "#336600"], precio: null },
      { nombre: "Bubbachella", sabor: "Tutti frutti", vaso: "alto", hielo: true, color: ["#ff66cc", "#cc0088"], precio: null },
      { nombre: "Sandía", sabor: "Sandía natural", vaso: "alto", hielo: true, color: ["#ff3355", "#880022"], precio: null },
      { nombre: "Frambuesa", sabor: "Frambuesa natural", vaso: "alto", hielo: true, color: ["#ff3377", "#990033"], precio: null },
      { nombre: "Fresa", sabor: "Fresa natural", vaso: "alto", hielo: true, color: ["#ff4455", "#aa0011"], precio: null }
    ]
  },
  {
    id: "cervezas", atajo: "Cervezas", tono: "ambar",
    titulo: "Las <em>cervezas</em>",
    items: [
      { nombre: "Coronita", imagen: "img/coronita.webp", sabor: "Cerveza mexicana", vaso: "botella", etiqueta: "#ffffff", tapa: "#f5c542", color: ["#fff3b0", "#f0bd2a"], precio: null },
      { nombre: "Poker", imagen: "img/poker.webp", sabor: "Cerveza colombiana", vaso: "botella", etiqueta: "#d81e2c", tapa: "#e8e8e8", color: ["#9a5a1a", "#4a2508"], precio: null },
      { nombre: "Águila", imagen: "img/aguila.webp", sabor: "Cerveza colombiana", vaso: "botella", etiqueta: "#ffd21f", tapa: "#2f6bff", color: ["#b06a1e", "#5a2c0a"], precio: null }
    ]
  }
];
