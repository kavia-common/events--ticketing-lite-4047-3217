"use client";

import React from "react";
import EventForm from "@/components/events/EventForm";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Create Event</h1>
      <EventForm
        mode="create"
        onSaved={(evt) => router.push(`/events/${evt.id}`)}
      />
    </div>
  );
}
