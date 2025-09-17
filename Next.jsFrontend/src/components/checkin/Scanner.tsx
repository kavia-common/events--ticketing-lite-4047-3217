"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Input from "../ui/Input";
import { ScanRequest, scanTicket, ScanResponse } from "@/lib/apiClient";
import { FadeIn, HoverScale } from "../ui/MotionProvider";

export default function Scanner() {
  const [payload, setPayload] = React.useState<string>("");
  const [deviceId, setDeviceId] = React.useState<string>("web-1");
  const [result, setResult] = React.useState<ScanResponse | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [scanHistory, setScanHistory] = React.useState<Array<ScanResponse & { timestamp: string; payload: string }>>([]);
  const payloadInputRef = React.useRef<HTMLInputElement>(null);

  async function onScan(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    
    if (!payload) {
      setErr("Provide ticketId or qrPayload.");
      return;
    }
    
    setBusy(true);
    const req: ScanRequest =
      payload.startsWith("{") || payload.includes("tid")
        ? { qrPayload: payload, deviceId }
        : { ticketId: payload, deviceId };
    
    const startTime = Date.now();
    const res = await scanTicket(req);
    const endTime = Date.now();
    
    setBusy(false);
    
    const isError = (v: unknown): v is { message: string } =>
      typeof v === "object" && v !== null && "message" in v;
    
    if (isError(res)) {
      setErr(res.message);
      return;
    }
    
    const scanResult = res as ScanResponse;
    setResult(scanResult);
    
    // Add to scan history
    setScanHistory(prev => [{
      ...scanResult,
      timestamp: new Date().toLocaleTimeString(),
      payload: payload,
      responseMs: endTime - startTime
    }, ...prev.slice(0, 9)]); // Keep last 10 scans
    
    // Clear input and focus for next scan
    setPayload("");
    if (payloadInputRef.current) {
      payloadInputRef.current.focus();
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success": return "text-green-600 bg-green-100";
      case "Duplicate": return "text-yellow-600 bg-yellow-100";
      case "Invalid": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Success": return "✅";
      case "Duplicate": return "⚠️";
      case "Invalid": return "❌";
      default: return "❓";
    }
  };

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
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-4"
          >
            📱
          </motion.div>
          <h3 className="title-xl mb-2">Check-In Scanner</h3>
          <p className="body-md text-gray-600">
            Scan ticket QR codes or enter ticket IDs to validate entry
          </p>
        </div>
      </FadeIn>

      {/* Scanner Interface */}
      <div className="card">
        <form onSubmit={onScan} className="space-y-6">
          {/* Device ID */}
          <FadeIn>
            <Input
              label="Scanner Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="web-1"
              hint="Unique identifier for this scanning device"
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth={2} />
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth={2} />
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth={2} />
                </svg>
              }
            />
          </FadeIn>

          {/* Scan Input */}
          <FadeIn delay={0.1}>
            <Input
              ref={payloadInputRef}
              label="Ticket ID or QR Payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="Paste scanned QR value or enter ticket ID"
              hint="Focus this field and use a USB scanner to paste QR content automatically"
              leftIcon={
                <motion.svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  animate={{ rotate: busy ? 360 : 0 }}
                  transition={{ duration: 1, repeat: busy ? Infinity : 0 }}
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth={2} />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth={2} />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth={2} />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth={2} />
                </motion.svg>
              }
              data-autofocus
            />
          </FadeIn>

          {/* Scan Button */}
          <div className="flex justify-center">
            <HoverScale>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={busy || !payload}
                loading={busy}
                icon={
                  <motion.span
                    animate={{ 
                      scale: busy ? [1, 1.2, 1] : 1,
                      rotate: busy ? 360 : 0
                    }}
                    transition={{ 
                      duration: busy ? 0.5 : 0,
                      repeat: busy ? Infinity : 0
                    }}
                  >
                    {busy ? "⏳" : "🔍"}
                  </motion.span>
                }
              >
                {busy ? "Scanning..." : "Scan Ticket"}
              </Button>
            </HoverScale>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPayload("DEMO-TICKET-123")}
            >
              Demo Ticket ID
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPayload('{"tid":"demo-123","ts":' + Date.now() + '}')}
            >
              Demo QR Payload
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPayload("");
                setScanHistory([]);
                setResult(null);
                setErr(null);
              }}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Scan Result */}
      <AnimatePresence>
        {(result || err) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="card"
          >
            <h4 className="title-lg mb-4 flex items-center gap-2">
              <span>📊</span>
              Scan Result
            </h4>

            {err && (
              <Alert type="error">
                <p>{err}</p>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(result.status)}`}
                  >
                    <motion.span
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: result.status === "Success" ? [0, 10, -10, 0] : 0
                      }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {getStatusIcon(result.status)}
                    </motion.span>
                    <span className="text-lg font-semibold">{result.status}</span>
                  </motion.div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div className="font-semibold">{result.status}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Reason</div>
                    <div className="font-semibold">{result.reason || "ok"}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Response Time</div>
                    <div className="font-semibold">{result.responseMs}ms</div>
                  </div>
                </div>

                {/* Ticket Details */}
                {result.ticket && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <span>🎫</span>
                      Ticket Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">ID:</span> {result.ticket.id}
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span> {result.ticket.status}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h4 className="title-lg mb-4 flex items-center gap-2">
            <span>📜</span>
            Recent Scans
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scanHistory.map((scan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getStatusIcon(scan.status)}</span>
                  <div>
                    <div className="font-medium text-sm">
                      {scan.status} - {scan.reason || "ok"}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {scan.payload}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-xs text-gray-500">
                  <div>{scan.timestamp}</div>
                  <div>{scan.responseMs}ms</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <FadeIn delay={0.4}>
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="title-lg mb-4 flex items-center gap-2 text-blue-800">
            <span>💡</span>
            Scanning Tips
          </h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Focus the input field and use a USB scanner to automatically paste QR content</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Press Enter or click Scan after entering a ticket ID manually</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>The system supports both raw ticket IDs and JSON QR payloads</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Duplicate scans are automatically detected and prevented</span>
            </li>
          </ul>
        </div>
      </FadeIn>
    </motion.div>
  );
}
