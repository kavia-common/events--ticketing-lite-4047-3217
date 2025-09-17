"use client";

import React from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { EventInput, createEvent, updateEvent, Event as EventType } from "@/lib/apiClient";
import { focusAuto } from "@/lib/browserUtils";

type Props =
  | {
      mode: "create";
      onSaved?: (evt: EventType) => void;
    }
  | {
      mode: "edit";
      event: EventType;
      onSaved?: (evt: EventType) => void;
    };

export default function EventForm(props: Props) {
  const [data, setData] = React.useState<EventInput>(() => {
    if (props.mode === "edit") {
      const e = props.event;
      return {
        title: e.title,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        venue: e.venue,
        capacity: e.capacity,
        timezone: e.timezone,
      };
    }
    return {
      title: "",
      startsAt: "",
      endsAt: "",
      venue: "",
      capacity: 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };
  });
  const [err, setErr] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => focusAuto(), []);

  function set<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!data.title || !data.startsAt || !data.endsAt || !data.venue || !data.timezone) {
      setErr("Please complete all required fields.");
      return;
    }
    if (data.capacity <= 0) {
      setErr("Capacity must be a positive number.");
      return;
    }
    if (new Date(data.startsAt) > new Date(data.endsAt)) {
      setErr("Start time must be before end time.");
      return;
    }
    setSaving(true);
    const res =
      props.mode === "create"
        ? await createEvent(data)
        : await updateEvent(props.event.id, data);
    setSaving(false);
    const isError = (v: unknown): v is { message: string } =>
      typeof v === "object" && v !== null && "message" in v;
    if (isError(res)) {
      setErr(res.message);
      return;
    }
    props.onSaved?.(res);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-describedby={err ? "form-error" : undefined}>
      {err && (
        <Alert type="error">
          <p id="form-error">{err}</p>
        </Alert>
      )}
      <Input
        label="Title"
        required
        value={data.title}
        onChange={(e) => set("title", e.target.value)}
        data-autofocus
      />
      <Input
        label="Start Time"
        type="datetime-local"
        required
        value={data.startsAt}
        onChange={(e) => set("startsAt", e.target.value)}
      />
      <Input
        label="End Time"
        type="datetime-local"
        required
        value={data.endsAt}
        onChange={(e) => set("endsAt", e.target.value)}
      />
      <Input
        label="Venue"
        required
        value={data.venue}
        onChange={(e) => set("venue", e.target.value)}
      />
      <Input
        label="Capacity"
        type="number"
        min={1}
        required
        value={Number(data.capacity).toString()}
        onChange={(e) => set("capacity", Number(e.target.value))}
      />
      <Input
        label="Timezone"
        required
        value={data.timezone}
        onChange={(e) => set("timezone", e.target.value)}
        hint="IANA timezone like America/New_York"
      />
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {props.mode === "create" ? "Create Event" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
