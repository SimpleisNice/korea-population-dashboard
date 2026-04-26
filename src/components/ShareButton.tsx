"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  className?: string;
  label?: string;
  iconSize?: number;
}

export function ShareButton({
  className = "",
  label = "링크 복사",
  iconSize = 16,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="현재 필터 URL 복사"
      className={`flex items-center gap-2 transition-all duration-200 ${className}`}
    >
      {copied ? (
        <Check size={iconSize} className="text-tertiary-container" />
      ) : (
        <Copy size={iconSize} className="text-on-surface-variant" />
      )}
      <span className="font-label-sm text-[12px]">
        {copied ? "복사됨!" : label}
      </span>
    </button>
  );
}
