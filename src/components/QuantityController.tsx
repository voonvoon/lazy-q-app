import React from 'react';

interface QuantityControllerProps {
  quantity: number;
  onQuantityChange: (newQty: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function QuantityController({
  quantity,
  onQuantityChange, //is a setQuantity
  min = 0,
  max = 99,
  disabled = false,
  size = 'md'
}: QuantityControllerProps) {

  const handleDecrease = () => {
    if (quantity > min && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max && !disabled) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const value = e.target.value;
    
    // Allow empty string for user to type
    if (value === '') {
      return;
    }
    
    // Parse as number and validate
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onQuantityChange(numValue);
    }
  };

  const handleInputBlur = () => {
    // If quantity is somehow invalid, reset to min
    if (quantity < min || quantity > max || isNaN(quantity)) {
      onQuantityChange(min);
    }
  };

  // Size-based styling
  const sizeClasses = {
    sm: {
      button: 'w-6 h-6 text-sm',
      input: 'w-8 h-6 text-sm',
      container: 'gap-1'
    },
    md: {
      button: 'w-8 h-8 text-base',
      input: 'w-12 h-8 text-base',
      container: 'gap-2'
    },
    lg: {
      button: 'w-10 h-10 text-lg',
      input: 'w-16 h-10 text-lg',
      container: 'gap-3'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${currentSize.container} ${disabled ? 'opacity-50' : ''}`}>
      {/* Decrease Button */}
      <button
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className={`${currentSize.button} rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:hover:bg-white disabled:hover:border-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-bold text-gray-700 disabled:text-gray-400 shadow-sm hover:shadow-md disabled:hover:shadow-sm cursor-pointer`}
      >
        −
      </button>

      {/* Quantity Display/Input */}
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        min={min}
        max={max}
        className={`${currentSize.input} text-center border border-gray-300 rounded-lg font-semibold text-gray-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />

      {/* Increase Button */}
      <button
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className={`${currentSize.button} rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:hover:bg-white disabled:hover:border-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-bold text-gray-700 disabled:text-gray-400 shadow-sm hover:shadow-md disabled:hover:shadow-sm cursor-pointer`}
      >
        +
      </button>
    </div>
  );
}


