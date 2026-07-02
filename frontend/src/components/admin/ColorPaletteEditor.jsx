/**
 * ColorPaletteEditor — edits an event color palette of up to 5 colors.
 *
 * Props:
 *   palette   — { color1, color2, color3, color4, color5 }
 *   onChange  — (updatedPalette) => void
 */

const LABELS = [
  { key: 'color1', label: 'Primary',    hint: 'Titles, borders' },
  { key: 'color2', label: 'Secondary',  hint: 'Subtitles, accents' },
  { key: 'color3', label: 'Accent',     hint: 'Separators, highlights' },
  { key: 'color4', label: 'Text',       hint: 'Body text' },
  { key: 'color5', label: 'Background', hint: 'Card / background' },
]

export default function ColorPaletteEditor({ palette = {}, onChange }) {
  function handleChange(key, value) {
    onChange({ ...palette, [key]: value })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Color Palette</p>
      <div className="grid grid-cols-5 gap-2">
        {LABELS.map(({ key, label, hint }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-lg border-2 border-slate-200 overflow-hidden cursor-pointer shadow-sm"
              style={{ backgroundColor: palette[key] ?? '#cccccc' }}
            >
              <input
                type="color"
                value={palette[key] ?? '#cccccc'}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
                title={hint}
              />
            </div>
            <span className="text-xs text-slate-500 text-center leading-none">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full border border-slate-200"
              style={{ backgroundColor: palette[key] ?? '#cccccc' }}
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
    </div>
  )
}
