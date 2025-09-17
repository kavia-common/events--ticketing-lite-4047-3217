"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useEvents, deleteEvent, Event } from "@/lib/apiClient";

export default function EventsPage() {
  const { data, error, isLoading } = useEvents();
  const [err, setErr] = React.useState<string | null>(null);

  async function onDelete(evt: Event) {
    setErr(null);
    const ok = confirm(`Delete event "${evt.title}"? This cannot be undone.`);
    if (!ok) return;
    const res = await deleteEvent(evt.id);
    if (res !== true) setErr(res.message);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Events</h1>
        <Link href="/events/new">
          <Button>Create Event</Button>
        </Link>
      </div>

      {err && (
        <Alert type="error">
          <p>{err}</p>
        </Alert>
      )}

      {isLoading && <div>Loading…</div>}
      {error && <div className="text-red-700">Failed to load events.</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">Title</th>
              <th className="text-left p-2 border">When</th>
              <th className="text-left p-2 border">Venue</th>
              <th className="text-left p-2 border">Capacity</th>
              <th className="text-left p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((e) => (
              <tr key={e.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border">
                  <Link className="underline" href={`/events/${e.id}`}>
                    {e.title}
                  </Link>
                </td>
                <td className="p-2 border">
                  {new Date(e.startsAt).toLocaleString()} –{" "}
                  {new Date(e.endsAt).toLocaleString()} ({e.timezone})
                </td>
                <td className="p-2 border">{e.venue}</td>
                <td className="p-2 border">{e.capacity}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <Link href={`/events/${e.id}/edit`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <Button variant="danger" onClick={() => onDelete(e)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td className="p-2 border text-gray-600" colSpan={5}>
                  No events yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
