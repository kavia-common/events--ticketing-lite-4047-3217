"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, StaggeredList, StaggeredItem, HoverScale } from "@/components/ui/MotionProvider";

export default function Home() {
  const features = [
    {
      icon: "🎫",
      title: "Create Events",
      description: "Set up events with details, capacity, and timezone in minutes"
    },
    {
      icon: "🎭",
      title: "Ticket Types",
      description: "Define multiple ticket tiers with pricing and quantity limits"
    },
    {
      icon: "📧",
      title: "Distribution",
      description: "Email tickets or download PDFs with embedded QR codes"
    },
    {
      icon: "📱",
      title: "Check-in Scanner",
      description: "Validate tickets in real-time with duplicate protection"
    },
    {
      icon: "📊",
      title: "Real-time Reports",
      description: "Monitor issued, checked-in, and duplicate tickets live"
    },
    {
      icon: "📋",
      title: "CSV Import",
      description: "Bulk import attendees for large events (coming soon)"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1.1, 1, 1.1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-purple-400 to-pink-500 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <FadeIn delay={0.2}>
            <h1 className="hero-title mb-6">
              Modern Event Ticketing
              <br />
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="body-lg max-w-3xl mx-auto mb-8">
              Create events, define ticket types, generate QR-coded tickets, and validate 
              check-ins with our modern, fast, and accessible event management platform.
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <HoverScale>
                <Link
                  href="/events"
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="text-xl mr-2">🚀</span>
                  Get Started
                </Link>
              </HoverScale>
              
              <HoverScale>
                <Link
                  href="/events/new"
                  className="btn btn-secondary text-lg px-8 py-4"
                >
                  <span className="text-xl mr-2">➕</span>
                  Create Event
                </Link>
              </HoverScale>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn delay={0.2}>
            <h2 className="section-title text-center mb-4">
              Everything you need for event ticketing
            </h2>
            <p className="body-md text-center max-w-2xl mx-auto mb-16">
              From event creation to check-in validation, our platform handles 
              the entire ticketing workflow with modern design and performance.
            </p>
          </FadeIn>

          <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <StaggeredItem key={index}>
                <HoverScale className="h-full">
                  <div className="card h-full group cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl mb-4 inline-block"
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <h3 className="title-lg mb-3 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="body-md">
                      {feature.description}
                    </p>
                  </div>
                </HoverScale>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn delay={0.2}>
            <h2 className="section-title mb-16">
              Built for Performance & Accessibility
            </h2>
          </FadeIn>

          <StaggeredList className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "<300ms", label: "Scan Response Time", description: "95th percentile" },
              { number: "100%", label: "Keyboard Accessible", description: "WCAG compliant" },
              { number: "∞", label: "Events Supported", description: "No limits" }
            ].map((stat, index) => (
              <StaggeredItem key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5, type: "spring" }}
                    className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                  >
                    {stat.number}
                  </motion.div>
                  <h3 className="title-lg mb-2">{stat.label}</h3>
                  <p className="body-sm">{stat.description}</p>
                </motion.div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background Animation */}
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
          className="absolute top-0 left-0 w-full h-full opacity-10"
        >
          <div className="w-96 h-96 bg-white rounded-full blur-3xl absolute top-10 left-10" />
          <div className="w-64 h-64 bg-white rounded-full blur-2xl absolute bottom-10 right-10" />
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <FadeIn delay={0.2}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to create your first event?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join modern event organizers who trust our platform for seamless ticketing.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <HoverScale>
              <Link
                href="/events/new"
                className="inline-flex items-center gap-3 bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="text-2xl">✨</span>
                Create Your First Event
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </HoverScale>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
