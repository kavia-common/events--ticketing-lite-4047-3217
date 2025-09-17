"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { FadeIn, StaggeredList, StaggeredItem, HoverScale } from "../ui/MotionProvider";

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
  const [editingId, setEditingId] = React.useState<Id | null>(null);
  const [editValues, setEditValues] = React.useState<Record<Id, Partial<TicketType>>>({});

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
    } else {
      setEditingId(null);
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[tt.id];
        return newValues;
      });
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

  const startEdit = (tt: TicketType) => {
    setEditingId(tt.id);
    setEditValues(prev => ({
      ...prev,
      [tt.id]: { name: tt.name, price: tt.price, quantity: tt.quantity }
    }));
  };

  const cancelEdit = (ttId: Id) => {
    setEditingId(null);
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[ttId];
      return newValues;
    });
  };

  const saveEdit = (tt: TicketType) => {
    const values = editValues[tt.id];
    if (values) {
      onUpdate(tt, values);
    }
  };

  const updateEditValue = (ttId: Id, field: keyof TicketType, value: string | number) => {
    setEditValues(prev => ({
      ...prev,
      [ttId]: { ...prev[ttId], [field]: value }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      {/* Header */}
      <FadeIn>
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-4"
          >
            🎭
          </motion.div>
          <h3 className="title-xl mb-2">Ticket Types</h3>
          <p className="body-md text-gray-600">
            Define different ticket categories with pricing and availability
          </p>
        </div>
      </FadeIn>

      {/* Error Alert */}
      <AnimatePresence>
        {err && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Alert type="error" onClose={() => setErr(null)}>
              <p>{err}</p>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Ticket Type Form */}
      <div className="card">
        <h4 className="title-lg mb-6 flex items-center gap-2">
          <span>➕</span>
          Add New Ticket Type
        </h4>
        
        <form onSubmit={onAdd} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Ticket Name"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g., General, VIP, Early Bird"
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth={2} />
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth={2} />
                </svg>
              }
            />
            
            <Input
              label="Price ($)"
              type="number"
              min={0}
              step={0.01}
              required
              value={Number(form.price).toString()}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="0.00"
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth={2} />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth={2} />
                </svg>
              }
            />
            
            <Input
              label="Quantity"
              type="number"
              min={1}
              required
              value={Number(form.quantity).toString()}
              onChange={(e) => set("quantity", Number(e.target.value))}
              placeholder="100"
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth={2} />
                  <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth={2} />
                  <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth={2} />
                  <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth={2} />
                </svg>
              }
            />
          </div>

          <AnimatePresence>
            {overCapacity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert type="warning">
                  <p>Total quantity with new type would exceed event capacity ({event?.capacity}).</p>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={overCapacity}
              icon={
                <motion.span
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
                >
                  ✨
                </motion.span>
              }
            >
              Add Ticket Type
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Ticket Types */}
      <div className="card">
        <h4 className="title-lg mb-6 flex items-center gap-2">
          <span>🎫</span>
          Current Ticket Types
        </h4>

        {(!types || types.length === 0) ? (
          <FadeIn>
            <div className="text-center py-12">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                className="text-6xl mb-4"
              >
                🎪
              </motion.div>
              <h5 className="title-lg mb-2">No ticket types yet</h5>
              <p className="body-md text-gray-600">
                Create your first ticket type to start selling tickets
              </p>
            </div>
          </FadeIn>
        ) : (
          <StaggeredList className="space-y-4">
            {types.map((tt) => (
              <StaggeredItem key={tt.id}>
                <motion.div
                  layout
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.01 }}
                >
                  {editingId === tt.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Name"
                          value={editValues[tt.id]?.name || tt.name}
                          onChange={(e) => updateEditValue(tt.id, 'name', e.target.value)}
                          variant="minimal"
                        />
                        <Input
                          label="Price"
                          type="number"
                          min={0}
                          step={0.01}
                          value={String(editValues[tt.id]?.price ?? tt.price)}
                          onChange={(e) => updateEditValue(tt.id, 'price', Number(e.target.value))}
                          variant="minimal"
                        />
                        <Input
                          label="Quantity"
                          type="number"
                          min={1}
                          value={String(editValues[tt.id]?.quantity ?? tt.quantity)}
                          onChange={(e) => updateEditValue(tt.id, 'quantity', Number(e.target.value))}
                          variant="minimal"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => cancelEdit(tt.id)}>
                          Cancel
                        </Button>
                        <Button variant="success" onClick={() => saveEdit(tt)}>
                          <span className="mr-1">💾</span>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          className="text-2xl"
                        >
                          🎫
                        </motion.div>
                        <div>
                          <h5 className="font-semibold text-lg">{tt.name}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span>💰</span>
                              ${tt.price.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>📊</span>
                              {tt.quantity} available
                            </span>
                            <span className="flex items-center gap-1">
                              <span>✅</span>
                              {tt.issued || 0} issued
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <HoverScale>
                          <Button
                            variant="secondary"
                            onClick={() => startEdit(tt)}
                            size="sm"
                          >
                            <span className="mr-1">✏️</span>
                            Edit
                          </Button>
                        </HoverScale>
                        <HoverScale>
                          <Button
                            variant="danger"
                            onClick={() => onRemove(tt)}
                            size="sm"
                          >
                            <span className="mr-1">🗑️</span>
                            Remove
                          </Button>
                        </HoverScale>
                      </div>
                    </div>
                  )}
                </motion.div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        )}

        {/* Summary */}
        {types && types.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Total configured quantity: <strong>{totalQty}</strong>
              </span>
              <span className="text-gray-600">
                Event capacity: <strong>{event?.capacity?.toLocaleString() || "—"}</strong>
              </span>
              <motion.div
                animate={{ 
                  color: totalQty > (event?.capacity || Infinity) ? "#dc2626" : "#059669"
                }}
                className="font-medium"
              >
                {totalQty <= (event?.capacity || Infinity) ? "✅ Within capacity" : "⚠️ Over capacity"}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
