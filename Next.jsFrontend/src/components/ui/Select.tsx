"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  variant?: "default" | "minimal";
};

// PUBLIC_INTERFACE
export default function Select({
  label,
  error,
  hint,
  id,
  options = [],
  placeholder,
  variant = "default",
  className = "",
  children,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errId = error ? `${selectId}-error` : undefined;
  
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  const selectVariant = error ? "error" : isFocused ? "focused" : "default";
  const labelState = isFocused || hasValue || rest.value ? "active" : "default";

  return (
    <div className="form-group">
      <div className="relative">
        {/* Floating Label */}
        {variant === "default" && (
          <motion.label
            htmlFor={selectId}
            variants={labelVariants}
            animate={labelState}
            className="absolute left-3 top-3 pointer-events-none text-sm font-medium origin-left z-10"
          >
            {label}
          </motion.label>
        )}

        {/* Fixed Label for minimal variant */}
        {variant === "minimal" && (
          <label htmlFor={selectId} className="form-label">
            {label}
          </label>
        )}

        {/* Select Container */}
        <motion.div
          variants={borderVariants}
          animate={selectVariant}
          className="relative overflow-hidden rounded-lg"
        >
          <select
            id={selectId}
            aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
            aria-invalid={!!error}
            className={`
              form-select
              ${variant === "default" ? "pt-6 pb-2" : "py-3"}
              border-2 transition-all duration-200 appearance-none
              ${error ? "border-red-300" : "border-gray-200"}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
            {children}
          </select>

          {/* Custom Dropdown Arrow */}
          <motion.div
            animate={{ 
              rotate: isFocused ? 180 : 0,
              color: isFocused ? "rgb(99, 91, 255)" : "rgb(156, 163, 175)"
            }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

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
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500"
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

// Enhanced Select Variants

// PUBLIC_INTERFACE
export function MultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  className = ""
}: Omit<Props, "multiple" | "value" | "onChange"> & {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<string[]>(value);

  React.useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const toggleOption = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const removeOption = (optionValue: string) => {
    const newValues = selectedValues.filter(v => v !== optionValue);
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      
      {/* Selected Values Display */}
      {selectedValues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-2 flex flex-wrap gap-2"
        >
          {selectedValues.map((val) => {
            const option = options.find(opt => opt.value === val);
            return (
              <motion.span
                key={val}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {option?.label || val}
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => removeOption(val)}
                  className="text-blue-600 hover:text-blue-800"
                  type="button"
                >
                  ×
                </motion.button>
              </motion.span>
            );
          })}
        </motion.div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            form-input w-full text-left flex items-center justify-between
            ${className}
          `}
          whileTap={{ scale: 0.98 }}
        >
          <span className={selectedValues.length === 0 ? "text-gray-400" : ""}>
            {selectedValues.length === 0 
              ? placeholder 
              : `${selectedValues.length} selected`
            }
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {options.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  disabled={option.disabled}
                  className={`
                    w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors
                    ${selectedValues.includes(option.value) ? "bg-blue-50 text-blue-800" : ""}
                    ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  whileHover={!option.disabled ? { backgroundColor: "#f9fafb" } : {}}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: selectedValues.includes(option.value) ? 1 : 0.8,
                        opacity: selectedValues.includes(option.value) ? 1 : 0.3
                      }}
                    >
                      {selectedValues.includes(option.value) ? "✓" : "○"}
                    </motion.div>
                    {option.label}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
