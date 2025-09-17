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
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Title</th>
              <th>When</th>
              <th>Venue</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((e) => (
              <tr key={e.id}>
                <td>
                  <Link className="underline underline-offset-2" href={`/events/${e.id}`}>
                    {e.title}
                  </Link>
                </td>
                <td>
                  {new Date(e.startsAt).toLocaleString()} –{" "}
                  {new Date(e.endsAt).toLocaleString()} ({e.timezone})
                </td>
                <td>{e.venue}</td>
                <td>{e.capacity}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
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
                <td className="text-gray-600" colSpan={5}>
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
