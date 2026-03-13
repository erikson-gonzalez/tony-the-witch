import { memo } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getNavCardType } from "@/utils/nav-card-i18n";
import { OptimizedImage } from "@/components/optimized-image";
import type { NavCardItem } from "@/types/content";

interface NavCardProps {
  card: NavCardItem;
  index?: number;
  /** When true, renders as non-clickable preview (e.g. in admin) */
  preview?: boolean;
}

const linkClass =
  "group block relative aspect-[3/4] overflow-hidden bg-neutral-900 cursor-pointer";

const I18N_KEYS: Record<string, { title: string; subtitle: string }> = {
  portfolio: { title: "navCards.portfolioTitle", subtitle: "navCards.portfolioSubtitle" },
  shop: { title: "navCards.shopTitle", subtitle: "navCards.shopSubtitle" },
  contact: { title: "navCards.contactTitle", subtitle: "navCards.contactSubtitle" },
  instagram: { title: "navCards.instagramTitle", subtitle: "navCards.instagramSubtitle" },
};

export const NavCardComponent = memo(function NavCardComponent({
  card,
  preview = false,
}: NavCardProps) {
  const { t } = useTranslation();
  const type = getNavCardType(card.href);
  const keys = type ? I18N_KEYS[type] : null;
  const displayTitle = keys ? t(keys.title) : card.title;
  const displaySubtitle = keys ? t(keys.subtitle) : card.subtitle;

  const content = (
    <>
      <OptimizedImage
        src={card.image}
        alt={displayTitle}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 block mb-1">
          {displaySubtitle}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base uppercase tracking-widest text-white font-medium">
            {displayTitle}
          </span>
          {card.external ? (
            <ArrowUpRight
              size={14}
              className="text-white/70 group-hover:text-white transition-colors"
            />
          ) : (
            <ArrowRight
              size={14}
              className="text-white/70 group-hover:translate-x-1 group-hover:text-white transition-all"
            />
          )}
        </div>
      </div>
    </>
  );

  const testId = preview
    ? `preview-nav-card-${card.id}`
    : `link-nav-card-${displayTitle.toLowerCase().replace(/\s/g, "-")}`;

  if (preview) {
    return (
      <div data-testid={testId} className={linkClass}>
        {content}
      </div>
    );
  }

  if (card.external) {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testId}
        className={linkClass}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={card.href} data-testid={testId} className={linkClass}>
      {content}
    </Link>
  );
});
