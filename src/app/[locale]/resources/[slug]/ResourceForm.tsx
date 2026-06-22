"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2 } from "lucide-react";
import type { AgentResource } from "@/data/resources";

type Labels = {
  steps: { info: string; questions: string; confirm: string };
  fields: { firstName: string; lastName: string; email: string; phone: string; optional: string };
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  errorTitle: string;
  errorBody: string;
  questionLabels: Record<string, string>;
  optionLabels: Record<string, Record<string, string>>;
};

const step1Schema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  phone:     z.string().optional(),
});
type Step1Data = z.infer<typeof step1Schema>;

export function ResourceForm({
  resource,
  labels,
  locale,
}: {
  resource: AgentResource;
  labels: Labels;
  locale: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  /* ── Step 1 form ─────────────────────────────────────────────────────── */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  /* ── Step 2 handlers ─────────────────────────────────────────────────── */
  const setAnswer = (key: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const allAnswered = resource.questions.every((q) => answers[q.key]);

  const onStep2 = () => {
    if (allAnswered) setStep(3);
  };

  /* ── Step 3 submit ───────────────────────────────────────────────────── */
  const onSubmit = async () => {
    if (!step1Data) return;
    setStatus("loading");
    try {
      const form_answers = resource.questions.map((q) => ({
        key:      q.key,
        question: labels.questionLabels[q.key] ?? q.key,
        value:    answers[q.key] ?? "",
        label:    labels.optionLabels[q.key]?.[answers[q.key] ?? ""] ?? answers[q.key] ?? "",
      }));

      const res = await fetch("/api/resources/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentSlug: resource.agentSlug,
          locale,
          ...step1Data,
          form_answers,
        }),
      });

      if (!res.ok && res.status !== 409) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const steps = [labels.steps.info, labels.steps.questions, labels.steps.confirm];

  /* ── Stepper indicator ───────────────────────────────────────────────── */
  const Stepper = () => (
    <ol className="mb-8 flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1;
        const active    = n === step;
        const completed = n < step;
        return (
          <li key={label} className="flex items-center gap-0">
            <span className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  completed ? "bg-gold text-navy-950" :
                  active    ? "bg-navy-900 text-cream ring-2 ring-gold" :
                              "bg-navy-100 text-navy-400"
                }`}
              >
                {completed ? "✓" : n}
              </span>
              <span className={`hidden sm:inline text-sm font-medium ${active ? "text-navy" : "text-navy-400"}`}>
                {label}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span className="mx-3 h-px w-8 bg-navy-200 sm:w-12" />
            )}
          </li>
        );
      })}
    </ol>
  );

  /* ── Success ─────────────────────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <CheckCircle className="h-16 w-16 text-gold" />
        <h2 className="font-display text-3xl font-semibold text-navy">{labels.successTitle}</h2>
        <p className="max-w-md text-navy-600">{labels.successBody}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy placeholder:text-navy-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <div>
      <Stepper />

      {/* Step 1: Personal info */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onStep1)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">
                {labels.fields.firstName} <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName")}
                placeholder={labels.fields.firstName}
                className={inputClass}
              />
              {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">
                {labels.fields.lastName} <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName")}
                placeholder={labels.fields.lastName}
                className={inputClass}
              />
              {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              {labels.fields.email} <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className={inputClass}
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              {labels.fields.phone}{" "}
              <span className="text-navy-400 text-xs">({labels.fields.optional})</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="(555) 000-0000"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gold py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85"
          >
            {labels.steps.questions} →
          </button>
        </form>
      )}

      {/* Step 2: Qualifying questions */}
      {step === 2 && (
        <div className="space-y-6">
          {resource.questions.map((q) => (
            <fieldset key={q.key}>
              <legend className="mb-3 text-sm font-semibold text-navy">
                {labels.questionLabels[q.key]}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(q.options ?? []).map((opt) => {
                  const isSelected = answers[q.key] === opt;
                  return (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                        isSelected
                          ? "border-gold bg-gold/10 font-semibold text-navy"
                          : "border-navy-200 bg-white text-navy-600 hover:border-gold/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.key}
                        value={opt}
                        checked={isSelected}
                        onChange={() => setAnswer(q.key, opt)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? "border-gold bg-gold" : "border-navy-300"
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-navy-950" />}
                      </span>
                      {labels.optionLabels[q.key]?.[opt] ?? opt}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition-colors hover:border-navy-400"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onStep2}
              disabled={!allAnswered}
              className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 disabled:opacity-40"
            >
              {labels.steps.confirm} →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-blush/40 p-5 text-sm text-navy-700 space-y-1">
            <p><strong>{labels.fields.firstName}:</strong> {step1Data?.firstName} {step1Data?.lastName}</p>
            <p><strong>{labels.fields.email}:</strong> {step1Data?.email}</p>
            {step1Data?.phone && <p><strong>{labels.fields.phone}:</strong> {step1Data.phone}</p>}
          </div>

          {status === "error" && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              <strong>{labels.errorTitle}</strong> — {labels.errorBody}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition-colors hover:border-navy-400"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={status === "loading"}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 disabled:opacity-60"
            >
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {status === "loading" ? labels.submitting : labels.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
