import React, { FunctionComponent, memo } from 'react';

// import { HeroIcon } from '@/models/types';
import { cn } from 'src/immersa/utils';

import { UIInlineLoaderIndicator } from './InlineLoaderIndicator';

type ColorSchema = 'primary' | 'secondary' | 'default' | 'danger';

type VariantType = 'text' | 'contained' | 'outlined';

type Size = 'tiny' | 'small' | 'medium' | 'large' | 'x-large';

export interface IUIButtonProps {
  text: string;
  isSubmit?: boolean;
  color?: ColorSchema;
  size?: Size;
  variant?: VariantType;
  StartIcon?: FunctionComponent<React.SVGProps<SVGSVGElement>>;
  className?: string;
  formId?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  onClick?(): void;
}

const variantStylesMap = {
  text: {
    default:
      'text-gray-700 bg-transparent border-transparent hover:bg-gray-50 active:bg-gray-100',
    primary:
      'text-primary bg-transparent border-transparent hover:bg-orange-50 active:bg-orange-100',
    secondary:
      'text-secondary bg-white border-transparent hover:bg-sky-50 active:bg-sky-100',
    danger:
      'text-red-600 bg-white border-transparent hover:bg-red-50 active:bg-red-100',
  },
  contained: {
    default:
      'text-white bg-gray-400 border-transparent shadow-sm hover:bg-gray-500 active:bg-gray-600',
    primary:
      'text-white bg-primary border-transparent shadow-sm hover:bg-orange-500 active:bg-orange-600',
    secondary:
      'text-white bg-secondary border-transparent shadow-sm hover:bg-sky-600 active:bg-sky-700',
    danger:
      'text-white bg-red-500 border-transparent shadow-sm hover:bg-red-600 active:bg-red-700',
  },
  outlined: {
    default:
      'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100',
    primary:
      'text-primary bg-white border-orange-300 hover:bg-orange-50 hover:border-primary active:bg-orange-100',
    secondary:
      'text-secondary bg-white border-secondary border-opacity-50 hover:bg-sky-50 hover:border-secondary active:bg-sky-100',
    danger:
      'text-red-600 bg-white border-red-600 border-opacity-50 hover:bg-red-50 hover:border-red-600 active:bg-red-100',
  },
};

const sizeStylesMap = {
  tiny: 'py-1 px-2 text-xs',
  small: 'py-1 px-2 text-sm',
  medium: 'py-1.5 px-2.5 text-sm',
  large: 'py-2 px-3 text-sm',
  'x-large': 'py-2.5 px-3.5 text-sm',
};

export const UIButton = memo(
  ({
    isLoading,
    disabled,
    text,
    StartIcon,
    formId,
    color = 'default',
    size = 'large',
    variant = 'contained',
    isSubmit = false,
    className = '',
    onClick,
    loadingText,
  }: IUIButtonProps) => {
    const styles = variantStylesMap[variant][color];

    const sizeStyles = sizeStylesMap[size];

    return (
      <button
        form={formId}
        type={isSubmit ? 'submit' : 'button'}
        disabled={disabled || isLoading}
        arial-label={text}
        className={cn(
          !disabled ? styles : 'pointer-events-none opacity-40',
          isLoading ? 'pointer-events-none opacity-90' : '',
          sizeStyles,
          'inline-flex w-full select-none items-center justify-center whitespace-nowrap rounded-md border font-semibold transition-colors duration-100 ease-linear focus:outline-none sm:w-auto',
          className,
        )}
        onClick={isSubmit ? undefined : onClick}
      >
        {isLoading ? (
          <UIInlineLoaderIndicator
            variant={variant === 'text' ? 'primary' : 'default'}
          />
        ) : (
          StartIcon && (
            <StartIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          )
        )}

        {isLoading && !!loadingText ? loadingText : text}
      </button>
    );
  },
);
