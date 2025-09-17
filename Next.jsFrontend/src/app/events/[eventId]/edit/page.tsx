"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EventForm from "@/components/events/EventForm";
import { useEvent, Id } from "@/lib/apiClient";
import { FadeIn } from "@/components/ui/MotionProvider";
import Button from "@/components/ui/Button";

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: Id }>();
  const { data: event, error } = useEvent(eventId);
  const router = useRouter();

  if (error) {
    return (
      <FadeIn>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="title-lg mb-2 text-red-600">Failed to load event</h3>
          <p className="body-md mb-6">Something went wrong while fetching the event details.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </FadeIn>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <div className="skeleton h-8 w-64 mx-auto mb-4"></div>
          <div className="skeleton h-4 w-96 mx-auto"></div>
        </div>
        
        {/* Form Skeleton */}
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="skeleton h-6 w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton h-4 w-24 mb-2"></div>
                  <div className="skeleton h-12 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              scale: [1, 1.05, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="text-8xl mb-4"
          >
            ✏️
          </motion.div>
          <h1 className="hero-title mb-4">
            Edit Event
          </h1>
          <p className="body-lg max-w-2xl mx-auto text-gray-600">
            Update your event details. Changes will be reflected immediately
            across all tickets and check-in systems.
          </p>
          
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500"
          >
            <span>Events</span>
            <span>→</span>
            <span className="font-medium text-gray-900 truncate max-w-xs">
              {event.title}
            </span>
            <span>→</span>
            <span>Edit</span>
          </motion.nav>
        </div>
      </FadeIn>

      {/* Form */}
      <EventForm
        mode="edit"
        event={event}
        onSaved={() => router.push(`/events/${eventId}`)}
      />

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [180, 90, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-tl from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl"
        />
      </div>
    </motion.div>
  );
}
