"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { FadeIn, HoverScale } from "@/components/ui/MotionProvider";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        {/* Animated 404 */}
        <FadeIn>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            404
          </motion.div>
        </FadeIn>

        {/* Emoji Animation */}
        <FadeIn delay={0.2}>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="text-6xl mb-6"
          >
            🎪
          </motion.div>
        </FadeIn>

        {/* Content */}
        <FadeIn delay={0.4}>
          <div className="card max-w-md mx-auto">
            <h1 className="title-xl mb-4">Page Not Found</h1>
            <p className="body-md mb-8 text-gray-600">
              Looks like this page wandered off to another dimension. 
              Let&apos;s get you back to where the magic happens!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <HoverScale>
                <Link href="/">
                  <Button variant="primary" size="lg">
                    <span className="mr-2">🏠</span>
                    Go Home
                  </Button>
                </Link>
              </HoverScale>
              
              <HoverScale>
                <Link href="/events">
                  <Button variant="secondary" size="lg">
                    <span className="mr-2">🎫</span>
                    Browse Events
                  </Button>
                </Link>
              </HoverScale>
            </div>
          </div>
        </FadeIn>

        {/* Background Animation */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              x: [0, -80, 0],
              y: [0, 60, 0],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tl from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
          />
        </div>
      </div>
    </main>
  );
}
