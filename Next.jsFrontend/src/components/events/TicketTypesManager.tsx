"use client";

import React from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import {
  Id,
  TicketTypeInput,
  TicketType,
  addTicketType,
  removeTicketType,
  updateTicketType,
  useTicketTypes,
  useEvent,
} from "@/lib/apiClient";

export default function TicketTypesManager({ eventId }: { eventId: Id }) {
  const { data: event } = useEvent(eventId);
  const { data: types } = useTicketTypes(eventId);
  const [form, setForm] = React.useState<TicketTypeInput>({
    name: "",
    price: 0,
    quantity: 0,
  });
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const totalQty = (types || []).reduce((sum, t) => sum + (t.quantity || 0), 0);
  const overCapacity =
    event && form.quantity + totalQty > (event?.capacity || Infinity);

  function set<K extends keyof TicketTypeInput>(
    k: K,
    v: TicketTypeInput[K]
  ) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.name || form.price < 0 || form.quantity <= 0) {
      setErr("Please provide valid name, non-negative price, and positive quantity.");
      return;
    }
    if (overCapacity) {
      setErr("Total ticket quantities exceed event capacity.");
      return;
    }
    setLoading(true);
    const res = await addTicketType(eventId, form);
    setLoading(false);
    const isError = (v: unknown): v is { message: string } =>
      typeof v === "object" && v !== null && "message" in v;
    if (isError(res)) {
      setErr(res.message);
      return;
    }
    setForm({ name: "", price: 0, quantity: 0 });
  }

  async function onUpdate(tt: TicketType, patch: Partial<TicketTypeInput>) {
    setErr(null);
    if (patch.quantity !== undefined) {
      const newTotal =
        (types || []).reduce(
          (sum, t) => sum + (t.id === tt.id ? patch.quantity! : t.quantity),
          0
        );
      if (event && newTotal > event.capacity) {
        setErr("Total ticket quantities exceed event capacity.");
        return;
      }
    }
    const res = await updateTicketType(eventId, tt.id, patch);
    const isError = (v: unknown): v is { message: string } =>
      typeof v === "object" && v !== null && "message" in v;
    if (isError(res)) {
      setErr(res.message);
    }
  }

  async function onRemove(tt: TicketType) {
    setErr(null);
    const confirmed = confirm(
      "Remove this ticket type? Allowed only if no tickets were issued."
    );
    if (!confirmed) return;
    const res = await removeTicketType(eventId, tt.id);
    const isError = (v: unknown): v is { message: string } =>
      typeof v === "object" && v !== null && "message" in v;
    if (isError(res)) setErr(res.message);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ticket Types</h3>
      {err && (
        <Alert type="error">
          <p>{err}</p>
        </Alert>
      )}
      <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <Input
          label="Price"
          type="number"
          min={0}
          step={0.01}
          required
          value={Number(form.price).toString()}
          onChange={(e) => set("price", Number(e.target.value))}
        />
        <Input
          label="Quantity"
          type="number"
          min={1}
          required
          value={Number(form.quantity).toString()}
          onChange={(e) => set("quantity", Number(e.target.value))}
        />
        <div className="flex items-end">
          <Button type="submit" disabled={loading}>
            Add Type
          </Button>
        </div>
      </form>
      {overCapacity && (
        <Alert type="warning">
          <p>Total quantity with new type would exceed event capacity.</p>
        </Alert>
      )}
      <div className="overflow-x-auto">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Issued</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(types || []).map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={t.price}
                    className="w-28"
                    aria-label={`Price for ${t.name}`}
                    onBlur={(e) =>
                      onUpdate(t, { price: Number(e.currentTarget.value) })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    defaultValue={t.quantity}
                    className="w-24"
                    aria-label={`Quantity for ${t.name}`}
                    onBlur={(e) =>
                      onUpdate(t, { quantity: Number(e.currentTarget.value) })
                    }
                  />
                </td>
                <td>{t.issued ?? 0}</td>
                <td>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => onRemove(t)}
                    aria-label={`Remove ${t.name}`}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            {(!types || types.length === 0) && (
              <tr>
                <td className="text-gray-500" colSpan={5}>
                  No ticket types yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-600">
        Total configured quantity: {totalQty} / Capacity: {event?.capacity ?? "-"}
      </div>
    </div>
  );
}
