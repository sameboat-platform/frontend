import type { FocusEventHandler, ChangeEventHandler } from 'react';
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string | null;
}

export function FormField({ label, name, type = 'text', required, value, onChange, onFocus, placeholder, autoComplete, disabled, error }: FormFieldProps) {
  const id = name;
  return (
    <FormControl isRequired={required} isDisabled={disabled} isInvalid={!!error}>
      <FormLabel htmlFor={id} mb={1} fontSize='sm'>
        {label}
      </FormLabel>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete={autoComplete}
        size='md'
        variant='outline'
      />
      {error && <FormErrorMessage fontSize='xs'>{error}</FormErrorMessage>}
    </FormControl>
  );
}
