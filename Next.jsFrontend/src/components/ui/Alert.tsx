"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Alert({
  type = "info",
  children,
  role,
  onClose,
  title,
  className = "",
}: {
  type?: "info" | "success" | "error" | "warning";
  children: React.ReactNode;
  role?: "status" | "alert";
  onClose?: () => void;
  title?: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const alertConfig = {
    info: {
      icon: "ℹ️",
      bgColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
      iconColor: "text-blue-500",
      closeColor: "text-blue-400 hover:text-blue-600"
    },
    success: {
      icon: "✅",
      bgColor: "bg-green-50 border-green-200", 
      textColor: "text-green-900",
      iconColor: "text-green-500",
      closeColor: "text-green-400 hover:text-green-600"
    },
    error: {
      icon: "❌",
      bgColor: "bg-red-50 border-red-200",
      textColor: "text-red-900", 
      iconColor: "text-red-500",
      closeColor: "text-red-400 hover:text-red-600"
    },
    warning: {
      icon: "⚠️",
      bgColor: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-900",
      iconColor: "text-yellow-500", 
      closeColor: "text-yellow-400 hover:text-yellow-600"
    }
  };

  const config = alertConfig[type];

  const alertVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.95,
      x: -20
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      x: 20,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        delay: 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 200
      }
    }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={alertVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role={role || (type === "error" ? "alert" : "status")}
          className={`
            alert relative overflow-hidden
            ${config.bgColor} ${config.textColor}
            ${className}
          `}
        >
          {/* Background Animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: [-100, 300] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />

          <div className="relative flex items-start gap-3">
            {/* Icon */}
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              className={`flex-shrink-0 text-xl ${config.iconColor}`}
            >
              {config.icon}
            </motion.div>

            {/* Content */}
            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              className="flex-1 min-w-0"
            >
              {title && (
                <h4 className="font-semibold mb-1">
                  {title}
                </h4>
              )}
              <div className="text-sm leading-relaxed">
                {children}
              </div>
            </motion.div>

            {/* Close Button */}
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className={`
                  flex-shrink-0 p-1 rounded-full transition-colors
                  ${config.closeColor}
                `}
                aria-label="Close alert"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Progress Bar for Auto-dismiss */}
          {onClose && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              onAnimationComplete={handleClose}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Enhanced Alert Variants

// PUBLIC_INTERFACE
export function ToastAlert({
  type = "info",
  children,
  onClose,
  duration = 5000,
  position = "top-right",
  className = ""
}: {
  type?: "info" | "success" | "error" | "warning";
  children: React.ReactNode;
  onClose?: () => void;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const positionClasses = {
    "top-right": "fixed top-4 right-4 z-50",
    "top-left": "fixed top-4 left-4 z-50", 
    "bottom-right": "fixed bottom-4 right-4 z-50",
    "bottom-left": "fixed bottom-4 left-4 z-50"
  };

  const slideVariants = {
    initial: { 
      opacity: 0,
      x: position.includes("right") ? 100 : -100,
      y: position.includes("top") ? -20 : 20
    },
    animate: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0,
      x: position.includes("right") ? 100 : -100,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`${positionClasses[position]} max-w-sm`}
    >
      <Alert
        type={type}
        onClose={onClose}
        className={`shadow-lg ${className}`}
      >
        {children}
      </Alert>
    </motion.div>
  );
}

// PUBLIC_INTERFACE
export function InlineAlert({
  type = "info",
  children,
  showIcon = true,
  className = ""
}: {
  type?: "info" | "success" | "error" | "warning";
  children: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}) {
  const alertConfig = {
    info: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    success: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    error: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
    warning: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" }
  };

  const config = alertConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
        ${config.bg} ${config.text} ${config.border} ${className}
      `}
    >
      {showIcon && (
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {type === "info" && "ℹ️"}
          {type === "success" && "✅"}
          {type === "error" && "❌"}
          {type === "warning" && "⚠️"}
        </motion.span>
      )}
      {children}
    </motion.div>
  );
}
