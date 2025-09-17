"use client";

import React from "react";
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

export default function TicketGenerationPanel({ eventId }: { eventId: Id }) {
  const { data: types } = useTicketTypes(eventId);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [previewTicketId, setPreviewTicketId] = React.useState<Id | null>(null);
  const [attendees, setAttendees] = React.useState<
    Array<{ name: string; email: string; ticketTypeId: Id }>
  >([{ name: "", email: "", ticketTypeId: "" as Id }]);
  const [blankCount, setBlankCount] = React.useState<number>(0);
  const [sendEmail, setSendEmail] = React.useState<boolean>(false);

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
    }
    alert(`Generated ${res.tickets.length} ticket(s).`);
  }

  async function onDownload(ticketId: Id) {
    const blob = await downloadTicketPdf(ticketId);
    if (blob instanceof Blob) {
      saveBlob(blob, `ticket-${ticketId}.pdf`);
    } else {
      alert(`Download failed: ${blob.message}`);
    }
  }

  async function onSend(ticketId: Id) {
    const res = await sendTicketEmail(ticketId);
    if (res === true) alert("Email sent.");
    else alert(`Email error: ${res.message}`);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Generate Tickets</h3>
      {err && (
        <Alert type="error">
          <p>{err}</p>
        </Alert>
      )}
      <form onSubmit={onGenerate} className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              id="send-email"
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="send-email" className="text-sm">
              Send ticket links via email
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Attendees</h4>
          <div className="overflow-x-auto">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Ticket Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        aria-label={`Attendee ${i + 1} name`}
                        value={row.name}
                        onChange={(e) => updateRow(i, { name: e.target.value })}
                        className="w-44"
                      />
                    </td>
                    <td>
                      <input
                        aria-label={`Attendee ${i + 1} email`}
                        type="email"
                        value={row.email}
                        onChange={(e) => updateRow(i, { email: e.target.value })}
                        className="w-60"
                      />
                    </td>
                    <td>
                      <select
                        aria-label={`Attendee ${i + 1} ticket type`}
                        value={row.ticketTypeId || ""}
                        onChange={(e) =>
                          updateRow(i, { ticketTypeId: e.target.value as unknown as Id })
                        }
                      >
                        <option value="">Select type</option>
                        {(types || []).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (${t.price}) – {t.quantity} total
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeRow(i)}
                        aria-label={`Remove attendee ${i + 1}`}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4}>
                    <Button type="button" variant="secondary" onClick={addRow}>
                      Add Row
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <Input
              label="Generate blank tickets (count)"
              type="number"
              min={0}
              value={blankCount.toString()}
              onChange={(e) => setBlankCount(Number(e.target.value))}
              hint="Use 0 to skip"
            />
          </div>
        </div>
        <Button type="submit" disabled={busy}>
          Generate
        </Button>
      </form>

      {previewTicketId && (
        <div className="space-y-2">
          <h4 className="font-medium">Quick actions for latest ticket</h4>
          <div className="flex gap-2">
            <Button type="button" onClick={() => onDownload(previewTicketId!)}>
              Download PDF
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onSend(previewTicketId!)}
            >
              Send Email
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
