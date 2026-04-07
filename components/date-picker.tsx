'use client'
import { useState, useRef, useEffect } from 'react'
import { t } from './shared'

interface DatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Odaberi datum' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  // Convert Sunday=0 to Monday=0 format
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const monthName = currentMonth.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    // Don't go before current month
    const now = new Date()
    if (prev.getFullYear() > now.getFullYear() || 
        (prev.getFullYear() === now.getFullYear() && prev.getMonth() >= now.getMonth())) {
      setCurrentMonth(prev)
    }
  }

  const nextMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    setCurrentMonth(next)
  }

  const canGoPrev = () => {
    const now = new Date()
    return currentMonth.getFullYear() > now.getFullYear() || 
           (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth())
  }

  const selectDay = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selected.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (day: number) => {
    if (!value) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toISOString().split('T')[0] === value
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const weekDays = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']

  // Generate calendar days array
  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: t.inputBg,
          border: `1px solid ${isOpen ? t.accent : t.border}`,
          borderRadius: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ 
          color: value ? t.text : t.textMuted, 
          fontSize: 14,
          fontWeight: value ? 500 : 400
        }}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* Dropdown */}
      <div style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        zIndex: 50,
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'all 0.2s ease'
      }}>
        {/* Month Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: `1px solid ${t.border}`
        }}>
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: canGoPrev() ? t.inputBg : 'transparent',
              cursor: canGoPrev() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoPrev() ? 1 : 0.3
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span style={{ 
            fontSize: 15, 
            fontWeight: 700, 
            color: t.text,
            textTransform: 'capitalize'
          }}>
            {monthName}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: t.inputBg,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Weekday Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          padding: '12px 12px 8px'
        }}>
          {weekDays.map(day => (
            <div key={day} style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: t.textMuted,
              textTransform: 'uppercase'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          padding: '0 12px 16px'
        }}>
          {days.map((day, idx) => (
            <div key={idx} style={{ aspectRatio: '1' }}>
              {day !== null && (
                <button
                  type="button"
                  onClick={() => !isDisabled(day) && selectDay(day)}
                  disabled={isDisabled(day)}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 10,
                    border: isToday(day) && !isSelected(day) 
                      ? `2px solid ${t.accent}` 
                      : isSelected(day) 
                        ? `2px solid ${t.accent}` 
                        : '2px solid transparent',
                    background: isSelected(day) 
                      ? t.accent 
                      : isDisabled(day) 
                        ? 'transparent' 
                        : 'transparent',
                    cursor: isDisabled(day) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    fontSize: 14,
                    fontWeight: isSelected(day) || isToday(day) ? 700 : 500,
                    color: isSelected(day) 
                      ? '#fff' 
                      : isDisabled(day) 
                        ? t.textDim 
                        : isToday(day) 
                          ? t.accent 
                          : t.text
                  }}>
                    {day}
                  </span>
                  {isSelected(day) && (
                    <svg 
                      width="10" 
                      height="10" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#fff" 
                      strokeWidth="3"
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2
                      }}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Clear Button */}
        {value && (
          <div style={{ 
            padding: '0 12px 12px',
            borderTop: `1px solid ${t.border}`,
            paddingTop: 12
          }}>
            <button
              type="button"
              onClick={() => { onChange(null); setIsOpen(false) }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                color: t.textMuted,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Obriši odabir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
