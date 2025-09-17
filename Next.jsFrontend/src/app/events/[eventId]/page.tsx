"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import TicketTypesManager from "@/components/events/TicketTypesManager";
import TicketGenerationPanel from "@/components/tickets/TicketGenerationPanel";
import CsvImport from "@/components/tickets/CsvImport";
import Scanner from "@/components/checkin/Scanner";
import ReportWidget from "@/components/checkin/ReportWidget";
import { useEvent, Id, downloadZipForEvent } from "@/lib/apiClient";
import { saveBlob } from "@/lib/browserUtils";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: Id }>();
  const { data: event, error } = useEvent(eventId);
  type TabKey = "overview" | "types" | "generate" | "csv" | "scan" | "report";
  const [tab, setTab] = React.useState<TabKey>("overview");
  const [err, setErr] = React.useState<string | null>(null);

  async function downloadAll() {
    setErr(null);
    const blob = await downloadZipForEvent(eventId);
    if (blob instanceof Blob) saveBlob(blob, `event-${eventId}-tickets.zip`);
    else setErr(blob.message);
  }

  if (error) {
    return <div className="text-red-700">Failed to load event.</div>;
  }
  if (!event) {
    return <div>Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <div className="text-sm text-gray-600">
            {new Date(event.startsAt).toLocaleString()} –{" "}
            {new Date(event.endsAt).toLocaleString()} ({event.timezone}) •{" "}
            Capacity: {event.capacity} • Venue: {event.venue}
          </div>
        </div>
        <Link href={`/events/${eventId}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
      </div>

      {err && (
        <Alert type="error">
          <p>{err}</p>
        </Alert>
      )}

      <div role="tablist" aria-label="Event sections" className="flex gap-2">
        {[
          ["overview", "Overview"],
          ["types", "Ticket Types"],
          ["generate", "Generate Tickets"],
          ["csv", "CSV Import"],
          ["scan", "Check-In"],
          ["report", "Report"],
        ].map(([k, label]) => {
          const key = k as TabKey;
          const active = tab === key;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={active}
              className={`px-3 py-1 rounded ${
                active ? "bg-blue-600 text-white" : "bg-gray-100"
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <p className="text-gray-700">
            Use the tabs to define ticket types, generate and distribute tickets,
            scan for check-in, and monitor real-time reports.
          </p>
          <Button onClick={downloadAll} variant="secondary">
            Download All Tickets (ZIP)
          </Button>
        </div>
      )}

      {tab === "types" && <TicketTypesManager eventId={eventId} />}

      {tab === "generate" && <TicketGenerationPanel eventId={eventId} />}

      {tab === "csv" && <CsvImport eventId={eventId} />}

      {tab === "scan" && <Scanner />}

      {tab === "report" && <ReportWidget eventId={eventId} />}
    </div>
  );
}
