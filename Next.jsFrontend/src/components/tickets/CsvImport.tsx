"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { apiUrl } from "@/lib/config";
import type { Id } from "@/lib/apiClient";
import { FadeIn, HoverScale } from "../ui/MotionProvider";

export default function CsvImport({ eventId }: { eventId: Id }) {
  const [err, setErr] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      } else {
        setErr("Please select a CSV file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  async function onUpload() {
    setErr(null);
    setSuccess(null);
    
    if (!file) {
      setErr("Select a CSV file first.");
      return;
    }
    
    const form = new FormData();
    form.append("file", file);
    setBusy(true);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const res = await fetch(apiUrl(`/events/${eventId}/tickets/import`), {
        method: "POST",
        body: form,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setBusy(false);
      
      if (!res.ok) {
        try {
          const j = await res.json();
          setErr(j?.message || "Import failed.");
        } catch {
          setErr("Import failed.");
        }
        return;
      }
      
      const summary = await res.json();
      setSuccess(
        `Import completed! ${summary.created} tickets created, ${summary.failed} failed${
          summary.errors ? ` – errors: ${summary.errors.join("; ")}` : ""
        }`
      );
      
      // Reset form
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      clearInterval(progressInterval);
      setBusy(false);
      setErr("Network error during upload");
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-4"
          >
            📄
          </motion.div>
          <h3 className="title-xl mb-2">CSV Import</h3>
          <p className="body-md text-gray-600">
            Upload a CSV file to bulk import attendee tickets (optional feature)
          </p>
        </div>
      </FadeIn>

      {/* Alerts */}
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
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Alert type="success" onClose={() => setSuccess(null)}>
              <p>{success}</p>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Interface */}
      <div className="card">
        <h4 className="title-lg mb-6 flex items-center gap-2">
          <span>📤</span>
          Upload CSV File
        </h4>

        {/* File Drop Zone */}
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          animate={{
            borderColor: dragActive ? "#3b82f6" : "#e5e7eb",
            backgroundColor: dragActive ? "#dbeafe" : "#ffffff"
          }}
          className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
        >
          {!file ? (
            <div className="space-y-4">
              <motion.div
                animate={{ 
                  y: dragActive ? -5 : 0,
                  scale: dragActive ? 1.1 : 1
                }}
                transition={{ duration: 0.2 }}
                className="text-6xl"
              >
                📁
              </motion.div>
              
              <div>
                <h5 className="title-lg mb-2">
                  {dragActive ? "Drop your CSV file here" : "Upload CSV File"}
                </h5>
                <p className="body-md text-gray-600 mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                
                <HoverScale>
                  <Button
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="mr-2">📎</span>
                    Choose File
                  </Button>
                </HoverScale>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="text-4xl">✅</div>
              <div>
                <h5 className="title-lg mb-2">File Selected</h5>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span>📄 {file.name}</span>
                  <span>📊 {(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <HoverScale>
                  <Button
                    variant="primary"
                    onClick={onUpload}
                    disabled={busy}
                    loading={busy}
                  >
                    <span className="mr-2">🚀</span>
                    {busy ? "Uploading..." : "Upload & Import"}
                  </Button>
                </HoverScale>
                
                <Button
                  variant="ghost"
                  onClick={removeFile}
                  disabled={busy}
                >
                  <span className="mr-2">🗑️</span>
                  Remove
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Upload Progress */}
        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSV Format Guide */}
      <div className="card bg-blue-50 border-blue-200">
        <h4 className="title-lg mb-4 flex items-center gap-2 text-blue-800">
          <span>📋</span>
          CSV Format Requirements
        </h4>
        
        <div className="space-y-4 text-blue-700">
          <div>
            <h5 className="font-medium mb-2">Required Columns:</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-medium">name</div>
                <div className="text-xs text-blue-600">Attendee full name</div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-medium">email</div>
                <div className="text-xs text-blue-600">Valid email address</div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-medium">ticketType</div>
                <div className="text-xs text-blue-600">Existing ticket type name</div>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Example CSV Content:</h5>
            <div className="bg-white p-3 rounded border border-blue-200 font-mono text-xs">
              name,email,ticketType<br/>
              John Doe,john@example.com,General<br/>
              Jane Smith,jane@example.com,VIP<br/>
              Bob Johnson,bob@example.com,General
            </div>
          </div>
          
          <div className="text-sm">
            <h5 className="font-medium mb-2">Important Notes:</h5>
            <ul className="space-y-1">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>CSV file must include headers in the first row</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Invalid rows will be reported and skipped</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Ticket types must exist before importing</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Email addresses must be valid and unique</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
