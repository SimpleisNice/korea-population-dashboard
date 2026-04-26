"use client";

import Link from "next/link";
import { useQueryState } from "nuqs";
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  Map as MapIcon, 
  FileText, 
  ChevronDown, 
  HelpCircle 
} from "lucide-react";
import { AdSense } from "@/components/AdSense";
import { ShareButton } from "@/components/ShareButton";

interface SidebarProps {
  regions: string[];
  years: number[];
  months: number[];
}

const MONTH_NAMES_KO: Record<number, string> = {
  1: '1월', 2: '2월', 3: '3월', 4: '4월',
  5: '5월', 6: '6월', 7: '7월', 8: '8월',
  9: '9월', 10: '10월', 11: '11월', 12: '12월',
};

export function Sidebar({ regions, years, months }: SidebarProps) {
  const [year, setYear] = useQueryState("year", { defaultValue: years[0]?.toString() || "2025" });
  const [month, setMonth] = useQueryState("month", { defaultValue: months[months.length - 1]?.toString() || "12" });
  const [region, setRegion] = useQueryState("region", { defaultValue: "전국" });

  return (
    <nav className="fixed left-0 top-0 h-screen w-[280px] z-50 bg-slate-950/40 backdrop-blur-[20px] border-r-[0.5px] border-white/10 flex flex-col py-8 px-6 gap-6">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-lg font-bold text-white tracking-tighter">인구 인사이트</h1>
        <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">대한민국 주민등록 인구</p>
      </div>

      <div className="flex flex-col gap-1 flex-grow">
        <Link href="/" className="flex items-center gap-3 text-cyan-400 bg-cyan-400/10 rounded-lg px-4 py-3 border-l-4 border-cyan-400 hover:text-white transition-all duration-200">
          <LayoutDashboard size={20} />
          <span className="font-label-sm text-[12px]">대시보드</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <Users size={20} />
          <span className="font-label-sm text-[12px]">인구통계</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <ArrowLeftRight size={20} />
          <span className="font-label-sm text-[12px]">인구이동</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <MapIcon size={20} />
          <span className="font-label-sm text-[12px]">지역별</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <FileText size={20} />
          <span className="font-label-sm text-[12px]">리포트</span>
        </Link>
      </div>

      <div className="flex flex-col gap-3 mt-auto mb-6">
        <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest mb-1">필터</h3>
        
        {/* Year Filter */}
        <div className="relative">
          <select 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface font-body-base text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container appearance-none transition-colors"
          >
            {years.map(y => (
              <option key={y} value={y.toString()}>{y}년</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Month Filter */}
        <div className="relative">
          <select 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface font-body-base text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container appearance-none transition-colors"
          >
            {months.map(m => (
              <option key={m} value={m.toString()}>{MONTH_NAMES_KO[m] || `${m}월`}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Region Filter */}
        <div className="relative">
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface font-body-base text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container appearance-none transition-colors"
          >
            <option value="전국">전국</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
            <ChevronDown size={16} />
          </div>
        </div>

        <ShareButton
          className="w-full bg-surface-container/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-[12px] py-3 rounded-md transition-colors mt-1 justify-center border-[0.5px] border-outline-variant"
          label="현재 필터 링크 복사"
        />
      </div>

      <div className="flex flex-col gap-3 border-t-[0.5px] border-white/10 pt-6">
        <div className="glass-panel rounded-lg flex flex-col items-center justify-center text-center h-[100px] overflow-hidden">
          <AdSense 
            client="ca-pub-0000000000000000" 
            slot="0000000000" 
            className="w-full h-full"
          />
        </div>
        <div className="flex justify-between mt-3">
          <Link href="#" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <HelpCircle size={16} />
            <span className="font-label-sm text-[12px]">도움말</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
