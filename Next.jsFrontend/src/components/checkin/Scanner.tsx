"use client";

import React from "react";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { ScanRequest, scanTicket, ScanResponse } from "@/lib/apiClient";

export default function Scanner() {
  const [payload, setPayload] = React.useState<string>("");
  const [deviceId, setDeviceId] = React.useState<string>("web-1");
  const [result, setResult] = React.useState<ScanResponse | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

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
    const res = await scanTicket(req);
    setBusy(false);
    const isError = (v: unknown): v is { message: string } =>
      typeof v === "object" && v !== null && "message" in v;
    if (isError(res)) {
      setErr(res.message);
      return;
    }
    setResult(res as ScanResponse);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Check-In Scanner</h3>
      {err && (
        <Alert type="error">
          <p>{err}</p>
        </Alert>
      )}
      {result && (
        <Alert
          type={
            result.status === "Success"
              ? "success"
              : result.status === "Duplicate"
              ? "warning"
              : "error"
          }
        >
          <div className="flex flex-col">
            <span>Status: {result.status}</span>
            <span>Reason: {result.reason ?? "ok"}</span>
            <span>Response: {result.responseMs} ms</span>
            {result.ticket && (
              <span>
                Ticket: {result.ticket.id} – {result.ticket.status}
              </span>
            )}
          </div>
        </Alert>
      )}

      <form onSubmit={onScan} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label htmlFor="device" className="text-sm font-medium">
            Device ID
          </label>
          <input
            id="device"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
        </div>
        <div className="flex flex-col min-w-[320px]">
          <label htmlFor="payload" className="text-sm font-medium">
            Ticket ID or QR Payload
          </label>
          <input
            id="payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Paste scanned QR value or ticketId"
            data-autofocus
          />
        </div>
        <Button type="submit" disabled={busy}>
          Scan
        </Button>
      </form>
      <p className="text-xs text-gray-600">
        Tip: Focus input and use a USB scanner to paste QR content. Keyboard accessible.
      </p>
    </div>
  );
}
