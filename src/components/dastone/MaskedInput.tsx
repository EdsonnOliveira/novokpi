'use client';

import { useCallback, useEffect, useId, useState, type InputHTMLAttributes } from 'react';
import { applyMask, type MaskType } from '@/lib/masks';

type MaskedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> & {
  mask: MaskType;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  maxDigits?: number;
};

function getInputMode(mask: MaskType): InputHTMLAttributes<HTMLInputElement>['inputMode'] {
  if (mask === 'plate') {
    return 'text';
  }
  return 'numeric';
}

export function MaskedInput({
  mask,
  value,
  defaultValue = '',
  onValueChange,
  maxDigits,
  name,
  className,
  id,
  onBlur,
  ...props
}: MaskedInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => applyMask(mask, defaultValue, maxDigits));

  useEffect(() => {
    if (isControlled) {
      return;
    }
    setInternalValue(applyMask(mask, defaultValue, maxDigits));
  }, [defaultValue, isControlled, mask, maxDigits]);

  const displayValue = isControlled ? applyMask(mask, value ?? '', maxDigits) : internalValue;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const masked = applyMask(mask, event.target.value, maxDigits);
      if (!isControlled) {
        setInternalValue(masked);
      }
      onValueChange?.(masked);
    },
    [isControlled, mask, maxDigits, onValueChange],
  );

  return (
    <>
      <input
        {...props}
        id={inputId}
        className={className}
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        inputMode={getInputMode(mask)}
        autoComplete="off"
      />
      {name ? <input type="hidden" name={name} value={displayValue} /> : null}
    </>
  );
}
