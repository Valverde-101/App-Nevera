export const UNIT_OPTIONS = {
  units: 'Unidades',
  kg: 'Kilos',
  l: 'Litros',
  unidades: 'Unidades',
};

const SINGULAR_OPTIONS = {
  units: 'Unidad',
  kg: 'Kilo',
  l: 'Litro',
  unidades: 'Unidad',
};

export function getUnitLabel(quantity, unit) {
  return Number(quantity) === 1
    ? SINGULAR_OPTIONS[unit] || unit
    : UNIT_OPTIONS[unit] || unit;
}
