"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    y: -1,
    transition: { 
      duration: 0.2, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    }
  },
  tap: { 
    scale: 0.98,
    y: 0,
    transition: { 
      duration: 0.1, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    }
  }
};

const loadingVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const rippleVariants: Variants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// PUBLIC_INTERFACE
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  className = "",
  children,
  disabled,
  onClick,
  ...rest
}: Props) {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const baseClasses = "btn relative overflow-hidden";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    danger: "btn-danger",
    ghost: "btn-ghost",
    success: "btn-success"
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };

  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

    // Create ripple effect
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        id: Date.now(),
        x,
        y
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 500);
    }

    onClick?.(e);
  };

  const LoadingSpinner = () => (
    <motion.div
      variants={loadingVariants}
      animate="animate"
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
    />
  );

  return (
    <motion.button
      ref={buttonRef}
      variants={buttonVariants}
      initial="initial"
      whileHover={!isDisabled ? "hover" : undefined}
      whileTap={!isDisabled ? "tap" : undefined}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      {...rest}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          variants={rippleVariants}
          initial="initial"
          animate="animate"
          className="absolute bg-white/20 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20
          }}
        />
      ))}

      {/* Button content */}
      <div className="flex items-center justify-center gap-2 relative z-10">
        {loading && <LoadingSpinner />}
        {!loading && icon && iconPosition === "left" && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        
        {children && (
          <motion.span
            initial={{ opacity: loading ? 0 : 1 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.span>
        )}
        
        {!loading && icon && iconPosition === "right" && (
          <motion.div
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
      </div>

      {/* Hover background effect */}
      <motion.div
        className="absolute inset-0 bg-white/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}

// Enhanced button variants for specific use cases

// PUBLIC_INTERFACE
export function GradientButton({
  children,
  className = "",
  ...props
}: Omit<Props, "variant"> & { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="gradient-border"
    >
      <Button
        variant="ghost"
        className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 ${className}`}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

// PUBLIC_INTERFACE
export function FloatingActionButton({
  children,
  className = "",
  ...props
}: Omit<Props, "variant" | "size"> & { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        variant="primary"
        size="lg"
        className={`rounded-full w-14 h-14 p-0 shadow-lg ${className}`}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

// PUBLIC_INTERFACE
export function IconButton({
  icon,
  size = "md",
  className = "",
  ...props
}: Props & { icon: React.ReactNode }) {
  const sizeMap = {
    sm: "w-8 h-8 p-1",
    md: "w-10 h-10 p-2", 
    lg: "w-12 h-12 p-3"
  };

  return (
    <Button
      variant="ghost"
      className={`${sizeMap[size]} rounded-full ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}
