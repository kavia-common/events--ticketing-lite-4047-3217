"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Alert from "../ui/Alert";
import {
  Id,
  useTicketTypes,
  TicketIssueInput,
  generateTickets,
  downloadTicketPdf,
  sendTicketEmail,
} from "@/lib/apiClient";
import { saveBlob } from "@/lib/browserUtils";
import { FadeIn, StaggeredList, StaggeredItem, HoverScale } from "../ui/MotionProvider";

export default function TicketGenerationPanel({ eventId }: { eventId: Id }) {
  const { data: types } = useTicketTypes(eventId);
  const [err, setErr] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [previewTicketId, setPreviewTicketId] = React.useState<Id | null>(null);
  const [attendees, setAttendees] = React.useState<
    Array<{ name: string; email: string; ticketTypeId: Id }>
  >([{ name: "", email: "", ticketTypeId: "" as Id }]);
  const [blankCount, setBlankCount] = React.useState<number>(0);
  const [sendEmail, setSendEmail] = React.useState<boolean>(false);
  const [generatedTickets, setGeneratedTickets] = React.useState<Array<{ id: Id; [key: string]: unknown }>>([]);

  function updateRow(
    idx: number,
    patch: Partial<{ name: string; email: string; ticketTypeId: Id }>
  ) {
    setAttendees((rows) => {
      const next = [...rows];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function addRow() {
    setAttendees((r) => [...r, { name: "", email: "", ticketTypeId: "" as Id }]);
  }

  function removeRow(index: number) {
    setAttendees((r) => r.filter((_, i) => i !== index));
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccess(null);
    
    if ((attendees.some((r) => r.email || r.name || r.ticketTypeId) && attendees.some((r) => !r.ticketTypeId))) {
      setErr("Each attendee row must select a ticket type.");
      return;
    }
    
    const filled = attendees.filter((r) => r.email || r.name || r.ticketTypeId);
    if (filled.length === 0 && blankCount <= 0) {
      setErr("Provide at least one attendee row or a blank count.");
      return;
    }

    const payload: TicketIssueInput = {};
    if (filled.length > 0) {
      payload.attendees = filled.map((r) => ({
        name: r.name || undefined,
        email: r.email || undefined,
        ticketTypeId: r.ticketTypeId,
      }));
    }
    if (blankCount > 0) payload.count = blankCount;
    payload.sendEmail = sendEmail;

    setBusy(true);
    const res = await generateTickets(eventId, payload);
    setBusy(false);
    
    const isError = (v: unknown): v is { message: string } =>
      typeof v === "object" && v !== null && "message" in v;
    
    if (isError(res)) {
      setErr(res.message);
      return;
    }
    
    if (res.tickets.length > 0) {
      setPreviewTicketId(res.tickets[0].id);
      setGeneratedTickets(res.tickets);
      setSuccess(`Successfully generated ${res.tickets.length} ticket(s)!`);
    }
  }

  async function onDownload(ticketId: Id) {
    const blob = await downloadTicketPdf(ticketId);
    if (blob instanceof Blob) {
      saveBlob(blob, `ticket-${ticketId}.pdf`);
    } else {
      setErr(`Download failed: ${blob.message}`);
    }
  }

  async function onSend(ticketId: Id) {
    const res = await sendTicketEmail(ticketId);
    if (res === true) {
      setSuccess("Email sent successfully!");
    } else {
      setErr(`Email error: ${res.message}`);
    }
  }

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
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl mb-4"
          >
            ✨
          </motion.div>
          <h3 className="title-xl mb-2">Generate Tickets</h3>
          <p className="body-md text-gray-600">
            Create personalized tickets for attendees or generate blank tickets for manual distribution
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

      {/* Generation Form */}
      <div className="card">
        <form onSubmit={onGenerate} className="space-y-6">
          {/* Email Option */}
          <FadeIn>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <motion.input
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                id="send-email"
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="send-email" className="flex items-center gap-2 text-sm font-medium">
                <span>📧</span>
                Send ticket links via email automatically
              </label>
            </div>
          </FadeIn>

          {/* Attendees Section */}
          <div className="space-y-4">
            <h4 className="title-lg flex items-center gap-2">
              <span>👥</span>
              Attendee Details
            </h4>
            
            <div className="overflow-x-auto">
              <div className="min-w-full space-y-3">
                <StaggeredList>
                  {attendees.map((row, i) => (
                    <StaggeredItem key={i}>
                      <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <Input
                          label={`Attendee ${i + 1} Name`}
                          value={row.name}
                          onChange={(e) => updateRow(i, { name: e.target.value })}
                          placeholder="Full name"
                          variant="minimal"
                        />
                        
                        <Input
                          label="Email"
                          type="email"
                          value={row.email}
                          onChange={(e) => updateRow(i, { email: e.target.value })}
                          placeholder="email@example.com"
                          variant="minimal"
                        />
                        
                        <div className="form-group">
                          <label className="form-label">Ticket Type</label>
                          <select
                            value={row.ticketTypeId || ""}
                            onChange={(e) =>
                              updateRow(i, { ticketTypeId: e.target.value as unknown as Id })
                            }
                            className="form-select"
                          >
                            <option value="">Select type</option>
                            {(types || []).map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} (${t.price}) – {t.quantity} available
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeRow(i)}
                            disabled={attendees.length === 1}
                          >
                            <span className="mr-1">🗑️</span>
                            Remove
                          </Button>
                        </div>
                      </motion.div>
                    </StaggeredItem>
                  ))}
                </StaggeredList>
                
                <FadeIn>
                  <HoverScale>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addRow}
                      className="w-full md:w-auto"
                    >
                      <span className="mr-2">➕</span>
                      Add Another Attendee
                    </Button>
                  </HoverScale>
                </FadeIn>
              </div>
            </div>
          </div>

          {/* Blank Tickets Section */}
          <div className="space-y-4">
            <h4 className="title-lg flex items-center gap-2">
              <span>🎫</span>
              Blank Tickets
            </h4>
            <Input
              label="Number of blank tickets"
              type="number"
              min={0}
              value={blankCount.toString()}
              onChange={(e) => setBlankCount(Number(e.target.value))}
              hint="Generate tickets without specific attendee information"
              placeholder="0"
              variant="minimal"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <HoverScale>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={busy}
                loading={busy}
                icon={
                  <motion.span
                    animate={{ rotate: busy ? 360 : 0 }}
                    transition={{ duration: 1, repeat: busy ? Infinity : 0 }}
                  >
                    {busy ? "⏳" : "🎫"}
                  </motion.span>
                }
              >
                {busy ? "Generating..." : "Generate Tickets"}
              </Button>
            </HoverScale>
          </div>
        </form>
      </div>

      {/* Generated Tickets Actions */}
      <AnimatePresence>
        {previewTicketId && generatedTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
          >
            <h4 className="title-lg mb-6 flex items-center gap-2">
              <span>🎉</span>
              Tickets Generated Successfully!
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div>
                <h5 className="font-medium mb-4">Quick Actions for Latest Ticket</h5>
                <div className="space-y-3">
                  <HoverScale>
                    <Button
                      onClick={() => onDownload(previewTicketId!)}
                      variant="primary"
                      className="w-full"
                    >
                      <span className="mr-2">📄</span>
                      Download PDF
                    </Button>
                  </HoverScale>
                  
                  <HoverScale>
                    <Button
                      onClick={() => onSend(previewTicketId!)}
                      variant="secondary"
                      className="w-full"
                    >
                      <span className="mr-2">📧</span>
                      Send Email
                    </Button>
                  </HoverScale>
                </div>
              </div>
              
              {/* Summary */}
              <div>
                <h5 className="font-medium mb-4">Generation Summary</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Tickets:</span>
                    <span className="font-medium">{generatedTickets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Delivery:</span>
                    <span className={`font-medium ${sendEmail ? 'text-green-600' : 'text-gray-600'}`}>
                      {sendEmail ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generation Time:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
