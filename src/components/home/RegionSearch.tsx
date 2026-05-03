"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import type { Region } from "@/lib/types";
import { regionPath } from "@/lib/utils";

interface Props {
  regions: Region[];
}

export function RegionSearch({ regions }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Region[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fuse = useRef(
    new Fuse(regions, {
      keys: ["sigungu", "sido"],
      threshold: 0.35,
      includeScore: true,
    }),
  );

  useEffect(() => {
    if (query.trim().length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    const hits = fuse.current
      .search(query)
      .slice(0, 8)
      .map((r) => r.item);
    setResults(hits);
  }, [query]);

  function handleSelect(region: Region) {
    router.push(regionPath(region.sido, region.sigungu));
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2.5 rounded-2xl border"
        style={{
          borderColor: open ? "var(--color-accent)" : "var(--color-border)",
          backgroundColor: "var(--color-bg)",
          boxShadow: open ? "0 0 0 3px var(--color-accent-light)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          height: 56,
          padding: "0 18px",
        }}
      >
        <Search
          size={18}
          style={{ color: "var(--color-text-secondary)", flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="시군구 검색 (예: 강남구, 분당구)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--color-text-secondary)]"
          style={{ color: "var(--color-text-primary)" }}
        />
        {query && (
          <button onClick={handleClear} aria-label="지우기">
            <X size={16} style={{ color: "var(--color-text-secondary)" }} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border shadow-lg"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
          }}
        >
          {results.map((region) => (
            <li key={region.code}>
              <button
                className="flex w-full items-center gap-2 border-b px-4 text-left text-sm transition-colors last:border-b-0 hover:bg-surface"
                style={{ height: 48, borderColor: "#F3F4F6" }}
                onMouseDown={() => handleSelect(region)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {region.sigungu}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {region.sido}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
