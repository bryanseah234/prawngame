import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth = false, className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={['button', 'button-' + variant, fullWidth ? 'full-width' : '', className].join(' ')} {...props} />;
}
