"use client";

import { useQueryState } from "nuqs";

interface BreadcrumbProps {
  region: string;
  subregion: string | null;
}

export function Breadcrumb({ region, subregion }: BreadcrumbProps) {
  const [, setRegion] = useQueryState("region", { defaultValue: "전국" });
  const [, setSubregion] = useQueryState("subregion");

  if (region === "전국") {
    return <span>전국 인구 현황</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => { setRegion("전국"); setSubregion(null); }} 
        className="hover:text-primary-container transition-colors cursor-pointer"
      >
        전국
      </button>
      <span className="text-on-surface-variant text-sm">&gt;</span>
      {subregion ? (
        <>
          <button 
            onClick={() => { setSubregion(null); }} 
            className="hover:text-primary-container transition-colors cursor-pointer"
          >
            {region}
          </button>
          <span className="text-on-surface-variant text-sm">&gt;</span>
          <span>{subregion}</span>
        </>
      ) : (
        <span>{region}</span>
      )}
    </div>
  );
}
