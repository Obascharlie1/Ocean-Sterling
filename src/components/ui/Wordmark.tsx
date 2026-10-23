import Link from "next/link";

/**
 * Ocean Sterling logo. Swaps to the white-text variant in dark mode (or always,
 * with `onDark`). Size it with a height class via `className` (e.g. "h-8").
 */
export function Wordmark({
  href = "/",
  iconOnly = false,
  onDark = false,
  className = "h-8",
}: {
  href?: string | null;
  iconOnly?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  /* eslint-disable @next/next/no-img-element */
  const content = iconOnly ? (
    <img src="/brand/mark.png" alt="Ocean Sterling" className={`${className} w-auto`} />
  ) : onDark ? (
    <img src="/brand/logo-dark.png" alt="Ocean Sterling" className={`${className} w-auto`} />
  ) : (
    <>
      <img src="/brand/logo.png" alt="Ocean Sterling" className={`${className} w-auto dark:hidden`} />
      <img src="/brand/logo-dark.png" alt="Ocean Sterling" className={`${className} w-auto hidden dark:block`} />
    </>
  );
  /* eslint-enable @next/next/no-img-element */

  if (href === null) return <span className="inline-flex items-center">{content}</span>;
  return (
    <Link href={href} aria-label="Ocean Sterling — home" className="inline-flex items-center">
      {content}
    </Link>
  );
}
