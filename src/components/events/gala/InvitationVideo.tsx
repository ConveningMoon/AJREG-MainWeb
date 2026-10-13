import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { galaEvent } from "@/data/christmasGala";

export async function InvitationVideo() {
  const t = await getTranslations("christmasGala.hero");
  const video = galaEvent.invitationVideo;

  return (
    <figure className="gala-video">
      <div>
        {video ? (
          <video
            // `#t=0.001` makes iOS Safari paint the first frame as a poster
            // when none is provided, instead of a black box.
            src={video.poster ? video.src : `${video.src}#t=0.001`}
            poster={video.poster}
            aria-label={t("screenLabel")}
            controls
            playsInline
            // With a poster nothing is downloaded until play: the clip is large and
            // every visit would otherwise pull seconds of it from Blob.
            preload={video.poster ? "none" : "metadata"}
            controlsList="nodownload"
            // `contain`, not `cover`: a clip that is slightly off 9:16 gets
            // bars instead of a cropped sponsor logo.
            className="aspect-[9/16] w-full rounded-sm bg-black object-contain"
          />
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
