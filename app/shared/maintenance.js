// ========================================
// THE RIDES CLUB — Shared Maintenance Constants
// Standard motorcycle service presets & rules
// ========================================

const MAINTENANCE_CATEGORIES = {
  oil_change: {
    id: 'oil_change',
    label: 'Engine Oil & Filter',
    icon: '🛢️',
    color: '#D04D44',
    defaultIntervalKm: 3000,
    defaultIntervalMonths: 6,
    description: 'Fresh engine oil and oil filter replacement',
  },
  chain: {
    id: 'chain',
    label: 'Chain Clean & Lube',
    icon: '⛓️',
    color: '#FEC60F',
    defaultIntervalKm: 500,
    defaultIntervalMonths: 1,
    description: 'Chain cleaning, lubrication, and tension check',
  },
  tires: {
    id: 'tires',
    label: 'Tires (Front & Rear)',
    icon: '🛞',
    color: '#3043E4',
    defaultIntervalKm: 12000,
    defaultIntervalMonths: 24,
    description: 'Tire replacement, balancing, and tread depth check',
  },
  brakes: {
    id: 'brakes',
    label: 'Brakes & Fluid',
    icon: '🛑',
    color: '#D04D44',
    defaultIntervalKm: 8000,
    defaultIntervalMonths: 12,
    description: 'Brake pads inspection/replacement & fluid flush',
  },
  spark_plugs: {
    id: 'spark_plugs',
    label: 'Spark Plugs',
    icon: '⚡',
    color: '#FEC60F',
    defaultIntervalKm: 10000,
    defaultIntervalMonths: 12,
    description: 'Spark plug replacement and gap check',
  },
  coolant: {
    id: 'coolant',
    label: 'Coolant Flush',
    icon: '🧊',
    color: '#3043E4',
    defaultIntervalKm: 15000,
    defaultIntervalMonths: 24,
    description: 'Radiator coolant drain and refill',
  },
  battery: {
    id: 'battery',
    label: 'Battery & Electrical',
    icon: '🔋',
    color: '#555555',
    defaultIntervalKm: null,
    defaultIntervalMonths: 24,
    description: 'Battery health test, terminal cleaning, or replacement',
  },
  general: {
    id: 'general',
    label: 'General Service & Inspection',
    icon: '🔍',
    color: '#3043E4',
    defaultIntervalKm: 6000,
    defaultIntervalMonths: 12,
    description: 'Full multi-point safety inspection and tune-up',
  },
  custom: {
    id: 'custom',
    label: 'Custom Service',
    icon: '🔧',
    color: '#555555',
    defaultIntervalKm: null,
    defaultIntervalMonths: null,
    description: 'Custom repair or aftermarket modification',
  },
};

const VEHICLE_TYPES = [
  { id: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { id: 'scooter', label: 'Scooter', icon: '🛵' },
  { id: 'sportbike', label: 'Sportbike', icon: '🏎️' },
  { id: 'cruiser', label: 'Cruiser / Touring', icon: '🏍️' },
  { id: 'adventure', label: 'Adventure / Dual Sport', icon: '⛰️' },
  { id: 'car', label: 'Car / Support Vehicle', icon: '🚗' },
];

module.exports = {
  MAINTENANCE_CATEGORIES,
  VEHICLE_TYPES,
};
