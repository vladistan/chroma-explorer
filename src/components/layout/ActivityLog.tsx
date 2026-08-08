import { useEffect, useRef, useState } from 'react'

export interface ActivityDetail {
  label: string
  durationMs?: number
  status?: 'ok' | 'error'
}

interface ActivityEntry extends ActivityDetail {
  id: number
  timestamp: Date
}

let nextId = 0

export function ActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ActivityDetail>).detail
      setEntries(prev => [...prev.slice(-49), {
        id: nextId++,
        timestamp: new Date(),
        label: detail.label,
        durationMs: detail.durationMs,
        status: detail.status ?? 'ok',
      }])
    }
    window.addEventListener('chroma:activity', handler)
    return () => window.removeEventListener('chroma:activity', handler)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  return (
    <div className="flex flex-col border-t border-black/[0.08] dark:border-white/[0.08]" style={{ height: '110px' }}>
      <div className="px-3 pt-1.5 pb-0.5 flex-shrink-0">
        <span className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-wide">Activity</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pb-2">
        {entries.length === 0 ? (
          <p className="text-[10px] text-sidebar-foreground/30 italic mt-0.5">No activity yet</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex items-baseline gap-1 min-w-0 leading-[1.6]">
              <span className="text-[9px] text-sidebar-foreground/30 tabular-nums flex-shrink-0">
                {entry.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                })}
              </span>
              <span className={`text-[10px] truncate flex-1 min-w-0 ${
                entry.status === 'error' ? 'text-destructive/70' : 'text-sidebar-foreground/60'
              }`}>
                {entry.label}
              </span>
              {entry.durationMs !== undefined && (
                <span className="text-[9px] text-sidebar-foreground/25 flex-shrink-0">
                  {entry.durationMs}ms
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
