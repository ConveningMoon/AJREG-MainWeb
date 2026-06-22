"use server";

import {
  contactSchema,
  type ContactFormValues,
  type ContactLanguage,
} from "@/lib/contact-schema";
import { submitContact, type ItmanoResult } from "@/lib/itmano";

export type ContactActionResult = { status: ItmanoResult };

// Localized labels for the free-form answers we attach to the CRM lead, so the
// agent reads the question in the visitor's chosen language.
const intentQuestion: Record<ContactLanguage, string> = {
  es: "¿Qué te gustaría hacer?",
  en: "What would you like to do?",
  pt: "O que você gostaria de fazer?",
};
const messageQuestion: Record<ContactLanguage, string> = {
  es: "Mensaje",
  en: "Message",
  pt: "Mensagem",
};

export async function submitContactAction(
  values: ContactFormValues
): Promise<ContactActionResult> {
  // Re-validate on the server — never trust the client payload.
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return { status: "error" };
  const v = parsed.data;

  const form_answers: { question: string; answer: string }[] = [
    { question: intentQuestion[v.language], answer: v.intent },
  ];
  if (v.message && v.message.length > 0) {
    form_answers.push({ question: messageQuestion[v.language], answer: v.message });
  }

  const status = await submitContact({
    first_name: v.firstName,
    last_name: v.lastName,
    email: v.email,
    phone: v.phone || undefined,
    language: v.language,
    intent: v.intent,
    form_answers,
  });

  return { status };
}
