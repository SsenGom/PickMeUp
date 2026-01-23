import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface TimePickerProps {
  value: string // "HH:mm" format
  onChange: (value: string) => void
  className?: string
}

export default function TimePicker({ value, onChange, className = '' }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [hour, minute] = value.split(':').map(Number)
  const isPM = hour >= 12
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (type: 'period' | 'hour' | 'minute', val: number | string) => {
    let newHour = hour
    let newMinute = minute

    if (type === 'period') {
      const isNewPM = val === 'PM'
      if (isNewPM && hour < 12) {
        newHour = hour + 12
      } else if (!isNewPM && hour >= 12) {
        newHour = hour - 12
      }
    } else if (type === 'hour') {
      const h = val as number
      if (isPM) {
        newHour = h === 12 ? 12 : h + 12
      } else {
        newHour = h === 12 ? 0 : h
      }
    } else if (type === 'minute') {
      newMinute = val as number
    }

    const formatted = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
    onChange(formatted)
    
    if (type === 'minute') {
      setIsOpen(false)
    }
  }

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left flex items-center justify-between text-sm"
      >
        <span>{isPM ? '오후' : '오전'} {displayHour}:{String(minute).padStart(2, '0')}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex text-xs overflow-hidden w-full">
          {/* 오전/오후 */}
          <div className="flex-1 border-r border-gray-100 max-h-28 overflow-y-auto scrollbar-thin">
            {['AM', 'PM'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => handleSelect('period', period)}
                className={`block w-full px-2 py-1 text-center transition-colors ${
                  (period === 'PM') === isPM 
                    ? 'bg-primary-500 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {period === 'AM' ? '오전' : '오후'}
              </button>
            ))}
          </div>

          {/* 시 */}
          <div className="flex-1 border-r border-gray-100 max-h-28 overflow-y-auto scrollbar-thin">
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => handleSelect('hour', h)}
                className={`block w-full px-2 py-1 text-center transition-colors ${
                  displayHour === h 
                    ? 'bg-primary-500 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* 분 */}
          <div className="flex-1 max-h-28 overflow-y-auto scrollbar-thin">
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleSelect('minute', m)}
                className={`block w-full px-2 py-1 text-center transition-colors ${
                  minute === m 
                    ? 'bg-primary-500 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {String(m).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
