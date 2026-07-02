/**
 * ColorPaletteEditor — edits an event color palette of up to 5 colors.
 * Each color can be cleared (set to null) so only the colors you need are active.
 *
 * Props:
 *   palette   — { color1, color2, color3, color4, color5 }
 *   onChange  — (updatedPalette) => void
 */
import { useRef } from 'react'

const LABELS = [
  { key: 'color1', label: 'Primary',    hint: 'Titles, borders' },
  { key: 'color2', label: 'Secondary',  hint: 'Subtitles, accents' },
  { key: 'color3', label: 'Accent',     hint: 'Separators, highlights' },
  { key: 'color4', label: 'Text',       hint: 'Body text' },
  { key: 'color5', label: 'Background', hint: 'Card / background' },
]

const FALLBACK = '#6d28d9'

function ColorSlot({ colorKey, label, hint, value, onChange, onClear }) {
  const inputRef = useRef(null)
  const isSet    = value && value.trim() !== ''

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative group">
        {isSet ? (
          <>
            {/* Colour swatch — clicking opens native picker */}
            <div
              className="w-10 h-10 rounded-lg border-2 border-slate-200 overflow-hidden cursor-pointer shadow-sm"
              style={{ backgroundColor: value }}
              onClick={() => inputRef.current?.click()}
              title={hint}
            >
              <input
                ref={inputRef}
                type="color"
                value={value}
                onChange={(e) => onChange(colorKey, e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {/* Clear button — appears on hover */}
            <button
              type="button"
              onClick={() => onClear(colorKey)}
              title="Clear this color"
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-400 text-white
                         text-[10px] leading-none flex items-center justify-center
                         opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
            >
              ×
            </button>
          </>
        ) : (
          /* Empty slot — click to pick a color */
          <button
            type="button"
            onClick={() => {
              onChange(colorKey, FALLBACK)
              setTimeout(() => inputRef.current?.click(), 30)
            }}
            title={`Add ${label}`}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-300 text-slate-300
                       hover:border-violet-400 hover:text-violet-400 transition-colors
                       flex items-center justify-center text-xl leading-none"
          >
            <input
              ref={inputRef}
              type="color"
              defaultValue={FALLBACK}
              onChange={(e) => onChange(colorKey, e.target.value)}
              className="sr-only"
            />
            +
          </button>
        )}
      </div>
      <span className={`text-xs text-center leading-none ${isSet ? 'text-slate-500' : 'text-slate-300'}`}>
        {label}
      </span>
    </div>
  )
}

export default function ColorPaletteEditor({ palette = {}, onChange }) {
  function handleChange(key, value) {
    onChange({ ...palette, [key]: value })
  }

  function handleClear(key) {
    const next = { ...palette }
    delete next[key]
    onChange(next)
  }

  const activeCount = LABELS.filter(({ key }) => palette[key]?.trim()).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Color Palette</p>
        <span className="text-xs text-slate-400">{activeCount} / 5 active</span>
      </div>

      {/* Swatches */}
      <div className="grid grid-cols-5 gap-2">
        {LABELS.map(({ key, label, hint }) => (
          <ColorSlot
            key={key}
            colorKey={key}
            label={label}
            hint={hint}
            value={palette[key] ?? ''}
            onChange={handleChange}
            onClear={handleClear}
          />
        ))}
      </div>

      {/* Hex inputs — only shown for active colors */}
      {activeCount > 0 && (
        <div className="flex gap-2 flex-wrap">
          {LABELS.filter(({ key }) => palette[key]?.trim()).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-slate-200 shrink-0"
                style={{ backgroundColor: palette[key] }}
              />
              <span className="text-xs text-slate-400">{label}</span>
              <input
                type="text"
                value={palette[key] ?? ''}
                maxLength={7}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-20 text-xs border border-slate-200 rounded px-1.5 py-0.5 font-mono focus:outline-none focus:border-violet-400"
                placeholder="#000000"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

