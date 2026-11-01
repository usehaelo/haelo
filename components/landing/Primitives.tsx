import Link from "next/link";
import Image, { getImageProps } from "next/image";
import type { ReactNode } from "react";
import { assets } from "./assets";

export const CONTACT_URL = "https://wa.me/2347048048164";

type VectorAsset = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
};

/** Keep the exported SVG's intrinsic geometry; scale its wrapper to the design slot. */
export function Vector({
  asset,
  width = asset.width,
  className = "",
  label,
}: {
  asset: VectorAsset;
  width?: number;
  className?: string;
  label?: string;
}) {
  const scale = width / asset.width;
  return (
    <span
      className={`figma-vector ${className}`}
      style={{ width, height: asset.height * scale }}
    >
      {/* SVGs retain their original root dimensions, including filter/overflow bounds. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset.src}
        alt={label || ""}
        width={asset.width}
        height={asset.height}
        style={{ transform: `scale(${scale})` }}
      />
    </span>
  );
}

export function Photo({
  src,
  alt = "",
  priority = false,
  fixed = false,
  sizes = "(max-width: 767px) 100vw, 50vw",
  className = "",
}: {
  src: string;
  alt?: string;
  priority?: boolean;
  fixed?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (fixed) {
    const { props } = getImageProps({
      src,
      alt,
      width: 1920,
      height: 1280,
      sizes: "100vw",
      quality: 85,
    });
    const source =
      props.srcSet
        ?.split(", ")
        .find((candidate) => candidate.endsWith("1920w"))
        ?.split(" ")[0] || props.src;
    return (
      <span
        className={`landing-photo fixed-photo ${className}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={!alt || undefined}
        style={{ backgroundImage: `url("${source}")` }}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`landing-photo ${className}`}
    />
  );
}

export function Button({
  children,
  href = "/auth/signup",
  variant = "primary",
  arrow = false,
  small = false,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "inverse" | "glass";
  arrow?: boolean;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`landing-button landing-button-${variant}${small ? " landing-button-small" : ""}`}
    >
      {children}
      {arrow && (
        <Vector
          asset={
            variant === "primary"
              ? small
                ? assets.hero.trailingIcon
                : assets.hero.trailingIcon1
              : assets.cta.trailingIcon
          }
          width={small ? 18 : 20}
        />
      )}
    </Link>
  );
}

export function Heading({
  eyebrow,
  children,
  description,
  align = "center",
  id,
}: {
  eyebrow: string;
  children: ReactNode;
  description?: string;
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <div className={`landing-heading landing-heading-${align}`}>
      <span className="landing-eyebrow">{eyebrow}</span>
      <h2 id={id}>{children}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function ProofChip({
  icon,
  title,
  description,
  className = "",
}: {
  icon: VectorAsset;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`proof-chip ${className}`}>
      <span className="proof-chip-icon">
        <Vector asset={icon} />
      </span>
      <div>
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </div>
    </div>
  );
}

export function Cursor({
  name = "Stephen",
  className = "",
  timer = false,
}: {
  name?: string;
  className?: string;
  timer?: boolean;
}) {
  return (
    <span className={`demo-cursor ${className}`} aria-hidden="true">
      <Vector asset={timer ? assets.timer.arrow : assets.features.arrow} />
      <span>{name}</span>
    </span>
  );
}
