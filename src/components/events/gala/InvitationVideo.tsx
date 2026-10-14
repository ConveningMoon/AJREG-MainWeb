import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { galaEvent } from "@/data/christmasGala";
import { InvitationPlayer } from "./InvitationPlayer";

export async function InvitationVideo() {
  const t = await getTranslations("christmasGala.hero");
  const video = galaEvent.invitationVideo;

  return (
    <figure className="gala-video">
      <div>
        {video ? (
          <InvitationPlayer src={video.src} poster={video.poster} />
        ) : (
          <div
            role="img"
            aria-label={t("screenAlt")}
            className="relative grid aspect-[9/16] place-items-center overflow-hidden rounded-sm bg-[radial-gradient(ellipse_at_center,#22354a,#0a1321_75%)]"
          >
            <Image
              src="/images/logo-white_2.webp"
              alt=""
              width={576}
              height={340}
              className="absolute w-3/5 opacity-[0.08]"
            />
            <span className="relative px-4 text-center">
              <span className="block font-display text-2xl font-semibold text-cream sm:text-3xl">
                {t("screenLabel")}
              </span>
              <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.2em] text-navy-200">
                {t("screenSoon")}
              </span>
            </span>
          </div>
        )}
      </div>
    </figure>
  );
}
