"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { EventInput, createEvent, updateEvent, Event as EventType } from "@/lib/apiClient";
import { focusAuto } from "@/lib/browserUtils";
import { FadeIn, StaggeredList, StaggeredItem } from "../ui/MotionProvider";

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
  const [currentStep, setCurrentStep] = React.useState(0);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => focusAuto(), []);

  const steps = [
    {
      title: "Event Details",
      description: "Basic information about your event",
      icon: "📝",
      fields: ["title", "venue"]
    },
    {
      title: "Date & Time", 
      description: "When your event will take place",
      icon: "📅",
      fields: ["startsAt", "endsAt", "timezone"]
    },
    {
      title: "Capacity",
      description: "Maximum number of attendees",
      icon: "👥", 
      fields: ["capacity"]
    }
  ];

  function set<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setData((d) => ({ ...d, [key]: value }));
    // Clear validation error when field is updated
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }

  function validateStep(stepIndex: number): boolean {
    const step = steps[stepIndex];
    const errors: Record<string, string> = {};

    step.fields.forEach(field => {
      const value = data[field as keyof EventInput];
      
      switch (field) {
        case "title":
          if (!value || (typeof value === "string" && value.trim() === "")) {
            errors.title = "Event title is required";
          }
          break;
        case "venue":
          if (!value || (typeof value === "string" && value.trim() === "")) {
            errors.venue = "Venue is required";
          }
          break;
        case "startsAt":
          if (!value) {
            errors.startsAt = "Start time is required";
          }
          break;
        case "endsAt":
          if (!value) {
            errors.endsAt = "End time is required";
          } else if (data.startsAt && new Date(value) <= new Date(data.startsAt)) {
            errors.endsAt = "End time must be after start time";
          }
          break;
        case "timezone":
          if (!value || (typeof value === "string" && value.trim() === "")) {
            errors.timezone = "Timezone is required";
          }
          break;
        case "capacity":
          if (!value || value <= 0) {
            errors.capacity = "Capacity must be a positive number";
          }
          break;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  }

  function prevStep() {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // Validate all steps
    let hasErrors = false;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErr("Please fix all validation errors before submitting.");
      return;
    }

    setSaving(true);
    
    const res = props.mode === "create"
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

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-2xl mx-auto"
    >
      <div className="card">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="title-xl mb-2">
              {props.mode === "create" ? "Create New Event" : "Edit Event"}
            </h1>
            <p className="body-md">
              {props.mode === "create" 
                ? "Let's set up your event step by step" 
                : "Update your event details"
              }
            </p>
          </div>
        </FadeIn>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-2 ${
                  index <= currentStep ? "text-blue-600" : "text-gray-400"
                }`}
                animate={{ 
                  scale: index === currentStep ? 1.05 : 1,
                  color: index <= currentStep ? "rgb(37, 99, 235)" : "rgb(156, 163, 175)"
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {index < currentStep ? "✓" : index + 1}
                </motion.div>
                <span className="hidden sm:block text-sm font-medium">
                  {step.title}
                </span>
              </motion.div>
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Alert type="error" title="Validation Error">
                <p>{err}</p>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <form onSubmit={onSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Step Header */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="text-4xl mb-2"
                >
                  {steps[currentStep].icon}
                </motion.div>
                <h2 className="title-lg mb-1">{steps[currentStep].title}</h2>
                <p className="body-sm text-gray-600">{steps[currentStep].description}</p>
              </div>

              {/* Step Content */}
              <StaggeredList className="space-y-4">
                {currentStep === 0 && (
                  <>
                    <StaggeredItem>
                      <Input
                        label="Event Title"
                        required
                        value={data.title}
                        onChange={(e) => set("title", e.target.value)}
                        error={validationErrors.title}
                        placeholder="Enter your event name"
                        leftIcon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth={2} />
                            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth={2} />
                            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth={2} />
                          </svg>
                        }
                        data-autofocus
                      />
                    </StaggeredItem>
                    <StaggeredItem>
                      <Input
                        label="Venue"
                        required
                        value={data.venue}
                        onChange={(e) => set("venue", e.target.value)}
                        error={validationErrors.venue}
                        placeholder="Where will the event take place?"
                        leftIcon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth={2} />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth={2} />
                          </svg>
                        }
                      />
                    </StaggeredItem>
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <StaggeredItem>
                      <Input
                        label="Start Time"
                        type="datetime-local"
                        required
                        value={data.startsAt}
                        onChange={(e) => set("startsAt", e.target.value)}
                        error={validationErrors.startsAt}
                        leftIcon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth={2} />
                          </svg>
                        }
                      />
                    </StaggeredItem>
                    <StaggeredItem>
                      <Input
                        label="End Time"
                        type="datetime-local"
                        required
                        value={data.endsAt}
                        onChange={(e) => set("endsAt", e.target.value)}
                        error={validationErrors.endsAt}
                        leftIcon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth={2} />
                          </svg>
                        }
                      />
                    </StaggeredItem>
                    <StaggeredItem>
                      <Input
                        label="Timezone"
                        required
                        value={data.timezone}
                        onChange={(e) => set("timezone", e.target.value)}
                        error={validationErrors.timezone}
                        hint="IANA timezone like America/New_York"
                        leftIcon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
                            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth={2} />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth={2} />
                          </svg>
                        }
                      />
                    </StaggeredItem>
                  </>
                )}

                {currentStep === 2 && (
                  <StaggeredItem>
                    <Input
                      label="Capacity"
                      type="number"
                      min={1}
                      required
                      value={Number(data.capacity).toString()}
                      onChange={(e) => set("capacity", Number(e.target.value))}
                      error={validationErrors.capacity}
                      placeholder="Maximum number of attendees"
                      leftIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth={2} />
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={2} />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth={2} />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth={2} />
                        </svg>
                      }
                    />
                  </StaggeredItem>
                )}
              </StaggeredList>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
            >
              <span className="mr-2">←</span>
              Previous
            </Button>

            <div className="flex gap-3">
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                >
                  Next
                  <span className="ml-2">→</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="success"
                  disabled={saving}
                  loading={saving}
                  icon={
                    <motion.span
                      animate={{ rotate: saving ? 360 : 0 }}
                      transition={{ duration: 1, repeat: saving ? Infinity : 0 }}
                    >
                      {saving ? "⏳" : "✨"}
                    </motion.span>
                  }
                >
                  {props.mode === "create" ? "Create Event" : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
