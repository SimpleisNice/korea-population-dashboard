"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error", err);
    }
  }, []);

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden={true}>
      <ins
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
