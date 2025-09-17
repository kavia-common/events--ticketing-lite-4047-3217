"use client";

import React from "react";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { apiUrl } from "@/lib/config";
import type { Id } from "@/lib/apiClient";

export default function CsvImport({ eventId }: { eventId: Id }) {
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  async function onUpload() {
    setErr(null);
    setOk(null);
    if (!file) {
      setErr("Select a CSV file first.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setBusy(true);
    const res = await fetch(apiUrl(`/events/${eventId}/tickets/import`), {
      method: "POST",
      body: form,
    });
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
    setOk(
      `Imported: ${summary.created} created, ${summary.failed} failed${
        summary.errors ? ` – errors: ${summary.errors.join("; ")}` : ""
      }`
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">CSV Import (stretch)</h4>
      {err && (
        <Alert type="error">
          <p>{err}</p>
        </Alert>
      )}
      {ok && (
        <Alert type="success">
          <p>{ok}</p>
        </Alert>
      )}
      <div className="flex items-center gap-3">
        <input
          aria-label="Attendees CSV"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button type="button" onClick={onUpload} disabled={busy}>
          Upload
        </Button>
      </div>
      <p className="text-xs text-gray-600">
        CSV columns: name,email,ticketType. Invalid rows will be reported.
      </p>
    </div>
  );
}
