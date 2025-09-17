"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "minimal";
};

// PUBLIC_INTERFACE
export default function Input({
  label,
  hint,
  error,
  id,
  leftIcon,
  rightIcon,
  variant = "default",
  className = "",
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errId = error ? `${inputId}-error` : undefined;
  
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    rest.onChange?.(e);
  };

  const labelVariants = {
    default: { 
      y: 0, 
      scale: 1, 
      color: "rgb(107, 114, 128)" 
    },
    active: { 
      y: -24, 
      scale: 0.85, 
      color: "rgb(99, 91, 255)",
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const borderVariants = {
    default: { 
      borderColor: "rgb(229, 231, 235)",
      boxShadow: "0 0 0 0px rgba(99, 91, 255, 0)"
    },
    focused: { 
      borderColor: "rgb(99, 91, 255)",
      boxShadow: "0 0 0 3px rgba(99, 91, 255, 0.1)",
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    error: { 
      borderColor: "rgb(223, 27, 65)",
      boxShadow: "0 0 0 3px rgba(223, 27, 65, 0.1)"
    }
  };

  const inputVariant = error ? "error" : isFocused ? "focused" : "default";
  const labelState = isFocused || hasValue ? "active" : "default";

  return (
    <div className="form-group">
      <div className="relative">
        {/* Floating Label */}
        {variant === "default" && (
          <motion.label
            htmlFor={inputId}
            variants={labelVariants}
            animate={labelState}
            className="absolute left-3 top-3 pointer-events-none text-sm font-medium origin-left z-10"
          >
            {label}
          </motion.label>
        )}

        {/* Fixed Label for minimal variant */}
        {variant === "minimal" && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}

        {/* Input Container */}
        <motion.div
          variants={borderVariants}
          animate={inputVariant}
          className="relative overflow-hidden rounded-lg"
        >
          {/* Left Icon */}
          {leftIcon && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
            >
              {leftIcon}
            </motion.div>
          )}

          {/* Input Field */}
          <input
            id={inputId}
            aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
            aria-invalid={!!error}
            className={`
              form-input
              ${leftIcon ? "pl-10" : "pl-3"}
              ${rightIcon ? "pr-10" : "pr-3"}
              ${variant === "default" ? "pt-6 pb-2" : "py-3"}
              border-2 transition-all duration-200
              ${error ? "border-red-300" : "border-gray-200"}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...rest}
          />

          {/* Right Icon */}
          {rightIcon && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {rightIcon}
            </motion.div>
          )}

          {/* Focus Ring Animation */}
          <motion.div
            className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 pointer-events-none"
            animate={isFocused ? { opacity: 1, scale: 1.02 } : { opacity: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Success Animation */}
        <AnimatePresence>
          {!error && hasValue && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 180 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint Text */}
      <AnimatePresence>
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            id={hintId}
            className="form-hint"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error Text */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, x: -5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              x: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 30
              }
            }}
            exit={{ opacity: 0, y: -5 }}
            id={errId}
            className="form-error flex items-center gap-1"
          >
            <motion.span
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.4 }}
            >
              ⚠️
            </motion.span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Input Variants

// PUBLIC_INTERFACE
export function SearchInput({
  placeholder = "Search...",
  onSearch,
  className = "",
  ...props
}: Omit<Props, "leftIcon"> & {
  onSearch?: (value: string) => void;
}) {
  const [searchValue, setSearchValue] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
    props.onChange?.(e);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch?.("");
  };

  return (
    <Input
      {...props}
      value={searchValue}
      onChange={handleChange}
      placeholder={placeholder}
      leftIcon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth={2} />
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth={2} />
        </svg>
      }
      rightIcon={
        searchValue && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-100"
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={2} />
            </svg>
          </motion.button>
        )
      }
      className={className}
    />
  );
}

// PUBLIC_INTERFACE
export function NumberInput({
  min,
  max,
  step = 1,
  onIncrement,
  onDecrement,
  className = "",
  ...props
}: Props & {
  min?: number;
  max?: number;
  step?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}) {
  const value = Number(props.value || 0);

  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onIncrement?.();
    }
  };

  const handleDecrement = () => {
    if (min === undefined || value > min) {
      onDecrement?.();
    }
  };

  return (
    <Input
      {...props}
      type="number"
      min={min}
      max={max}
      step={step}
      rightIcon={
        <div className="flex flex-col">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={max !== undefined && value >= max}
            className="p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
            type="button"
          >
            ▲
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={min !== undefined && value <= min}
            className="p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
            type="button"
          >
            ▼
          </motion.button>
        </div>
      }
      className={className}
    />
  );
}
