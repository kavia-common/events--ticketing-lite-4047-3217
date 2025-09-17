"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EventForm from "@/components/events/EventForm";
import { FadeIn } from "@/components/ui/MotionProvider";

export default function NewEventPage() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="min-h-screen py-8"
    >
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-12">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="text-8xl mb-4"
          >
            🎪
          </motion.div>
          <h1 className="hero-title mb-4">
            Create Your Event
          </h1>
          <p className="body-lg max-w-2xl mx-auto text-gray-600">
            Set up your event in just a few steps and start managing tickets like a pro.
            Our streamlined process makes event creation fast and intuitive.
          </p>
        </div>
      </FadeIn>

      {/* Form */}
      <EventForm
        mode="create"
        onSaved={(evt) => router.push(`/events/${evt.id}`)}
      />

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>
    </motion.div>
  );
}
