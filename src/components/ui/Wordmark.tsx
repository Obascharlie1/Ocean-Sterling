import Link from "next/link";
import { Waves } from "lucide-react";

/**
 * Ocean Sterling wordmark. Text-based so it tracks the brand color + font
 * automatically. Size scales with the font-size set via `className`
 * (icon chip and glyph are in em units).
 */
export function Wordmark({
  href = "/",
  iconOnly = false,
  onDark = false,
  className = "",
}: {
  href?: string | null;
  iconOnly?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  const content = (
    <span className={`inline-flex items-center gap-2 font-bold leading-none tracking-tight ${className}`}>
      <span
        className="grid shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-secondary to-brand-primary text-white shadow-sm shadow-brand-primary/30"
        style={{ width: "1.7em", height: "1.7em" }}
        aria-hidden
      >
        <Waves style={{ width: "1.05em", height: "1.05em" }} strokeWidth={2.4} />
      </span>
      {!iconOnly && (
        <span className={`whitespace-nowrap ${onDark ? "text-white" : "text-dark-base dark:text-white"}`}>
          Ocean <span className="text-brand-primary">Sterling</span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="Ocean Sterling — home" className="inline-flex items-center">
      {content}
    </Link>
  );
}
