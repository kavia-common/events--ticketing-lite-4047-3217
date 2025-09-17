"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import TicketTypesManager from "@/components/events/TicketTypesManager";
import TicketGenerationPanel from "@/components/tickets/TicketGenerationPanel";
import CsvImport from "@/components/tickets/CsvImport";
import Scanner from "@/components/checkin/Scanner";
import ReportWidget from "@/components/checkin/ReportWidget";
import { useEvent, Id, downloadZipForEvent } from "@/lib/apiClient";
import { saveBlob } from "@/lib/browserUtils";
import { FadeIn, StaggeredList, StaggeredItem, HoverScale } from "@/components/ui/MotionProvider";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: Id }>();
  const { data: event, error } = useEvent(eventId);
  
  type TabKey = "overview" | "types" | "generate" | "csv" | "scan" | "report";
  const [tab, setTab] = React.useState<TabKey>("overview");
  const [err, setErr] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const tabs = [
    { key: "overview" as TabKey, label: "Overview", icon: "📊" },
    { key: "types" as TabKey, label: "Ticket Types", icon: "🎫" },
    { key: "generate" as TabKey, label: "Generate Tickets", icon: "✨" },
    { key: "csv" as TabKey, label: "CSV Import", icon: "📄" },
    { key: "scan" as TabKey, label: "Check-In", icon: "📱" },
    { key: "report" as TabKey, label: "Report", icon: "📈" },
  ];

  async function downloadAll() {
    setErr(null);
    setIsDownloading(true);
    
    try {
      const blob = await downloadZipForEvent(eventId);
      if (blob instanceof Blob) {
        saveBlob(blob, `event-${eventId}-tickets.zip`);
      } else {
        setErr(blob.message);
      }
    } catch {
      setErr("Failed to download tickets");
    } finally {
      setIsDownloading(false);
    }
  }

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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="skeleton h-8 w-3/4 mb-4"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-2/3"></div>
          </div>
          <div className="skeleton h-10 w-24"></div>
        </div>
        
        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-10 w-24"></div>
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="card">
          <div className="skeleton h-6 w-1/3 mb-4"></div>
          <div className="skeleton h-4 w-full mb-2"></div>
          <div className="skeleton h-4 w-3/4"></div>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startsAt);
  const endDate = new Date(event.endsAt);
  const isUpcoming = startDate > new Date();
  const isOngoing = new Date() >= startDate && new Date() <= endDate;
  
  const statusConfig = {
    upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700", icon: "⏰" },
    ongoing: { label: "Live Now", color: "bg-green-100 text-green-700", icon: "🔴" },
    past: { label: "Ended", color: "bg-gray-100 text-gray-700", icon: "✅" }
  };
  
  const status = isUpcoming ? "upcoming" : isOngoing ? "ongoing" : "past";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      {/* Event Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <FadeIn className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              className="text-5xl"
            >
              🎪
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="section-title">{event.title}</h1>
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig[status].color} flex items-center gap-1`}
                >
                  <span>{statusConfig[status].icon}</span>
                  {statusConfig[status].label}
                </motion.div>
              </div>
              
              <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <StaggeredItem>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📅</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {startDate.toLocaleDateString()}
                      </div>
                      <div className="text-xs">
                        {startDate.toLocaleDateString() !== endDate.toLocaleDateString() 
                          ? `to ${endDate.toLocaleDateString()}`
                          : "Single day"
                        }
                      </div>
                    </div>
                  </div>
                </StaggeredItem>
                
                <StaggeredItem>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>⏰</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs">
                        to {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </StaggeredItem>
                
                <StaggeredItem>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📍</span>
                    <div>
                      <div className="font-medium text-gray-900 truncate">
                        {event.venue}
                      </div>
                      <div className="text-xs">Venue</div>
                    </div>
                  </div>
                </StaggeredItem>
                
                <StaggeredItem>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>👥</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {event.capacity.toLocaleString()}
                      </div>
                      <div className="text-xs">Capacity</div>
                    </div>
                  </div>
                </StaggeredItem>
              </StaggeredList>
              
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <span>🌍</span>
                <span>{event.timezone}</span>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <HoverScale>
            <Link href={`/events/${eventId}/edit`}>
              <Button variant="secondary" size="lg">
                <span className="mr-2">✏️</span>
                Edit Event
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
          >
            <Alert type="error" onClose={() => setErr(null)}>
              <p>{err}</p>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto pb-2" aria-label="Tabs">
          {tabs.map((tabItem, index) => {
            const active = tab === tabItem.key;
            
            return (
              <motion.button
                key={tabItem.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                role="tab"
                aria-selected={active}
                className={`
                  relative whitespace-nowrap px-4 py-3 text-sm font-medium rounded-lg
                  transition-all duration-200 flex items-center gap-2
                  ${active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                `}
                onClick={() => setTab(tabItem.key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  animate={{ rotate: active ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {tabItem.icon}
                </motion.span>
                <span>{tabItem.label}</span>
                
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {tab === "overview" && (
            <div className="card">
              <FadeIn>
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🎫
                  </motion.div>
                  <h3 className="title-lg mb-4">Event Management Hub</h3>
                  <p className="body-md mb-8 max-w-2xl mx-auto">
                    Use the tabs above to define ticket types, generate and distribute tickets,
                    scan for check-in, and monitor real-time reports for your event.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <HoverScale>
                      <Button 
                        onClick={downloadAll} 
                        variant="primary"
                        size="lg"
                        loading={isDownloading}
                        icon={
                          <motion.span
                            animate={{ rotate: isDownloading ? 360 : 0 }}
                            transition={{ duration: 1, repeat: isDownloading ? Infinity : 0 }}
                          >
                            📦
                          </motion.span>
                        }
                      >
                        {isDownloading ? "Preparing..." : "Download All Tickets (ZIP)"}
                      </Button>
                    </HoverScale>
                    
                    <HoverScale>
                      <Button 
                        onClick={() => setTab("types")} 
                        variant="secondary"
                        size="lg"
                      >
                        <span className="mr-2">🎭</span>
                        Manage Ticket Types
                      </Button>
                    </HoverScale>
                  </div>
                </div>
              </FadeIn>
            </div>
          )}

          {tab === "types" && <TicketTypesManager eventId={eventId} />}
          {tab === "generate" && <TicketGenerationPanel eventId={eventId} />}
          {tab === "csv" && <CsvImport eventId={eventId} />}
          {tab === "scan" && <Scanner />}
          {tab === "report" && <ReportWidget eventId={eventId} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
