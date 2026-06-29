"use client";

import Image from "next/image";
import { ArrowRight, Gift } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { AgentResource } from "@/data/resources";

type Props = {
  resource: AgentResource;
  titleText: string;
  descriptionText: string;
  ctaText: string;
};

export function AgentResourceSection({
  resource,
  titleText,
  descriptionText,
  ctaText,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid items-center gap-10 sm:grid-cols-[1fr_auto]"
    >
      {/* Content */}
      <div className="flex flex-col">
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/15">
          <Gift className="h-5 w-5 text-gold" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-navy-900 sm:text-3xl">
          {titleText}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-taupe">
          {descriptionText}
        </p>
        <div className="mt-6">
          <Link
            href={`/resources/${resource.slug}`}
            className="group inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {ctaText}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      {/* Free-floating mockup — no container box, slight rotation */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -6 }}
        whileInView={{ opacity: 1, y: 0, rotate: 3 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
        className="hidden sm:block"
      >
        <Image
          src="/images/mockup/guide-cover.webp"
          alt="Free Guide"
          width={130}
          height={182}
          className="drop-shadow-2xl"
        />
      </motion.div>
    </motion.div>
  );
}
