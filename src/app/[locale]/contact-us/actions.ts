"use server";

import {
  contactSchema,
  type ContactFormValues,
  type ContactLanguage,
} from "@/lib/contact-schema";
import {
  submitContact,
  type ItmanoResult,
  type FormAnswer,
} from "@/lib/itmano";

export type ContactActionResult = { status: ItmanoResult };

const intentLabels: Record<
  ContactLanguage,
  { question: string; labels: Record<string, string> }
> = {
  es: {
    question: "¿Qué te gustaría hacer?",
    labels: { compra: "Quiero comprar", vende: "Quiero vender", invierte: "Quiero invertir" },
  },
  en: {
    question: "What would you like to do?",
    labels: { compra: "I want to buy", vende: "I want to sell", invierte: "I want to invest" },
  },
  pt: {
    question: "O que você gostaria de fazer?",
    labels: { compra: "Quero comprar", vende: "Quero vender", invierte: "Quero investir" },
  },
};

const messageLabel: Record<ContactLanguage, string> = {
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

  const { question, labels } = intentLabels[v.language];
  const form_answers: FormAnswer[] = [
    {
      key: "intent",
      question,
      value: v.intent,
      label: labels[v.intent] ?? v.intent,
    },
  ];

  if (v.message && v.message.length > 0) {
    form_answers.push({
      key: "message",
      question: messageLabel[v.language],
      value: v.message,
      label: v.message,
    });
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
