"use client";

import React from "react";
import { motion } from "framer-motion";
import { Id, useCheckInReport } from "@/lib/apiClient";
import { FadeIn, StaggeredList, StaggeredItem } from "../ui/MotionProvider";

export default function ReportWidget({ eventId }: { eventId: Id }) {
  const { data, error, isLoading } = useCheckInReport(eventId);
  const [previousData, setPreviousData] = React.useState(data);

  // Track changes for animations
  React.useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(previousData)) {
      setPreviousData(data);
    }
  }, [data, previousData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <div className="skeleton h-6 w-32 mx-auto mb-2"></div>
          <div className="skeleton h-4 w-48 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-20 mb-2"></div>
              <div className="skeleton h-8 w-16 mb-4"></div>
              <div className="skeleton h-20 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <FadeIn>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="title-lg mb-2 text-red-600">Failed to load report</h3>
          <p className="body-md text-gray-600">
            Something went wrong while fetching the check-in report.
          </p>
        </div>
      </FadeIn>
    );
  }

  const issued = data?.issued ?? 0;
  const checkedIn = data?.checkedIn ?? 0;
  const duplicates = data?.duplicates ?? 0;
  const remaining = Math.max(0, issued - checkedIn);
  
  const checkInRate = issued > 0 ? (checkedIn / issued) * 100 : 0;
  const duplicateRate = checkedIn > 0 ? (duplicates / checkedIn) * 100 : 0;

  const stats = [
    {
      label: "Tickets Issued",
      value: issued,
      icon: "🎫",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      change: "total"
    },
    {
      label: "Checked In",
      value: checkedIn,
      icon: "✅",
      color: "bg-green-100 text-green-700 border-green-200",
      change: "success"
    },
    {
      label: "Remaining",
      value: remaining,
      icon: "⏳",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      change: "pending"
    },
    {
      label: "Duplicates",
      value: duplicates,
      icon: "⚠️",
      color: "bg-red-100 text-red-700 border-red-200",
      change: "warning"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      {/* Header */}
      <FadeIn>
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="text-6xl mb-4"
          >
            📊
          </motion.div>
          <h3 className="title-xl mb-2">Real-Time Report</h3>
          <p className="body-md text-gray-600">
            Live check-in statistics and event progress
          </p>
        </div>
      </FadeIn>

      {/* Main Stats Grid */}
      <StaggeredList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StaggeredItem key={stat.label}>
            <motion.div
              whileHover={{ 
                scale: 1.02,
                y: -2
              }}
              className={`card p-6 border-2 ${stat.color} cursor-pointer`}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: stat.change === "success" ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    repeatDelay: 2 + index * 0.5 
                  }}
                  className="text-3xl mb-2"
                >
                  {stat.icon}
                </motion.div>
                
                <div className="text-xs font-medium uppercase tracking-wide mb-2 opacity-75">
                  {stat.label}
                </div>
                
                <motion.div
                  key={stat.value}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-3xl font-bold"
                >
                  {stat.value.toLocaleString()}
                </motion.div>
              </div>
            </motion.div>
          </StaggeredItem>
        ))}
      </StaggeredList>

      {/* Progress Visualization */}
      <div className="card">
        <h4 className="title-lg mb-6 flex items-center gap-2">
          <span>📈</span>
          Check-In Progress
        </h4>
        
        <div className="space-y-6">
          {/* Overall Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Check-In Rate</span>
              <span className="text-sm text-gray-600">
                {checkInRate.toFixed(1)}% ({checkedIn} of {issued})
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${checkInRate}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>

          {/* Duplicate Rate */}
          {duplicates > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Duplicate Rate</span>
                <span className="text-sm text-gray-600">
                  {duplicateRate.toFixed(1)}% ({duplicates} duplicates)
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${duplicateRate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
                />
              </div>
            </motion.div>
          )}

          {/* Visual Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
              <div className="text-xs text-gray-600">Issued</div>
              <div className="font-semibold">{issued}</div>
            </div>
            
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="text-xs text-gray-600">Checked In</div>
              <div className="font-semibold">{checkedIn}</div>
            </div>
            
            <div className="text-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <div className="text-xs text-gray-600">Remaining</div>
              <div className="font-semibold">{remaining}</div>
            </div>
            
            <div className="text-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
              <div className="text-xs text-gray-600">Duplicates</div>
              <div className="font-semibold">{duplicates}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Last Scan Info */}
        <div className="card">
          <h4 className="title-lg mb-4 flex items-center gap-2">
            <span>🕐</span>
            Last Activity
          </h4>
          
          <div className="text-center">
            {data?.lastScannedAt ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {new Date(data.lastScannedAt).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(data.lastScannedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ) : (
              <div className="text-gray-500">
                <div className="text-4xl mb-2">😴</div>
                <div>No scans yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h4 className="title-lg mb-4 flex items-center gap-2">
            <span>⚡</span>
            Quick Stats
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Utilization Rate:</span>
              <span className="font-semibold">
                {issued > 0 ? `${((checkedIn / issued) * 100).toFixed(1)}%` : "0%"}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Rate:</span>
              <span className="font-semibold">
                {checkedIn > 0 ? `${((duplicates / checkedIn) * 100).toFixed(1)}%` : "0%"}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <motion.span
                animate={{ 
                  color: issued > 0 && checkedIn > 0 ? "#10b981" : "#6b7280"
                }}
                className="font-semibold"
              >
                {issued > 0 && checkedIn > 0 ? "Active" : "Waiting"}
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Update Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-gray-500"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Live updates every 2 seconds</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
