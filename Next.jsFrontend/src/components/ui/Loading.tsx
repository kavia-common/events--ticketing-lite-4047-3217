"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingProps {
  type?: "spinner" | "dots" | "bars" | "pulse" | "skeleton";
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  text?: string;
  className?: string;
}

// PUBLIC_INTERFACE
export default function Loading({
  type = "spinner",
  size = "md",
  color = "primary",
  text,
  className = ""
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    white: "text-white"
  };

  const containerClass = `flex items-center justify-center ${className}`;

  if (type === "spinner") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} ${colorClasses[color]}`}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
                className="opacity-25"
              />
              <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.416"
                initial={{ strokeDashoffset: "31.416" }}
                animate={{ strokeDashoffset: "0" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
          {text && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`text-sm ${colorClasses[color]}`}
            >
              {text}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  if (type === "dots") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className={`w-2 h-2 rounded-full ${colorClasses[color] === 'text-white' ? 'bg-white' : 'bg-blue-600'}`}
              />
            ))}
          </div>
          {text && (
            <p className={`text-sm ${colorClasses[color]}`}>{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "bars") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-end gap-1">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scaleY: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.1
                }}
                className={`w-1 h-6 ${colorClasses[color] === 'text-white' ? 'bg-white' : 'bg-blue-600'} rounded-full origin-bottom`}
              />
            ))}
          </div>
          {text && (
            <p className={`text-sm ${colorClasses[color]}`}>{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "pulse") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
            className={`${sizeClasses[size]} rounded-full ${colorClasses[color] === 'text-white' ? 'bg-white' : 'bg-blue-600'}`}
          />
          {text && (
            <p className={`text-sm ${colorClasses[color]}`}>{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "skeleton") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="skeleton h-4 w-3/4"></div>
        <div className="skeleton h-4 w-1/2"></div>
        <div className="skeleton h-4 w-5/6"></div>
      </div>
    );
  }

  return null;
}

// Specialized loading components

// PUBLIC_INTERFACE
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 mx-auto mb-4 text-blue-600"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="10"
            />
          </svg>
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg text-gray-600"
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function ButtonLoading({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeMap[size]} text-current`}
    >
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="10"
        />
      </svg>
    </motion.div>
  );
}

// PUBLIC_INTERFACE
export function TableLoading({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(rows)].map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowIndex * 0.1 }}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {[...Array(columns)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="skeleton h-4"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="skeleton h-6 w-3/4 mb-4"></div>
          <div className="skeleton h-4 w-full mb-2"></div>
          <div className="skeleton h-4 w-2/3 mb-4"></div>
          <div className="flex gap-2">
            <div className="skeleton h-8 w-16"></div>
            <div className="skeleton h-8 w-16"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
export function FormLoading() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-12 w-full"></div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="skeleton h-10 w-32"
      />
    </div>
  );
}
