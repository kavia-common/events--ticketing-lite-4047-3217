"use client";

import React from "react";
import { Id, useCheckInReport } from "@/lib/apiClient";

export default function ReportWidget({ eventId }: { eventId: Id }) {
  const { data, error, isLoading } = useCheckInReport(eventId);

  if (isLoading) {
    return <div className="text-sm text-gray-600">Loading report…</div>;
  }
  if (error) {
    return (
      <div className="text-sm text-red-700">Failed to load report.</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded border p-3">
        <div className="text-xs text-gray-600">Issued</div>
        <div className="text-2xl font-semibold">{data?.issued ?? 0}</div>
      </div>
      <div className="rounded border p-3">
        <div className="text-xs text-gray-600">Checked-In</div>
        <div className="text-2xl font-semibold">{data?.checkedIn ?? 0}</div>
      </div>
      <div className="rounded border p-3">
        <div className="text-xs text-gray-600">Duplicates</div>
        <div className="text-2xl font-semibold">{data?.duplicates ?? 0}</div>
      </div>
      <div className="col-span-3 text-xs text-gray-600">
        Last scanned at: {data?.lastScannedAt ? new Date(data.lastScannedAt).toLocaleString() : "—"}
      </div>
    </div>
  );
}
