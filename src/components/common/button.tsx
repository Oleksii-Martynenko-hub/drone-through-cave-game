import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

enum variants {
  primary = 'primary',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: variants;
}

const StyledButton = styled.button<ButtonProps>`
  font-size: 18px;
  line-height: 24px;
  font-weight: 600;
  text-transform: uppercase;

  border: none;
  outline: none;
  padding: 10px 18px 10px;
  border-radius: 6px;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent !important;
  user-select: none;
`;

const PrimaryButton = styled(StyledButton)`
  color: #ffffff;
  background-color: #0ea0e9;

  &:hover {
    background-color: #0d97dc;
  }
`;

export function Button({
  variant = variants.primary,
  children,
  ...props
}: ButtonProps) {
  const buttons = {
    [variants.primary]: PrimaryButton,
  };

  const ButtonComponent = buttons[variant];

  return <ButtonComponent {...props}>{children}</ButtonComponent>;
}

Button.variants = variants;

export default Button;
