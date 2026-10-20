import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Clock3, MapPin, Sparkles, Users, Shirt } from "lucide-react";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { HolidaySprig } from "@/components/events/gala/HolidaySprig";
import { RsvpForm } from "@/components/events/gala/RsvpForm";
import { RsvpEnvelope } from "@/components/events/gala/RsvpEnvelope";
import { RsvpInvitation } from "@/components/events/gala/RsvpInvitation";
import { galaEvent } from "@/data/christmasGala";
import { GALA_RSVP_CHANNEL } from "@/lib/gala-rsvp";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import "@/components/events/gala/rsvp.css";

const SITE = "https://ajrealestateva.com";
const PATH = "/events/christmas-gala";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galaRsvp" });
  const shareImage = `${SITE}/images/events/christmas-gala-rsvp-og-${locale === "es" ? "es" : "en"}.jpg?v=20261020`;
  return {
    title: t("meta.title"), description: t("meta.description"),
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE}/${locale}${PATH}`, languages: { en: `${SITE}/en${PATH}`, es: `${SITE}/es${PATH}` } },
    openGraph: { title: t("meta.title"), description: t("meta.description"), url: `${SITE}/${locale}${PATH}`, type: "website", locale: locale === "es" ? "es_US" : "en_US", images: [{ url: shareImage, width: 1200, height: 630, type: "image/jpeg", alt: t("meta.imageAlt") }] },
    twitter: { card: "summary_large_image", title: t("meta.title"), description: t("meta.description"), images: [shareImage] },
  };
}

export default async function ChristmasGalaRsvp({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("galaRsvp");
  const date = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(new Date(galaEvent.startsAt));
  const eventDate = new Date(galaEvent.startsAt);
  const monthYear = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "America/New_York" }).format(eventDate);
  const day = new Intl.DateTimeFormat(locale, { day: "2-digit", timeZone: "America/New_York" }).format(eventDate);
  return (
    <main className="gala-rsvp">
      <ItmanoBeacon channelPublicId={GALA_RSVP_CHANNEL} />
      <RsvpEnvelope>
      <div className="gala-rsvp-layout">
        <section className="gala-rsvp-invitation" aria-labelledby="invitation-title">
          <LocaleSwitcher className="gala-rsvp-language" />
          <RsvpInvitation>
            <HolidaySprig className="gala-rsvp-sprig gala-rsvp-sprig-left" />
            <HolidaySprig className="gala-rsvp-sprig gala-rsvp-sprig-right" />
            <div className="gala-rsvp-invitation-content">
              <Link href="/" className="gala-rsvp-home" aria-label={t("home")}><Image src="/images/logo-white_2.webp" width={160} height={48} alt="A&J Real Estate Group" className="gala-rsvp-logo" /></Link>
              <p className="gala-rsvp-eyebrow">{t("eyebrow")}</p>
              <Sparkles className="gala-rsvp-star" strokeWidth={1} aria-hidden="true" />
              <h1 id="invitation-title" tabIndex={-1}>{t("title")}<em>{t("titleAccent")}</em></h1>
              <p className="gala-rsvp-lead">{t("lead")}</p>
              <div className="gala-rsvp-rule" aria-hidden="true" />
            </div>
          </RsvpInvitation>
        </section>
        <section className="gala-rsvp-event-panel" aria-label={t("venueLabel")}>
              <div className="gala-rsvp-ticket">
                <dl className="gala-rsvp-facts">
                  <div className="gala-rsvp-ticket-date"><dt><CalendarDays size={16} aria-hidden="true" />{t("dateLabel")}</dt><dd><time dateTime={galaEvent.startsAt} aria-label={date}><strong>{day}</strong><span>{monthYear}</span></time></dd></div>
                  <div className="gala-rsvp-ticket-time"><dt><Clock3 size={16} aria-hidden="true" />{t("timeLabel")}</dt><dd><strong>{t("timeShort")}</strong><span>{t("timeZone")}</span></dd></div>
                  <div className="gala-rsvp-ticket-venue"><dt><MapPin size={16} aria-hidden="true" />{t("venueLabel")}</dt><dd><a className="gala-rsvp-venue-link" href={galaEvent.venueMapUrl} target="_blank" rel="noopener noreferrer">{galaEvent.venueName}</a><span className="gala-rsvp-address">{galaEvent.venueStreet}<br />{galaEvent.venueCity}</span></dd></div>
                </dl>
                <div className="gala-rsvp-details"><span><Users size={15} aria-hidden="true" />{t("adults")}</span><span><Shirt size={15} aria-hidden="true" />{t("dressCode")}</span></div>
              </div>
          <p className="gala-rsvp-signature">{t("signature")}</p>
        </section>
        <section id="rsvp" className="gala-rsvp-form-panel" aria-label={t("form.title")}><RsvpForm /></section>
      </div>
      </RsvpEnvelope>
    </main>
  );
}
