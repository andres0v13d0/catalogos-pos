"use client";
import { useState } from "react";
import Image from "next/image";

// Los banners nuevos guardan una variante {id}-mobile.webp (800px) junto al original.
// Los antiguos no la tienen: si da error, se vuelve al original.
const BANNER = /(\/(?:catalog|bodega)-banners\/[0-9a-f-]{36})\.webp$/i;

export default function MobileBanner({ src }: { src: string }) {
  const mobile = BANNER.test(src) ? src.replace(BANNER, "$1-mobile.webp") : src;
  const [current, setCurrent] = useState(mobile);
  return (
    <Image
      src={current}
      alt="Banner"
      width={800}
      height={300}
      className="w-full h-auto block"
      sizes="100vw"
      quality={85}
      priority
      onError={() => current !== src && setCurrent(src)}
    />
  );
}
