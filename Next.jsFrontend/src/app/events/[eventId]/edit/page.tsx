"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import EventForm from "@/components/events/EventForm";
import { useEvent, Id } from "@/lib/apiClient";

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: Id }>();
  const { data: event, error } = useEvent(eventId);
  const router = useRouter();

  if (error) return <div className="text-red-700">Failed to load event.</div>;
  if (!event) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Event</h1>
      <EventForm
        mode="edit"
        event={event}
        onSaved={() => router.push(`/events/${eventId}`)}
      />
    </div>
  );
}
