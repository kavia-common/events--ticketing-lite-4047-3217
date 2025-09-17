"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useEvents, deleteEvent, Event } from "@/lib/apiClient";
import { FadeIn, StaggeredList, StaggeredItem, HoverScale } from "@/components/ui/MotionProvider";

export default function EventsPage() {
  const { data, error, isLoading } = useEvents();
  const [err, setErr] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function onDelete(evt: Event) {
    setErr(null);
    const ok = confirm(`Delete event "${evt.title}"? This cannot be undone.`);
    if (!ok) return;
    
    setDeletingId(evt.id);
    const res = await deleteEvent(evt.id);
    setDeletingId(null);
    
    if (res !== true) setErr(res.message);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-32"></div>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-3/4 mb-4"></div>
              <div className="skeleton h-4 w-full mb-2"></div>
              <div className="skeleton h-4 w-2/3 mb-4"></div>
              <div className="flex gap-2">
                <div className="skeleton h-8 w-16"></div>
                <div className="skeleton h-8 w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <FadeIn>
          <div>
            <h1 className="section-title mb-2">Events</h1>
            <p className="body-md">
              Manage your events, tickets, and check-ins all in one place
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <HoverScale>
            <Link href="/events/new">
              <Button 
                variant="primary" 
                size="lg"
                icon={
                  <motion.span
                    animate={{ rotate: [0, 90, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-lg"
                  >
                    ➕
                  </motion.span>
                }
              >
                Create Event
              </Button>
            </Link>
          </HoverScale>
        </FadeIn>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {err && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Alert type="error">
              <p>{err}</p>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <FadeIn>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="title-lg mb-2 text-red-600">Failed to load events</h3>
            <p className="body-md mb-6">Something went wrong while fetching your events.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </FadeIn>
      )}

      {/* Events Grid */}
      {data && (
        <>
          {data.length === 0 ? (
            <FadeIn delay={0.3}>
              <div className="text-center py-16">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-8xl mb-6"
                >
                  🎪
                </motion.div>
                <h3 className="title-xl mb-4">No events yet</h3>
                <p className="body-lg mb-8 max-w-md mx-auto text-gray-600">
                  Create your first event to start managing tickets and check-ins with style.
                </p>
                <HoverScale>
                  <Link href="/events/new">
                    <Button variant="primary" size="lg">
                      <span className="text-lg mr-2">✨</span>
                      Create Your First Event
                    </Button>
                  </Link>
                </HoverScale>
              </div>
            </FadeIn>
          ) : (
            <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((event) => (
                <StaggeredItem key={event.id}>
                  <EventCard 
                    event={event} 
                    onDelete={() => onDelete(event)}
                    isDeleting={deletingId === event.id}
                  />
                </StaggeredItem>
              ))}
            </StaggeredList>
          )}
        </>
      )}
    </motion.div>
  );
}

// Event Card Component
function EventCard({ 
  event, 
  onDelete, 
  isDeleting 
}: { 
  event: Event; 
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const startDate = new Date(event.startsAt);
  const endDate = new Date(event.endsAt);
  const isUpcoming = startDate > new Date();
  const isOngoing = new Date() >= startDate && new Date() <= endDate;

  const statusConfig = {
    upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700 border-blue-200" },
    ongoing: { label: "Live", color: "bg-green-100 text-green-700 border-green-200" },
    past: { label: "Ended", color: "bg-gray-100 text-gray-700 border-gray-200" }
  };

  const status = isUpcoming ? "upcoming" : isOngoing ? "ongoing" : "past";

  return (
    <HoverScale className="h-full">
      <motion.div
        layout
        className="card h-full flex flex-col relative overflow-hidden group"
        whileHover={{ 
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          y: -4
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Status Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full border ${statusConfig[status].color}`}
        >
          {statusConfig[status].label}
        </motion.div>

        {/* Event Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="text-4xl mb-4"
        >
          🎫
        </motion.div>

        {/* Event Details */}
        <div className="flex-1">
          <Link 
            href={`/events/${event.id}`}
            className="group-hover:text-blue-600 transition-colors"
          >
            <h3 className="title-lg mb-3 line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>{event.capacity} capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌍</span>
              <span className="text-xs">{event.timezone}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="primary" className="w-full">
              <span className="mr-1">👁️</span>
              View
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="secondary">
              <span className="mr-1">✏️</span>
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            onClick={onDelete}
            disabled={isDeleting}
            loading={isDeleting}
          >
            <span className="mr-1">🗑️</span>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>

        {/* Hover Effect Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </HoverScale>
  );
}
