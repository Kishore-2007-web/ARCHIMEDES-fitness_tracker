import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'inverted' | 'subtle' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'outline',
  fullWidth = true,
  className = '',
  children,
  ...props
}) => {
  let variantClass = 'sys-btn-outline';
  if (variant === 'inverted') variantClass = 'sys-btn-inverted';
  if (variant === 'subtle') variantClass = 'sys-btn-subtle';

  return (
    <button
      className={`sys-btn ${variantClass} ${className}`}
      style={{ width: fullWidth ? '100%' : 'auto' }}
      {...props}
    >
      {children}
    </button>
  );
};
