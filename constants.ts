import { Category, Question } from './types';

export const COURSE_NAME = "Curso de Ecología y Medio Ambiente";
export const PROFESSOR_NAME = "MSc. Alvaro Christiam Silva Espejo";

export const REFLECTIVE_QUESTIONS = [
  "Analiza tus resultados: ¿Cuál es la categoría que más contribuye a tu huella ecológica y qué hábitos específicos (identificados en el cuestionario) influyen en ello?",
  "Investiga y explica: ¿Cómo se relaciona tu 'Día de Sobrecapacidad' personal con el concepto de límites planetarios y biocapacidad?",
  "Propuesta de mejora: Si tuvieras que reducir tu huella a la mitad en los próximos 6 meses, ¿qué sacrificios o cambios tecnológicos necesitarías implementar?",
  "Perspectiva sistémica: ¿Qué barreras infraestructurales o sociales en tu ciudad te impiden tener una huella ecológica más baja (ej. falta de ciclovías, transporte público deficiente)?",
  "Conclusión ética: Teniendo en cuenta que la biocapacidad per cápita global es ~1.6 gha, ¿consideras ético tu nivel de consumo actual? Justifica tu respuesta."
];

export const METRIC_EXPLANATIONS = {
  gha: "La Huella Ecológica se mide en hectáreas globales (gha). Representa el área biológicamente productiva necesaria para proporcionar todo lo que consumes (alimentos, fibra, madera) y para absorber el dióxido de carbono que emites. La media global es 2.7 gha, pero para ser sostenible deberíamos estar bajo 1.6 gha.",
  earths: "El número de Tierras indica cuántos planetas serían necesarios si toda la humanidad viviera con tu estilo de vida. Si es mayor a 1, estás viviendo en 'déficit ecológico', consumiendo recursos más rápido de lo que la Tierra puede regenerarlos.",
  co2: "Tu huella de carbono mide la cantidad total de gases de efecto invernadero (expresada en toneladas de CO2) causadas directa o indirectamente por tus actividades. Es el componente que más rápido crece en la huella ecológica global.",
  overshoot: "El Día de Sobrecapacidad es la fecha aproximada en la que habrías agotado tu 'presupuesto ecológico' anual. A partir de esa fecha, estás operando en números rojos, consumiendo el capital natural de las futuras generaciones."
};

// Comprehensive Question Set
// Updated to be more QUANTITATIVE and specific.
export const QUESTIONS: Question[] = [
  // --- ALIMENTACIÓN (aprox 25-30% del total) ---
  {
    id: 'food_diet_frequency',
    category: Category.FOOD,
    question: '¿Con qué frecuencia consumes productos de origen animal (carne, pescado, huevos, lácteos)?',
    options: [
      { label: 'Diariamente (7 días a la semana, en casi todas las comidas)', value: 0.9 },
      { label: 'Frecuente (4-6 días a la semana, al menos una vez al día)', value: 0.6 },
      { label: 'Moderado (2-3 días a la semana)', value: 0.4 },
      { label: 'Ocasional (1 vez por semana o menos - Flexitariano)', value: 0.2 },
      { label: 'Nunca (Vegano estricto)', value: 0.05 },
    ]
  },
  {
    id: 'food_meat_type',
    category: Category.FOOD,
    question: 'En tu consumo semanal promedio de proteínas, ¿cuál es la fuente predominante?',
    options: [
      { label: 'Carne roja (Res, cordero) - Alta intensidad de carbono', value: 0.8 },
      { label: 'Carne blanca (Pollo, cerdo, pavo)', value: 0.4 },
      { label: 'Pescado y mariscos', value: 0.3 },
      { label: 'Proteína vegetal (Legumbres, tofu) o No consumo carne', value: 0.0 },
    ]
  },
  {
    id: 'food_origin',
    category: Category.FOOD,
    question: '¿Qué porcentaje de tus alimentos estimas que son productos locales (no importados, de temporada)?',
    options: [
      { label: 'Menos del 20% (Mayoría de supermercado / importados)', value: 0.5 },
      { label: 'Entre 20% y 60% (Mezcla balanceada)', value: 0.3 },
      { label: 'Más del 60% (Mercados locales, productos de temporada)', value: 0.1 },
    ]
  },
  {
    id: 'food_processed',
    category: Category.FOOD,
    question: '¿Qué tipo de alimentos predominan en tu dieta diaria?',
    options: [
      { label: 'Alimentos procesados/empacados y comida rápida (>5 veces/semana)', value: 0.6 },
      { label: 'Balanceado entre frescos y procesados', value: 0.3 },
      { label: 'Alimentos frescos, no procesados y cocina en casa', value: 0.1 },
    ]
  },

  // --- VIVIENDA (aprox 20% del total) ---
  {
    id: 'housing_type',
    category: Category.HOUSING,
    question: 'Selecciona la descripción que mejor se ajuste a tu vivienda habitual:',
    options: [
      { label: 'Casa independiente grande (>150 m²)', value: 0.8 },
      { label: 'Departamento o casa mediana (80 - 150 m²)', value: 0.5 },
      { label: 'Departamento pequeño o vivienda social (40 - 80 m²)', value: 0.3 },
      { label: 'Minidepartamento, estudio o habitación (<40 m²)', value: 0.1 },
    ]
  },
  {
    id: 'housing_material',
    category: Category.HOUSING,
    question: '¿Cuál es el material de construcción predominante de tu vivienda?',
    options: [
      { label: 'Ladrillo, Cemento Armado (Alta energía incorporada)', value: 0.3 },
      { label: 'Madera (Certificada o tratada)', value: 0.2 },
      { label: 'Adobe, Quincha o Tapial (Baja energía incorporada)', value: 0.1 },
    ]
  },
  {
    id: 'housing_people',
    category: Category.HOUSING,
    question: '¿Cuántas personas residen permanentemente en tu hogar (incluyéndote)?',
    options: [
      { label: '1 persona (Solo yo)', value: 0.6 },
      { label: '2 personas', value: 0.4 },
      { label: '3-4 personas', value: 0.2 },
      { label: '5 o más personas', value: 0.1 },
    ]
  },
  {
    id: 'housing_electricity',
    category: Category.HOUSING,
    question: '¿Cuál es el promedio mensual aproximado de tu recibo de luz?',
    options: [
      { label: 'Alto (> S/ 250 soles) - Uso intensivo de terma/AC', value: 0.6 },
      { label: 'Medio (S/ 100 - S/ 250 soles)', value: 0.3 },
      { label: 'Bajo (< S/ 100 soles) - Uso eficiente', value: 0.1 },
      { label: 'Muy bajo (Uso de paneles solares o sin conexión)', value: 0.0 },
    ]
  },

  // --- TRANSPORTE (aprox 20-25% del total) ---
  {
    id: 'transport_distance',
    category: Category.TRANSPORT,
    question: '¿Cuántos kilómetros recorres en promedio semanalmente en transporte privado (auto/moto)?',
    options: [
      { label: '> 250 km (Largas distancias diarias)', value: 0.8 },
      { label: '100 - 250 km', value: 0.5 },
      { label: '10 - 100 km', value: 0.2 },
      { label: '< 10 km (Casi nulo)', value: 0.0 },
    ]
  },
  {
    id: 'transport_mode',
    category: Category.TRANSPORT,
    question: '¿Cuál es tu medio de transporte principal (>50% de tus viajes)?',
    options: [
      { label: 'Auto particular (Gasolina/Diesel)', value: 1.2 },
      { label: 'Motocicleta', value: 0.6 },
      { label: 'Transporte Público (Bus, Combi, Tren)', value: 0.3 },
      { label: 'No motorizado (Bicicleta, Scooter eléctrico, Caminando)', value: 0.0 },
    ]
  },
  {
    id: 'transport_carpool',
    category: Category.TRANSPORT,
    question: 'Cuando viajas en auto (propio o taxi), ¿cuántas personas viajan habitualmente?',
    options: [
      { label: 'Solo yo (o solo el conductor y yo)', value: 0.4 },
      { label: '2-3 personas', value: 0.2 },
      { label: '4+ personas (Auto lleno) o No uso auto', value: 0.0 },
    ]
  },
  {
    id: 'transport_flights',
    category: Category.TRANSPORT,
    question: '¿Cuántas horas de vuelo has realizado en los últimos 12 meses?',
    options: [
      { label: '> 20 horas (Varios intercontinentales)', value: 1.5 },
      { label: '10 - 20 horas (1-2 viajes largos)', value: 1.0 },
      { label: '2 - 10 horas (Vuelos nacionales)', value: 0.5 },
      { label: '0 horas (Ningún vuelo)', value: 0.0 },
    ]
  },

  // --- BIENES (aprox 15% del total) ---
  {
    id: 'goods_clothing',
    category: Category.GOODS,
    question: '¿Cuántas prendas de ropa o calzado nuevas adquieres al mes?',
    options: [
      { label: '> 4 prendas al mes (Fast Fashion)', value: 0.6 },
      { label: '1-3 prendas al mes', value: 0.3 },
      { label: 'Esporádicamente (3-4 veces al año)', value: 0.1 },
      { label: 'Casi nunca / Solo Segunda mano', value: 0.05 },
    ]
  },
  {
    id: 'goods_electronics',
    category: Category.GOODS,
    question: '¿Con qué frecuencia renuevas tu Smartphone o Laptop?',
    options: [
      { label: 'Cada 12-18 meses', value: 0.5 },
      { label: 'Cada 2-3 años', value: 0.3 },
      { label: 'Solo cuando se malogra irremediablemente (>4 años)', value: 0.1 },
    ]
  },
  {
    id: 'goods_spending',
    category: Category.GOODS,
    question: 'En comparación con un estudiante promedio, ¿cómo evalúas tu adquisición de bienes materiales (gadgets, accesorios, decoración)?',
    options: [
      { label: 'Muy superior (Comprador frecuente)', value: 0.4 },
      { label: 'Promedio', value: 0.2 },
      { label: 'Minimalista (Solo lo esencial)', value: 0.1 },
    ]
  },

  // --- SERVICIOS (aprox 10-15% del total) ---
  {
    id: 'services_trash',
    category: Category.SERVICES,
    question: '¿Cuál es el volumen aproximado de residuos no reciclables que genera tu hogar a la semana?',
    options: [
      { label: 'Grande (> 3 bolsas de 50L llenas)', value: 0.4 },
      { label: 'Medio (1-2 bolsas de 50L)', value: 0.2 },
      { label: 'Pequeño (< 1 bolsa) - Alta eficiencia', value: 0.1 },
    ]
  },
  {
    id: 'services_recycling',
    category: Category.SERVICES,
    question: '¿Qué porcentaje de tus residuos clasificas correctamente para reciclaje?',
    options: [
      { label: '0% (Todo va a la basura común)', value: 0.3 },
      { label: '50% (Separo botellas y cartón a veces)', value: 0.1 },
      { label: '100% (Separo plásticos, papel, vidrio y orgánicos)', value: 0.0 },
    ]
  },
];

// Reference Data for Charts
export const PERU_AVG_GHA = 1.6; // Valor académico referencial para Perú
export const GLOBAL_AVG_GHA = 2.7; // Media global referencial
export const BIOCAPACITY_PER_PERSON = 1.6; // Biocapacidad disponible por persona

// Category Descriptions for Charts
export const CATEGORY_DESCRIPTIONS = {
  [Category.FOOD]: "Impacto de la producción, procesamiento y transporte de alimentos.",
  [Category.HOUSING]: "Uso de suelo para vivienda y consumo de energía en el hogar.",
  [Category.TRANSPORT]: "Emisiones por movilidad diaria y viajes de larga distancia.",
  [Category.GOODS]: "Huella ecológica incorporada en la compra de ropa, electrónicos y otros bienes.",
  [Category.SERVICES]: "Servicios públicos, infraestructura compartida y gestión de residuos."
};