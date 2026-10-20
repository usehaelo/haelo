import Image from "next/image";

interface LogoProps {
  variant?: "lime-on-white" | "white-on-navy" | "navy-on-white" | "mono";
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
}
const widths = { sm: 90, md: 114, lg: 138, xl: 174 };
const symbols = { sm: 24, md: 32, lg: 40, xl: 56 };
export default function Logo({
  variant = "navy-on-white",
  size = "md",
  showWordmark = true,
  className = "",
}: LogoProps) {
  const width = showWordmark ? widths[size] : symbols[size];
  return (
    <Image
      src={
        showWordmark
          ? variant === "white-on-navy"
            ? "/images/logo/logowhite.png"
            : "/images/logo/logo.png"
          : "/images/logo/halo-icon.png"
      }
      alt="HAELO"
      width={showWordmark ? 2172 : 128}
      height={showWordmark ? 724 : 128}
      sizes={`${width}px`}
      className={className}
      style={{ width, height: "auto", display: "inline-block", flexShrink: 0 }}
    />
  );
}
