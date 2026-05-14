'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Share2, Link2, ImageIcon, FileDown, Check, X } from 'lucide-react'

interface Props {
  regionCode: string
  sigunguName: string
  captureId?: string
}

export function ShareButton({ regionCode, sigunguName, captureId = 'region-content' }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function copyUrl() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1500)
  }

  async function saveImage() {
    if (capturing) return
    setCapturing(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const el = document.getElementById(captureId)
      if (!el) return
      const canvas = await html2canvas(el, { useCORS: true, scale: 2, backgroundColor: '#0f172a' })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `${sigunguName}_인구통계.png`
      a.click()
      setOpen(false)
    } finally {
      setCapturing(false)
    }
  }

  async function downloadCsv() {
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch(`/data/regions/${regionCode}.json`)
      const json = await res.json() as {
        months: Record<string, {
          population: number; households: number; householdSize: number; male: number; female: number
        }>
      }
      const header = '기준년월,총인구,세대수,세대당인구,남자,여자'
      const rows = Object.entries(json.months)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ym, s]) =>
          `${ym.slice(0, 4)}-${ym.slice(4)},${s.population},${s.households},${s.householdSize},${s.male},${s.female}`
        )
      const csv = [header, ...rows].join('\n')
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sigunguName}_인구통계.csv`
      a.click()
      URL.revokeObjectURL(url)
      setOpen(false)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface)]"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="공유하기"
        >
          <Share2 size={18} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        />
        <Dialog.Content
          className="fixed bottom-0 left-1/2 z-50 w-full rounded-t-2xl pb-8 pt-4"
          style={{
            maxWidth: 'var(--max-w)',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-bg)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>공유 & 내보내기</Dialog.Title>
          </VisuallyHidden.Root>

          {/* 핸들 */}
          <div className="mb-4 flex justify-center">
            <div className="h-1 w-10 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* 헤더 */}
          <div className="mb-4 flex items-center justify-between px-5">
            <p className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
              공유 & 내보내기
            </p>
            <Dialog.Close asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)' }}
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* 액션 목록 */}
          <div className="px-4 space-y-2">
            <ActionRow
              icon={copied ? <Check size={18} /> : <Link2 size={18} />}
              label={copied ? '복사됐어요!' : 'URL 복사'}
              description="현재 페이지 주소를 클립보드에 복사"
              onClick={copyUrl}
              accent={copied}
            />
            <ActionRow
              icon={<ImageIcon size={18} />}
              label={capturing ? '캡처 중...' : '이미지 저장'}
              description="현재 화면을 PNG로 저장"
              onClick={saveImage}
              loading={capturing}
            />
            <ActionRow
              icon={<FileDown size={18} />}
              label={downloading ? '준비 중...' : 'CSV 다운로드'}
              description={`${sigunguName} 전체 월별 데이터`}
              onClick={downloadCsv}
              loading={downloading}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ActionRow({
  icon,
  label,
  description,
  onClick,
  accent,
  loading,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  accent?: boolean
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        opacity: loading ? 0.6 : 1,
        cursor: loading ? 'default' : 'pointer',
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: accent ? 'var(--color-accent)' : 'var(--color-bg)',
          color: accent ? '#fff' : 'var(--color-accent)',
        }}
      >
        {icon}
      </span>
      <span>
        <p
          className="text-[14px] font-semibold"
          style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
        >
          {label}
        </p>
        <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </span>
    </button>
  )
}
