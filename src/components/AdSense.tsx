/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useEffect, useRef } from "react";

interface AdSenseProps {
  client: string; // e.g. "ca-pub-1234567890123456"
  slot: string;   // e.g. "1234567890"
  format?: string;
  responsive?: string;
  className?: string;
}

export function AdSense({
  client,
  slot,
  format = "auto",
  responsive = "true",
  className = "",
}: AdSenseProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!insRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Check if element is visible and has a width
        if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
          try {
            // @ts-expect-error
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (err) {
            console.error("AdSense error", err);
          }
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );

    observer.observe(insRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden={true}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
