import Image from "next/image";
import Link from "next/link";

export interface MediSyncBrandProps {
  /**
   * The size variant of the branding.
   * - default: Standard size for sidebars and main navigation.
   * - compact: Smaller size for mobile headers or tight spaces.
   */
  size?: "default" | "compact";
  /**
   * Additional class names for the wrapper element.
   */
  className?: string;
  /**
   * Optional custom href for the logo link.
   * If not provided, it defaults to "/" for public or handles role-based routing dynamically if used inside AppShell.
   */
  href?: string;
  /**
   * If true, only renders the icon.
   */
  iconOnly?: boolean;
}

export function MediSyncBrand({
  size = "default",
  className,
  href = "/",
  iconOnly = false,
}: MediSyncBrandProps) {
  const markSize = size === "compact" ? 32 : 40;
  const wordmarkHeight = size === "compact" ? 26 : 34;
  const wordmarkWidth = size === "compact" ? 78 : 102;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md transition-opacity hover:opacity-90 ${className || ""}`}
      aria-label="MediSync home"
    >
      <Image
        src="/brand/medisync-mark-v2.png"
        alt=""
        width={markSize}
        height={markSize}
        className="object-contain shrink-0"
        priority
      />
      {!iconOnly && (
        <Image
          src="/brand/medisync-wordmark-v2.png"
          alt="MediSync"
          width={wordmarkWidth}
          height={wordmarkHeight}
          className="object-contain shrink-0"
          priority
        />
      )}
    </Link>
  );
}
