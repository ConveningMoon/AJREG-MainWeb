import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { EventDocumentTheme } from "@/components/events/EventDocumentTheme";
import { FeelGoodSocialForm } from "@/components/events/FeelGoodSocialForm";
import styles from "./FeelGoodSocial.module.css";

const CHANNEL_ID =
  process.env.NEXT_PUBLIC_ITMANO_FEEL_GOOD_SOCIAL_CHANNEL_ID ??
  "chn_xk4qyhwgff6e";

const SITE_URL = "https://ajrealestateva.com";

function GiftIllustration() {
  return (
    <svg
      viewBox="0 0 220 176"
      className={styles.gift}
      role="img"
      aria-labelledby="giveaway-gift-title"
    >
      <title id="giveaway-gift-title">A wrapped giveaway gift</title>
      <path
        className={styles.giftShadow}
        d="M34 151c12 15 137 17 157-1 13-12-16-22-77-22-59 0-91 11-80 23Z"
      />
      <path
        className={styles.giftLid}
        d="M31 70c0-8 6-14 14-14h132c8 0 14 6 14 14v22H31V70Z"
      />
      <path className={styles.giftBox} d="M43 92h136v58c0 8-6 14-14 14H57c-8 0-14-6-14-14V92Z" />
      <path className={styles.giftRibbon} d="M94 56h34v108H94z" />
      <path
        className={styles.giftBow}
        d="M111 56c-27-2-45-10-45-24 0-10 8-18 19-18 17 0 25 19 26 42Zm0 0c27-2 45-10 45-24 0-10-8-18-19-18-17 0-25 19-26 42Z"
      />
      <path className={styles.giftKnot} d="M95 49h32a8 8 0 0 1 8 8v5H87v-5a8 8 0 0 1 8-8Z" />
      <path className={styles.sparkleOne} d="m32 25 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" />
      <path className={styles.sparkleTwo} d="m185 24 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
      <circle className={styles.dotOne} cx="190" cy="120" r="5" />
      <circle className={styles.dotTwo} cx="22" cy="112" r="4" />
    </svg>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "feelGoodSocial" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: `${SITE_URL}/en/events/feel-good-social` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/en/events/feel-good-social`,
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

export default async function FeelGoodSocialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale: "en", namespace: "feelGoodSocial" });

  return (
    <>
      <EventDocumentTheme />
      <ItmanoBeacon channelPublicId={CHANNEL_ID} />
      <main className={styles.rafflePage}>
        <div className={styles.ambientShape} aria-hidden="true" />
        <section className={styles.raffleShell} aria-labelledby="raffle-title">
          <div className={styles.intro}>
            <GiftIllustration />
            <div>
              <h1 id="raffle-title" className={styles.title}>
                {t("hero.title")}
              </h1>
              <p className={styles.subtitle}>{t("hero.subtitle")}</p>
            </div>
          </div>

          <div className={styles.formPanel}>
            <FeelGoodSocialForm />
          </div>

          <p className={styles.host}>{t("hero.host")}</p>
        </section>
      </main>
    </>
  );
}
