import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      alt="GenPHD"
      className={className}
      height={48}
      priority={priority}
      src="/brand/genphd-logo.png"
      style={{ display: "block", height: "auto", objectFit: "contain", width: "var(--brand-logo-width, 128px)" }}
      width={256}
    />
  );
}
