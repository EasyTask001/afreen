export type Lang = 'en' | 'es';
export type Category = 'dry' | 'fresh';
export interface ProductCopy {
  name: string;
  slug: string;
  note: string;
  description: string;
  buying: string;
  handling: string;
  alt: string;
}
export interface Product {
  id: string;
  category: Category;
  en: ProductCopy;
  es: ProductCopy;
}

export const categories = {
  dry: { en: 'Dry fruits & nuts', es: 'Frutos secos' },
  fresh: { en: 'Fresh produce', es: 'Frutas y verduras' },
};

export const products: Product[] = [
  {
    id: 'walnut', category: 'dry',
    en: {
      name: 'Walnut', slug: 'walnut', note: 'A versatile pantry essential',
      description: 'Walnuts bring a distinctive texture and mild, earthy flavour to retail nut selections. They suit shoppers looking for an everyday pantry ingredient for baking, salads or snacking. Include walnuts in your wholesale enquiry to discuss the presentation that fits your store.',
      buying: 'Tell us whether you need in-shell or shelled walnuts, your intended use and your estimated quantity. Ask about size, kernel colour, packing and origin. The available format and product specifications must be confirmed for your enquiry.',
      handling: 'Keep dry nuts away from moisture, heat and direct sunlight. Confirm storage instructions and shelf life for the specific product and packaging before purchase. Walnuts are tree nuts; review allergen information before repacking.',
      alt: 'Whole walnuts and walnut kernels on a warm stone surface',
    },
    es: {
      name: 'Nueces', slug: 'nueces', note: 'Un esencial versátil para la despensa',
      description: 'Las nueces aportan textura y un sabor suave a la selección de frutos secos de tu negocio. Son una alternativa para clientes que buscan ingredientes para repostería, ensaladas o colaciones. Inclúyelas en tu consulta mayorista para evaluar una presentación adecuada para tu tienda.',
      buying: 'Indica si buscas nueces con cáscara o peladas, el uso previsto y la cantidad estimada. Consulta por calibre, color de la pulpa, envase y origen. El formato disponible y las especificaciones se confirman para cada consulta.',
      handling: 'Mantén los frutos secos alejados de la humedad, el calor y la luz directa. Confirma las instrucciones de conservación y la vida útil del producto y su envase antes de comprar. Revisa la información de alérgenos antes de reenvasar.',
      alt: 'Nueces con cáscara y partidas sobre una superficie de piedra cálida',
    },
  },
  {
    id: 'raisins', category: 'dry',
    en: {
      name: 'Raisins', slug: 'raisins', note: 'Small fruit, full of possibility',
      description: 'Raisins are dried grapes with a naturally concentrated sweetness and a chewy texture. They work across a retail pantry range, from baking ingredients to snack mixes. Discuss your preferred type and presentation when preparing a wholesale request with Afreen.',
      buying: 'Specify the colour or type of raisin you are looking for, its intended use and the quantity you have in mind. Ask for ingredients, processing information, packing and origin; do not assume all types or treatments are available.',
      handling: 'Store according to the confirmed product instructions, protected from moisture and excessive heat. Check ingredient and allergen information, including any preservatives or processing aids, before preparing retail labels.',
      alt: 'Dark and golden raisins arranged on a warm stone surface',
    },
    es: {
      name: 'Pasas', slug: 'pasas', note: 'Pequeñas, con muchas posibilidades',
      description: 'Las pasas son uvas deshidratadas de dulzor concentrado y textura suave. Se integran en un surtido de despensa, desde ingredientes para repostería hasta mezclas para colaciones. Consulta por el tipo y la presentación que necesitas para tu negocio con Afreen.',
      buying: 'Indica el color o tipo de pasa que buscas, su uso y la cantidad estimada. Solicita información sobre ingredientes, procesamiento, envase y origen; la disponibilidad de tipos y tratamientos debe confirmarse para cada consulta.',
      handling: 'Conserva según las instrucciones del producto confirmado, protegido de la humedad y del calor excesivo. Revisa los ingredientes y la información de alérgenos, incluidos posibles conservantes, antes de preparar etiquetas de venta.',
      alt: 'Pasas oscuras y rubias sobre una superficie de piedra cálida',
    },
  },
  {
    id: 'almonds', category: 'dry',
    en: {
      name: 'Almonds', slug: 'almonds', note: 'A familiar favourite, many uses',
      description: 'Almonds are a familiar choice for nut displays, baking ingredients and snack assortments. Their firm texture makes the format especially relevant to the end use. Use your enquiry to outline the almond presentation your retail customers need.',
      buying: 'Let us know whether your preference is whole almonds or another presentation, and whether you require a particular treatment. Ask about size, skin, ingredients, packing and origin. Formats and quantities are subject to confirmation.',
      handling: 'Protect almonds from humidity, strong odours and heat. Request storage and shelf-life guidance for the confirmed pack. Almonds are tree nuts; ensure allergen information remains available if the product is repacked for retail.',
      alt: 'Whole almonds with a small bowl on a warm stone surface',
    },
    es: {
      name: 'Almendras', slug: 'almendras', note: 'Un clásico para distintos usos',
      description: 'Las almendras son una opción conocida para exhibiciones de frutos secos, ingredientes de repostería y mezclas para colaciones. Su textura firme hace que la presentación sea relevante según el uso. Describe en tu consulta el formato que necesitan los clientes de tu tienda.',
      buying: 'Cuéntanos si prefieres almendras enteras u otra presentación y si necesitas un tratamiento específico. Consulta por calibre, piel, ingredientes, envase y origen. Los formatos y las cantidades se confirman en cada consulta.',
      handling: 'Protege las almendras de la humedad, los olores intensos y el calor. Solicita indicaciones de conservación y vida útil para el envase confirmado. Mantén disponible la información de alérgenos si reenvasas el producto para la venta.',
      alt: 'Almendras enteras junto a un pequeño recipiente sobre piedra cálida',
    },
  },
  {
    id: 'orange', category: 'fresh',
    en: {
      name: 'Orange', slug: 'orange', note: 'Citrus for the everyday basket',
      description: 'Oranges are a recognisable citrus staple for fresh-produce displays. Retail requirements can differ between fruit intended for eating and fruit intended for juicing. Tell Afreen what your customers are looking for so your wholesale enquiry can address the right characteristics.',
      buying: 'Include your preferred use, estimated quantity and any variety or size requirements. Ask about origin, maturity, skin appearance and packing. Seasonal availability and the specific characteristics of the proposed fruit need confirmation.',
      handling: 'Handle fruit gently and keep damaged pieces separate. Confirm suitable storage conditions and expected keeping time for the proposed variety and maturity. Plan display quantities around your own store conditions and turnover.',
      alt: 'Whole oranges with green leaves and a cut orange on stone',
    },
    es: {
      name: 'Naranjas', slug: 'naranjas', note: 'Cítricos para la compra de cada día',
      description: 'Las naranjas son un clásico en las exhibiciones de frutas frescas. Los requisitos pueden variar entre fruta para consumo de mesa y fruta destinada a jugo. Cuéntale a Afreen qué buscan tus clientes para orientar tu consulta mayorista hacia las características adecuadas.',
      buying: 'Incluye el uso previsto, la cantidad estimada y los requisitos de variedad o calibre. Consulta por origen, madurez, aspecto de la cáscara y envase. La disponibilidad estacional y las características de la fruta propuesta requieren confirmación.',
      handling: 'Manipula la fruta con cuidado y separa las piezas dañadas. Confirma las condiciones de conservación y la duración esperada según la variedad y madurez. Ajusta la exhibición a las condiciones y rotación de tu tienda.',
      alt: 'Naranjas enteras con hojas verdes y una naranja cortada sobre piedra',
    },
  },
  {
    id: 'apple', category: 'fresh',
    en: {
      name: 'Apple', slug: 'apple', note: 'A fresh-produce cornerstone',
      description: 'Apples offer a broad range of textures, colours and flavour profiles for a retail fruit assortment. The right selection depends on the preferences of your customers and your intended display. Discuss variety and presentation as part of your wholesale enquiry.',
      buying: 'Share your preferred variety, colour, size and estimated volume. Ask about firmness, maturity, origin and packing, and confirm which options can be proposed. A catalogue image is illustrative and does not establish the variety available.',
      handling: 'Avoid rough handling that can bruise the fruit. Confirm storage guidance for the specific variety and maturity, and consider compatibility with other produce in your storage area. Inspect fruit as it moves into your retail display.',
      alt: 'Red apples and one sliced apple on a warm stone surface',
    },
    es: {
      name: 'Manzanas', slug: 'manzanas', note: 'Un pilar del surtido de frutas',
      description: 'Las manzanas ofrecen distintas texturas, colores y perfiles de sabor para el surtido de una frutería o almacén. La selección depende de las preferencias de tus clientes y de la exhibición prevista. Consulta por variedad y presentación al preparar tu solicitud mayorista.',
      buying: 'Comparte la variedad, el color, el calibre y el volumen estimado que necesitas. Pregunta por firmeza, madurez, origen y envase, y confirma qué opciones se pueden proponer. La imagen es ilustrativa y no acredita una variedad disponible.',
      handling: 'Evita golpes que puedan machucar la fruta. Confirma las indicaciones de conservación según la variedad y madurez, y considera su compatibilidad con otros productos almacenados. Revisa las piezas al pasarlas a la exhibición.',
      alt: 'Manzanas rojas y una manzana cortada sobre una superficie de piedra cálida',
    },
  },
  {
    id: 'mandarin', category: 'fresh',
    en: {
      name: 'Mandarin', slug: 'mandarin', note: 'Easy to enjoy, easy to recognise',
      description: 'Mandarins bring a smaller citrus option to the fresh-produce aisle. Peel characteristics, flavour and seed content can vary by variety. Outline your preferences in a wholesale request to help establish the most suitable option for your retail assortment.',
      buying: 'Tell us your target size, preferred variety if known, quantity and intended retail presentation. Ask about peel condition, maturity, seed characteristics and packing. Variety and seasonal availability are confirmed for each enquiry.',
      handling: 'Treat the skin gently and avoid crushing fruit in storage or display. Confirm storage conditions and keeping guidance for the proposed fruit. Remove damaged pieces promptly as part of your normal produce checks.',
      alt: 'Mandarins with green leaves and peeled segments on warm stone',
    },
    es: {
      name: 'Mandarinas', slug: 'mandarinas', note: 'Un cítrico fácil de disfrutar',
      description: 'Las mandarinas incorporan un cítrico de menor tamaño al surtido de frutas frescas. La facilidad de pelado, el sabor y la presencia de semillas varían según la variedad. Describe tus preferencias en la consulta mayorista para evaluar una opción adecuada para tu negocio.',
      buying: 'Indica el calibre, la variedad si la conoces, la cantidad y la presentación para venta que necesitas. Consulta por condición de la cáscara, madurez, semillas y envase. La variedad y la disponibilidad estacional se confirman en cada consulta.',
      handling: 'Manipula la cáscara con cuidado y evita aplastar la fruta durante el almacenamiento o exhibición. Confirma las condiciones de conservación de la fruta propuesta. Retira las piezas dañadas durante la revisión habitual del surtido.',
      alt: 'Mandarinas con hojas verdes y gajos pelados sobre piedra cálida',
    },
  },
  {
    id: 'grapes', category: 'fresh',
    en: {
      name: 'Grapes', slug: 'grapes', note: 'A colourful addition to the display',
      description: 'Table grapes add colour and a distinctive bunch presentation to a retail fruit range. Varieties differ in colour, berry size, texture and seed content. Share the characteristics your customers prefer when you include grapes in your wholesale request.',
      buying: 'Specify your preferred colour or variety, seed preference, expected quantity and retail format. Ask about bunch condition, berry firmness, origin and packing. Confirm the actual variety and availability rather than relying on the illustrative image.',
      handling: 'Grape bunches need gentle handling to limit berry damage. Follow the confirmed storage and moisture-management instructions for the proposed product. Review bunch condition when receiving and preparing fruit for display.',
      alt: 'Green and dark grape bunches on a warm stone surface',
    },
    es: {
      name: 'Uvas', slug: 'uvas', note: 'Color para la exhibición de tu tienda',
      description: 'Las uvas de mesa aportan color y una presentación en racimos al surtido de frutas. Las variedades se diferencian por color, tamaño, textura y semillas. Comparte las características que prefieren tus clientes cuando incluyas uvas en tu solicitud mayorista.',
      buying: 'Indica el color o la variedad, la preferencia de semillas, la cantidad y el formato de venta. Consulta por condición del racimo, firmeza, origen y envase. Confirma la variedad y disponibilidad reales en lugar de basarte en la imagen ilustrativa.',
      handling: 'Los racimos requieren una manipulación cuidadosa para evitar daños. Sigue las instrucciones de conservación y manejo de humedad del producto confirmado. Revisa la condición de los racimos al recibirlos y prepararlos para exhibición.',
      alt: 'Racimos de uvas verdes y oscuras sobre una superficie de piedra cálida',
    },
  },
  {
    id: 'grapefruit', category: 'fresh',
    en: {
      name: 'Grapefruit', slug: 'grapefruit', note: 'A distinctive citrus character',
      description: 'Grapefruit provides a citrus option with a characteristically tart flavour for a fresh-fruit range. Flesh colour, size and flavour differ by variety. Use your wholesale enquiry to describe the grapefruit profile and retail presentation that would suit your store.',
      buying: 'Mention your preferred flesh colour or variety, size, quantity and intended use. Ask for maturity, origin and packing details. The fruit shown is illustrative; colour and variety of any proposed supply must be confirmed separately.',
      handling: 'Protect the peel from damage and inspect fruit during normal stock rotation. Confirm the storage conditions and expected keeping time for the proposed fruit. Keep presentation requirements in mind when deciding display quantities.',
      alt: 'Whole grapefruit and a pink grapefruit half on warm stone',
    },
    es: {
      name: 'Pomelos', slug: 'pomelos', note: 'Un perfil cítrico distintivo',
      description: 'Los pomelos ofrecen una alternativa cítrica de sabor característicamente ácido para un surtido de fruta fresca. El color de la pulpa, el tamaño y el sabor dependen de la variedad. Describe en tu consulta mayorista el perfil y la presentación adecuados para tu tienda.',
      buying: 'Menciona el color de pulpa o variedad, el calibre, la cantidad y el uso previsto. Pide detalles de madurez, origen y envase. La fruta de la imagen es ilustrativa; el color y la variedad de una propuesta deben confirmarse por separado.',
      handling: 'Protege la cáscara de los golpes y revisa las piezas durante la rotación habitual. Confirma las condiciones de conservación y la duración esperada de la fruta propuesta. Considera la presentación al definir las cantidades para exhibición.',
      alt: 'Pomelos enteros y medio pomelo de pulpa rosada sobre piedra cálida',
    },
  },
  {
    id: 'avocado', category: 'fresh',
    en: {
      name: 'Avocado', slug: 'avocado', note: 'Plan your display around ripeness',
      description: 'Avocados are a familiar part of the Chilean retail produce basket. Ripeness is central to planning a store display and matching fruit to customer use. Tell Afreen the maturity profile you need when including avocados in your wholesale enquiry.',
      buying: 'Include preferred variety, size, ripeness and estimated quantity. Ask about origin, packing and the maturity of the proposed fruit. Do not assume a particular variety or ready-to-eat condition from the catalogue photograph.',
      handling: 'Handle fruit carefully to avoid bruising and assess ripeness as part of normal rotation. Storage conditions depend on maturity and variety; request instructions for the proposed product before planning your receiving and display schedule.',
      alt: 'Whole avocados and an avocado half showing the stone',
    },
    es: {
      name: 'Paltas', slug: 'paltas', note: 'Planifica tu exhibición según madurez',
      description: 'Las paltas forman parte habitual de la compra de frutas y verduras en Chile. La madurez es clave para organizar la exhibición y responder al uso que buscan tus clientes. Cuéntale a Afreen qué estado de madurez necesitas al incluir paltas en tu consulta mayorista.',
      buying: 'Incluye la variedad, el calibre, la madurez y la cantidad estimada. Consulta por origen, envase y estado de la fruta propuesta. La fotografía del catálogo no confirma una variedad específica ni una condición lista para consumo.',
      handling: 'Manipula con cuidado para evitar machucones y evalúa la madurez durante la rotación habitual. La conservación depende del estado y la variedad; pide indicaciones del producto propuesto antes de planificar recepción y exhibición.',
      alt: 'Paltas enteras y media palta con su cuesco',
    },
  },
  {
    id: 'lemon', category: 'fresh',
    en: {
      name: 'Lemon', slug: 'lemon', note: 'Bright citrus for everyday cooking',
      description: 'Lemons bring a widely used cooking and juicing ingredient to the retail produce range. Customers may value different characteristics depending on whether they use the juice, peel or whole fruit. Describe the needs of your store in your wholesale enquiry.',
      buying: 'Indicate intended use, preferred size, variety if known and quantity. Ask about maturity, peel characteristics, origin and packing. Confirm the specifications of the proposed lemons and any handling information relevant to their intended use.',
      handling: 'Avoid damage to the peel and keep affected fruit separate during rotation. Confirm suitable storage conditions for the proposed variety and maturity. Review handling and preparation guidance before communicating product uses to retail customers.',
      alt: 'Yellow lemons with green leaves and a sliced lemon on stone',
    },
    es: {
      name: 'Limones', slug: 'limones', note: 'Un cítrico para la cocina de cada día',
      description: 'Los limones aportan un ingrediente de uso frecuente en cocina y jugos al surtido de frutas y verduras. Los clientes pueden buscar características distintas según usen el jugo, la cáscara o el fruto entero. Describe las necesidades de tu negocio en la consulta mayorista.',
      buying: 'Indica el uso previsto, el calibre, la variedad si la conoces y la cantidad. Consulta por madurez, características de la cáscara, origen y envase. Confirma las especificaciones de los limones propuestos y la información de manejo pertinente.',
      handling: 'Evita dañar la cáscara y separa la fruta afectada durante la rotación. Confirma las condiciones de conservación según variedad y madurez. Revisa las indicaciones de manipulación antes de comunicar usos del producto a tus clientes.',
      alt: 'Limones amarillos con hojas verdes y un limón cortado sobre piedra',
    },
  },
  {
    id: 'beetroot', category: 'fresh',
    en: {
      name: 'Beetroot', slug: 'beetroot', note: 'Earthy colour for the vegetable range',
      description: 'Beetroot is a root vegetable with a distinctive colour and earthy flavour. It belongs in the fresh-produce selection alongside the fruit range, giving retailers a vegetable option for customers planning salads, cooked dishes and other kitchen uses.',
      buying: 'Specify your preferred size, whether tops are required, the intended presentation and estimated quantity. Ask about condition, origin and packing. Confirm the actual presentation and availability for your enquiry before planning a retail promotion.',
      handling: 'Protect roots from physical damage and confirm storage guidance for the presentation proposed, particularly if leaves are included. Keep normal receiving and rotation checks in place and follow appropriate washing and preparation guidance.',
      alt: 'Whole beetroots and a sliced beetroot showing deep red rings',
    },
    es: {
      name: 'Betarragas', slug: 'betarragas', note: 'Color y sabor para el surtido de verduras',
      description: 'La betarraga es una hortaliza de raíz con un color y sabor característicos. Se incluye entre las frutas y verduras del catálogo, ofreciendo a los comerciantes una opción para clientes que preparan ensaladas, platos cocidos y otras recetas.',
      buying: 'Especifica el calibre, si necesitas hojas, la presentación y la cantidad estimada. Consulta por condición, origen y envase. Confirma la presentación real y la disponibilidad en tu consulta antes de planificar una promoción en tu tienda.',
      handling: 'Protege las raíces de golpes y confirma las indicaciones de conservación para la presentación propuesta, especialmente si incluye hojas. Mantén las revisiones habituales de recepción y rotación y sigue las recomendaciones de lavado y preparación.',
      alt: 'Betarragas enteras y una cortada con anillos de color rojo intenso',
    },
  },
  {
    id: 'cherry', category: 'fresh',
    en: {
      name: 'Cherry', slug: 'cherry', note: 'A seasonal highlight for your store',
      description: 'Cherries bring a recognisable seasonal fruit to the retail assortment. Colour, firmness and size are useful points to discuss when assessing a proposed selection. Include the presentation you have in mind when preparing a cherry enquiry with Afreen.',
      buying: 'Let us know your preferred size or variety, quantity and retail presentation. Ask about stem condition, firmness, packing and origin. Seasonal availability and all product specifications must be confirmed for the particular enquiry.',
      handling: 'Handle cherries gently and confirm the temperature and storage guidance for the proposed product. Review fruit condition during receiving and rotation. Plan display quantities with the confirmed maturity and your own retail conditions in mind.',
      alt: 'Deep red cherries with stems and green leaves on warm stone',
    },
    es: {
      name: 'Cerezas', slug: 'cerezas', note: 'Un acento de temporada para tu tienda',
      description: 'Las cerezas incorporan una fruta de temporada reconocible al surtido de un comercio. El color, la firmeza y el calibre son puntos útiles para evaluar una selección propuesta. Incluye la presentación que buscas al preparar una consulta por cerezas con Afreen.',
      buying: 'Cuéntanos el calibre o variedad, la cantidad y la presentación para venta que necesitas. Consulta por condición del pedicelo, firmeza, envase y origen. La disponibilidad estacional y las especificaciones deben confirmarse para cada consulta.',
      handling: 'Manipula las cerezas con cuidado y confirma la temperatura y las indicaciones de conservación del producto propuesto. Revisa su condición en recepción y rotación. Planifica la exhibición según la madurez confirmada y las condiciones de tu tienda.',
      alt: 'Cerezas de color rojo intenso con pedicelos y hojas verdes sobre piedra cálida',
    },
  },
];

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
export function searchProducts(query: string, category: Category | 'all'): Product[] {
  const term = normalize(query);
  return products.filter(p => (category === 'all' || p.category === category) &&
    normalize(`${p.en.name} ${p.es.name} ${p.en.note} ${p.es.note} ${p.id === 'lemon' ? 'limón' : ''}`).includes(term));
}
