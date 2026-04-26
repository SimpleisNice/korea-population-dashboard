"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Map as MapIcon,
  FileText,
  ChevronDown,
  X,
  HelpCircle,
} from "lucide-react";

interface MobileHeaderProps {
  regions: string[];
  years: number[];
  months: number[];
}

const MONTH_NAMES_KO: Record<number, string> = {
  1: "1월", 2: "2월", 3: "3월", 4: "4월",
  5: "5월", 6: "6월", 7: "7월", 8: "8월",
  9: "9월", 10: "10월", 11: "11월", 12: "12월",
};

export function MobileHeader({ regions, years, months }: MobileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [year, setYear] = useQueryState("year", { defaultValue: years[0]?.toString() || "2025" });
  const [month, setMonth] = useQueryState("month", { defaultValue: months[months.length - 1]?.toString() || "12" });
  const [region, setRegion] = useQueryState("region", { defaultValue: "전국" });

  return (
    <>
      {/* Fixed Top App Bar */}
      <header className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-slate-950/40 backdrop-blur-[20px] border-b-[0.5px] border-white/10">
        <button
          onClick={() => setMenuOpen(true)}
          className="text-cyan-400 hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-200"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-cyan-400 font-bold tracking-tighter text-xl">
          인구 인사이트
          <span className="text-[12px] font-normal text-on-surface-variant ml-2">
            {year}년 {MONTH_NAMES_KO[parseInt(month)] || `${month}월`}
          </span>
        </h1>
        <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-white/10 flex items-center justify-center">
          <Users size={16} className="text-on-surface-variant" />
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <nav className="absolute left-0 top-0 h-full w-[280px] bg-slate-950/90 backdrop-blur-[30px] border-r-[0.5px] border-white/10 flex flex-col py-8 px-6 gap-6 animate-slide-in-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tighter">인구 인사이트</h2>
                <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">대한민국</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-on-surface-variant hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-cyan-400 bg-cyan-400/10 rounded-lg px-4 py-3 border-l-4 border-cyan-400">
                <LayoutDashboard size={20} />
                <span className="text-[12px] font-semibold">대시보드</span>
              </Link>
              {[
                { icon: Users, label: "인구통계" },
                { icon: ArrowLeftRight, label: "인구이동" },
                { icon: MapIcon, label: "지역별" },
                { icon: FileText, label: "리포트" },
              ].map(({ icon: Icon, label }) => (
                <Link key={label} href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 rounded-lg border-l-4 border-transparent">
                  <Icon size={20} />
                  <span className="text-[12px] font-semibold">{label}</span>
                </Link>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 mt-auto">
              <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest mb-1">필터</h3>
              <div className="relative">
                <select value={year} onChange={(e) => { setYear(e.target.value); setMenuOpen(false); }} className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface text-sm appearance-none">
                  {years.map(y => <option key={y} value={y.toString()}>{y}년</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant"><ChevronDown size={16} /></div>
              </div>
              <div className="relative">
                <select value={month} onChange={(e) => { setMonth(e.target.value); setMenuOpen(false); }} className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface text-sm appearance-none">
                  {months.map(m => <option key={m} value={m.toString()}>{MONTH_NAMES_KO[m]}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant"><ChevronDown size={16} /></div>
              </div>
              <div className="relative">
                <select value={region} onChange={(e) => { setRegion(e.target.value); setMenuOpen(false); }} className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface text-sm appearance-none">
                  <option value="전국">전국</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant"><ChevronDown size={16} /></div>
              </div>
            </div>

            <div className="border-t-[0.5px] border-white/10 pt-4">
              <Link href="#" className="flex items-center gap-2 text-white/50 hover:text-white">
                <HelpCircle size={16} />
                <span className="text-[12px]">도움말</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
