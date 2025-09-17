"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav() {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const items = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/events", label: "Events", icon: "🎫" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const linkVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const indicatorVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { 
      width: "100%", 
      opacity: 1
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3"
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              >
                ET
              </motion.div>
              <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Event Ticketing
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => {
              const active = path === item.href || (item.href !== "/" && path?.startsWith(item.href));
              
              return (
                <motion.div
                  key={item.href}
                  variants={linkVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="relative"
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg 
                      text-sm font-medium transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                      ${active 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                  
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      variants={indicatorVariants}
                      initial="initial"
                      animate="animate"
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 rounded-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  animate={{ pathLength: 1 }}
                  initial={{ pathLength: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden mt-4 pb-4 border-t border-gray-200/50"
            >
              <div className="flex flex-col gap-2 pt-4">
                {items.map((item, index) => {
                  const active = path === item.href || (item.href !== "/" && path?.startsWith(item.href));
                  
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { delay: index * 0.1 }
                      }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg
                          text-sm font-medium transition-all duration-200
                          ${active 
                            ? "text-blue-600 bg-blue-50" 
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          }
                        `}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
