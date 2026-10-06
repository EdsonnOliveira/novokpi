export function normalizePlate(plate: string) {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function isValidPlate(plate: string) {
  const normalized = normalizePlate(plate);
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(normalized) || /^[A-Z]{3}[0-9]{4}$/.test(normalized);
}
