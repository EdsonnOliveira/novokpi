import { formatFiscalOptionLabel, type FiscalCatalogOption } from '@/lib/fiscal/catalogs';

interface FiscalCodeSelectProps {
  name: string;
  options: FiscalCatalogOption[];
  defaultValue?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function FiscalCodeSelect({
  name,
  options,
  defaultValue,
  required = false,
  className = 'form-select form-select-sm',
  placeholder = 'Selecione',
}: FiscalCodeSelectProps) {
  return (
    <select name={name} className={className} defaultValue={defaultValue ?? ''} required={required}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {formatFiscalOptionLabel(option.value, option.label)}
        </option>
      ))}
    </select>
  );
}
