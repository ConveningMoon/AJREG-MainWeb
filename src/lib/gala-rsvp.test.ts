import assert from "node:assert/strict";
import test from "node:test";
import { buildGalaRsvpPayload, galaRsvpSchema, type GalaRsvpValues } from "./gala-rsvp.ts";

const base: GalaRsvpValues = { firstName: " María ", lastName: "", email: "maria@example.com", phone: "", extraGuests: "0", website: "" };
const t = (key: string) => key;

test("RSVP preserves the channel contract and counts the primary guest", () => {
  for (const extraGuests of ["0", "1"] as const) {
    const payload = buildGalaRsvpPayload({ ...base, extraGuests }, "es", "https://example.com/es/events/christmas-gala", t);
    assert.equal(payload.first_name, "María");
    assert.equal(payload.website, "");
    assert.equal(payload.language, "es");
    assert.equal(payload.last_name, undefined);
    assert.equal(payload.form_answers[0].value, extraGuests);
    assert.equal(payload.form_answers[1].value, String(Number(extraGuests) + 1));
    assert.equal("intent" in payload, false);
    assert.equal("consent_text" in payload, false);
  }
});

test("rejects more than one companion, missing names and invalid emails", () => {
  for (const extraGuests of ["2", "-1", "1.5", "", "100"]) {
    assert.equal(galaRsvpSchema.safeParse({ ...base, extraGuests }).success, false);
  }
  assert.equal(galaRsvpSchema.safeParse({ ...base, firstName: " " }).success, false);
  assert.equal(galaRsvpSchema.safeParse({ ...base, email: "invalid" }).success, false);
});

test("honeypot blocks payload creation; localized labels and language are preserved", () => {
  assert.throws(() => buildGalaRsvpPayload({ ...base, website: "spam" }, "en", "https://example.com", t));
  const payload = buildGalaRsvpPayload(base, "en", "https://example.com", (key) => `EN ${key}`);
  assert.equal(payload.language, "en");
  assert.equal(payload.form_answers[0].label, "EN form.guests.0");
});
