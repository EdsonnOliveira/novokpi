export type MaskType =
  | 'cpfCnpj'
  | 'cpf'
  | 'cnpj'
  | 'phone'
  | 'cep'
  | 'plate'
  | 'currency'
  | 'integer'
  | 'digits';

export function onlyDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export function maskCpf(value: string): string {
  const digits = onlyDigits(value, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCnpj(value: string): string {
  const digits = onlyDigits(value, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function maskCpfCnpj(value: string): string {
  const digits = onlyDigits(value, 14);
  if (digits.length <= 11) {
    return maskCpf(digits);
  }
  return maskCnpj(digits);
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value, 11);
  if (!digits) {
    return '';
  }
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function maskCep(value: string): string {
  const digits = onlyDigits(value, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function maskPlate(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (clean.length <= 3) {
    return clean;
  }
  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

export function maskCurrency(value: string): string {
  const digits = onlyDigits(value);
  if (!digits) {
    return '';
  }
  const amount = Number(digits) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function maskInteger(value: string, maxDigits = 9): string {
  const digits = onlyDigits(value, maxDigits);
  if (!digits) {
    return '';
  }
  return Number(digits).toLocaleString('pt-BR');
}

export function maskDigits(value: string, maxDigits = 20): string {
  return onlyDigits(value, maxDigits);
}

export function applyMask(mask: MaskType, value: string, maxDigits?: number): string {
  switch (mask) {
    case 'cpf':
      return maskCpf(value);
    case 'cnpj':
      return maskCnpj(value);
    case 'cpfCnpj':
      return maskCpfCnpj(value);
    case 'phone':
      return maskPhone(value);
    case 'cep':
      return maskCep(value);
    case 'plate':
      return maskPlate(value);
    case 'currency':
      return maskCurrency(value);
    case 'integer':
      return maskInteger(value, maxDigits);
    case 'digits':
      return maskDigits(value, maxDigits);
    default:
      return value;
  }
}

export function parseMaskNumber(value: string): number {
  if (!value) {
    return 0;
  }
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseMaskInteger(value: string): number {
  return Number(onlyDigits(value)) || 0;
}
