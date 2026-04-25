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
  Filter, 
  MousePointerClick, 
  HelpCircle 
} from "lucide-react";
import { AdSense } from "@/components/AdSense";

export function Sidebar() {
  const [year, setYear] = useQueryState("year", { defaultValue: "2024" });
  const [region, setRegion] = useQueryState("region", { defaultValue: "All Regions" });

  return (
    <nav className="fixed left-0 top-0 h-screen w-[280px] z-50 bg-slate-950/40 backdrop-blur-[20px] border-r-[0.5px] border-white/10 flex flex-col py-8 px-6 gap-6">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-lg font-bold text-white tracking-tighter">Population Insight</h1>
        <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">Republic of Korea</p>
      </div>

      <div className="flex flex-col gap-1 flex-grow">
        <Link href="/" className="flex items-center gap-3 text-cyan-400 bg-cyan-400/10 rounded-lg px-4 py-3 border-l-4 border-cyan-400 hover:text-white transition-all duration-200">
          <LayoutDashboard size={20} />
          <span className="font-label-sm text-[12px]">Dashboard</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <Users size={20} />
          <span className="font-label-sm text-[12px]">Demographics</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <ArrowLeftRight size={20} />
          <span className="font-label-sm text-[12px]">Migration</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <MapIcon size={20} />
          <span className="font-label-sm text-[12px]">Regional</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 text-white/50 px-4 py-3 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg border-l-4 border-transparent hover:translate-x-1 duration-300">
          <FileText size={20} />
          <span className="font-label-sm text-[12px]">Reports</span>
        </Link>
      </div>

      <div className="flex flex-col gap-3 mt-auto mb-6">
        <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest mb-1">Filters</h3>
        
        <div className="relative">
          <select 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface font-body-base text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container appearance-none transition-colors"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="relative">
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-surface-container/50 border-[0.5px] border-outline-variant rounded-md px-3 py-2 text-on-surface font-body-base text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container appearance-none transition-colors"
          >
            <option value="All Regions">All Regions</option>
            <option value="Seoul Capital Area">Seoul Capital Area</option>
            <option value="Gyeonggi-do">Gyeonggi-do</option>
            <option value="Busan">Busan</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Not strictly needed since nuqs updates instantly, but kept for UI fidelity */}
        <button className="w-full bg-primary-container text-on-primary-container font-label-sm text-[12px] py-3 rounded-md hover:bg-primary-fixed-dim transition-colors mt-1 flex items-center justify-center gap-2">
          <Filter size={16} /> Apply Filters
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t-[0.5px] border-white/10 pt-6">
        <div className="glass-panel rounded-lg flex flex-col items-center justify-center text-center h-[100px] overflow-hidden">
          {/* 
            Replace client and slot with your actual Google AdSense IDs.
            For now, we render the component, but ads won't show until the domain is approved.
          */}
          <AdSense 
            client="ca-pub-0000000000000000" 
            slot="0000000000" 
            className="w-full h-full"
          />
        </div>
        <div className="flex justify-between mt-3">
          <Link href="#" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <HelpCircle size={16} />
            <span className="font-label-sm text-[12px]">Support</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
