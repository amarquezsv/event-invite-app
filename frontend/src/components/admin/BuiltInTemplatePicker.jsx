/**
 * BuiltInTemplatePicker
 *
 * A visual card-grid selector for built-in JSX invitation templates.
 * Shows a mini thumbnail, name, description, and "Recommended" badge.
 *
 * Props:
 *   value          — currently selected templateId (string)
 *   onChange       — (templateId: string) => void
 *   eventCategory  — current event category (used to highlight recommended templates)
 *   lang           — 'es' | 'en'  (admin UI language)
 */
import { useMemo } from 'react'
import { BUILT_IN_TEMPLATES } from '../invitation/builtInTemplates'

// ── Mini SVG thumbnails (one per templateId) ────────────────────────────────

const THUMB_W = 96
const THUMB_H = 128

function ThumbWeddingBoda() {
  return (
    <svg viewBox={`0 0 ${THUMB_W} ${THUMB_H}`} xmlns="http://www.w3.org/2000/svg" width={THUMB_W} height={THUMB_H}>
      {/* Warm ivory background */}
      <rect width={THUMB_W} height={THUMB_H} fill="#f5f0e2"/>
      {/* Gold single frame */}
      <rect x="5" y="5" width="86" height="118" fill="none" stroke="#c9a227" strokeWidth="1.2"/>

      {/* TL floral hint — green rose + leaves */}
      <ellipse cx="10" cy="10" rx="14" ry="12" fill="#2d8a3a" opacity="0.7"/>
      <ellipse cx="22" cy="6"  rx="10" ry="9"  fill="#4aad55" opacity="0.6"/>
      <ellipse cx="6"  cy="22" rx="6"  ry="12" fill="#3a8a35" opacity="0.5" transform="rotate(-30 6 22)"/>
      <ellipse cx="18" cy="20" rx="5"  ry="11" fill="#2d7a28" opacity="0.45" transform="rotate(-50 18 20)"/>
      <circle  cx="12" cy="10" r="3.5" fill="#0e4a1e" opacity="0.6"/>
      <ellipse cx="28" cy="16" rx="4"  ry="8"  fill="#3a8a35" opacity="0.4" transform="rotate(-60 28 16)"/>

      {/* BR floral hint — blue rose + cream rose + leaves */}
      <ellipse cx="82" cy="116" rx="16" ry="14" fill="#4a7ec8" opacity="0.75"/>
      <ellipse cx="70" cy="122" rx="14" ry="12" fill="#6a9fd8" opacity="0.65"/>
      <ellipse cx="88" cy="104" rx="10" ry="9"  fill="#f0d4a0" opacity="0.8"/>
      <circle  cx="82" cy="116" r="3.5" fill="#1a4490" opacity="0.65"/>
      <ellipse cx="68" cy="112" rx="5"  ry="11" fill="#2d7a28" opacity="0.5" transform="rotate(50 68 112)"/>
      <ellipse cx="78" cy="128" rx="5"  ry="10" fill="#3a8a35" opacity="0.45" transform="rotate(35 78 128)"/>
      <circle  cx="72" cy="124" r="2"   fill="#0e4a1e" opacity="0.4"/>

      {/* Gold sparkle dots */}
      <circle cx="80" cy="48" r="1.8" fill="#c9a227" opacity="0.5"/>
      <circle cx="75" cy="54" r="1.3" fill="#c9a227" opacity="0.38"/>
      <circle cx="15" cy="55" r="1.5" fill="#c9a227" opacity="0.42"/>
      <circle cx="12" cy="62" r="1.2" fill="#c9a227" opacity="0.32"/>

      {/* Couple names — script style */}
      <text x="48" y="36" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic"
        fontSize="9.5" fill="#1e3a7a" letterSpacing="0.3">Alfredo &amp;</text>
      <text x="48" y="47" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic"
        fontSize="9.5" fill="#1a5226">Lourdes</text>

      {/* Gold heart */}
      <path d="M48 54 C48 52.5 46 51 44.5 52.5 C43 54 44.5 55.5 48 57.5 C51.5 55.5 53 54 51.5 52.5 C50 51 48 52.5 48 54Z"
        fill="#c9a227" opacity="0.75"/>

      {/* Invite text line */}
      <rect x="20" y="62" width="56" height="1.6" rx="0.8" fill="#1e3a7a" opacity="0.25"/>
      <rect x="24" y="66" width="48" height="1.4" rx="0.7" fill="#1e3a7a" opacity="0.20"/>

      {/* Gold rule */}
      <line x1="18" y1="72" x2="78" y2="72" stroke="#c9a227" strokeWidth="0.7" opacity="0.45"/>

      {/* Guest name placeholder */}
      <text x="48" y="80" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic"
        fontSize="8" fill="#1e3a7a">Nombre Invitado</text>

      {/* Presence text */}
      <rect x="20" y="85" width="56" height="1.5" rx="0.75" fill="#1e3a7a" opacity="0.2"/>
      <rect x="24" y="89" width="48" height="1.4" rx="0.7"  fill="#1e3a7a" opacity="0.16"/>

      {/* Gold rule 2 */}
      <line x1="18" y1="94" x2="78" y2="94" stroke="#c9a227" strokeWidth="0.7" opacity="0.45"/>

      {/* Date/location lines */}
      <rect x="20" y="97" width="56" height="1.8" rx="0.9" fill="#1e3a7a" opacity="0.22"/>
      <rect x="20" y="102" width="52" height="1.7" rx="0.85" fill="#1e3a7a" opacity="0.19"/>
      <rect x="20" y="107" width="34" height="1.7" rx="0.85" fill="#1e3a7a" opacity="0.17"/>
    </svg>
  )
}

function ThumbElegant() {
  return (
    <svg viewBox={`0 0 ${THUMB_W} ${THUMB_H}`} xmlns="http://www.w3.org/2000/svg" width={THUMB_W} height={THUMB_H}>
      {/* Warm cream background */}
      <rect width={THUMB_W} height={THUMB_H} fill="#fdf8ec"/>
      {/* Gold border */}
      <rect x="4" y="4" width="88" height="120" fill="none" stroke="#d4a853" strokeWidth="2.5"/>
      {/* Top gold accent line */}
      <rect x="4" y="4" width="88" height="5" fill="url(#eg-grad)" opacity="0.9"/>
      <defs>
        <linearGradient id="eg-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d4a853"/>
          <stop offset="0.5" stopColor="#f0d080"/>
          <stop offset="1" stopColor="#d4a853"/>
        </linearGradient>
      </defs>
      {/* Ornament row */}
      <line x1="20" y1="22" x2="76" y2="22" stroke="#d4a853" strokeWidth="0.7" opacity="0.6"/>
      <polygon points="48,19 50,22 48,25 46,22" fill="#d4a853" opacity="0.7"/>
      {/* Title placeholder */}
      <rect x="18" y="28" width="60" height="4" rx="2" fill="#1e293b" opacity="0.3"/>
      <rect x="24" y="35" width="48" height="3" rx="1.5" fill="#1e293b" opacity="0.2"/>
      {/* Divider */}
      <line x1="22" y1="45" x2="74" y2="45" stroke="#d4a853" strokeWidth="0.7" opacity="0.5"/>
      <text x="48" y="44" textAnchor="middle" fontSize="7" fill="#d4a853">♥</text>
      {/* Event details */}
      <rect x="18" y="50" width="60" height="2.5" rx="1.2" fill="#1e293b" opacity="0.22"/>
      <rect x="22" y="56" width="52" height="2.5" rx="1.2" fill="#1e293b" opacity="0.18"/>
      <rect x="28" y="62" width="40" height="2.5" rx="1.2" fill="#1e293b" opacity="0.15"/>
      {/* Guest callout box */}
      <rect x="14" y="70" width="68" height="20" rx="2" fill="#fdf8ec" stroke="#e9c97e" strokeWidth="0.8"/>
      <rect x="18" y="76" width="60" height="2.2" rx="1.1" fill="#1e293b" opacity="0.2"/>
      <rect x="24" y="81" width="48" height="2.2" rx="1.1" fill="#1e293b" opacity="0.15"/>
      {/* Bottom ornament */}
      <line x1="20" y1="97" x2="76" y2="97" stroke="#d4a853" strokeWidth="0.7" opacity="0.6"/>
      <polygon points="48,94 50,97 48,100 46,97" fill="#d4a853" opacity="0.7"/>
      {/* Bottom gold accent */}
      <rect x="4" y="119" width="88" height="5" fill="url(#eg-grad)" opacity="0.9"/>
    </svg>
  )
}

function ThumbClassic() {
  return (
    <svg viewBox={`0 0 ${THUMB_W} ${THUMB_H}`} xmlns="http://www.w3.org/2000/svg" width={THUMB_W} height={THUMB_H}>
      {/* Card background */}
      <rect width={THUMB_W} height={THUMB_H} rx="6" fill="#fff1f2"/>
      {/* Rose header block */}
      <rect width={THUMB_W} height="40" rx="6" fill="#f43f5e"/>
      <rect x="0" y="34" width={THUMB_W} height="6" fill="#f43f5e"/>
      {/* Header text */}
      <rect x="18" y="12" width="60" height="4.5" rx="2.2" fill="white" opacity="0.9"/>
      <rect x="26" y="20" width="44" height="3.5" rx="1.7" fill="white" opacity="0.65"/>
      <rect x="30" y="27" width="36" height="3" rx="1.5" fill="white" opacity="0.5"/>
      {/* White card body */}
      <rect x="8" y="46" width="80" height="76" rx="3" fill="white"/>
      {/* Date/time grid */}
      <rect x="14" y="53" width="34" height="14" rx="2" fill="#fff1f2"/>
      <rect x="52" y="53" width="34" height="14" rx="2" fill="#fff1f2"/>
      <rect x="16" y="56" width="18" height="2" rx="1" fill="#f43f5e" opacity="0.4"/>
      <rect x="16" y="60" width="28" height="2.5" rx="1.2" fill="#1e293b" opacity="0.25"/>
      <rect x="54" y="56" width="14" height="2" rx="1" fill="#f43f5e" opacity="0.4"/>
      <rect x="54" y="60" width="24" height="2.5" rx="1.2" fill="#1e293b" opacity="0.25"/>
      {/* Location */}
      <rect x="14" y="72" width="52" height="2.5" rx="1.2" fill="#1e293b" opacity="0.22"/>
      <rect x="14" y="77" width="44" height="2" rx="1" fill="#1e293b" opacity="0.15"/>
      {/* Divider */}
      <line x1="14" y1="84" x2="82" y2="84" stroke="#ffe4e6" strokeWidth="1.2"/>
      {/* Guest seat callout */}
      <rect x="14" y="89" width="68" height="2.2" rx="1.1" fill="#1e293b" opacity="0.18"/>
      <rect x="20" y="94" width="56" height="2" rx="1" fill="#1e293b" opacity="0.13"/>
    </svg>
  )
}

function ThumbModern() {
  return (
    <svg viewBox={`0 0 ${THUMB_W} ${THUMB_H}`} xmlns="http://www.w3.org/2000/svg" width={THUMB_W} height={THUMB_H}>
      {/* Dark background */}
      <rect width={THUMB_W} height={THUMB_H} fill="#0f172a"/>
      {/* Violet left accent bar */}
      <rect x="0" y="0" width="3" height={THUMB_H} fill="#7c3aed"/>
      {/* Category label */}
      <rect x="10" y="16" width="35" height="2.5" rx="1.2" fill="#7c3aed" opacity="0.9"/>
      {/* Big title */}
      <rect x="10" y="22" width="72" height="6" rx="2" fill="white" opacity="0.85"/>
      <rect x="10" y="31" width="60" height="5" rx="2" fill="white" opacity="0.65"/>
      <rect x="10" y="39" width="50" height="4.5" rx="2" fill="white" opacity="0.45"/>
      {/* Violet accent divider line */}
      <rect x="10" y="50" width="76" height="1.5" rx="0.75" fill="#7c3aed" opacity="0.7"/>
      {/* Detail rows with left violet bar */}
      <rect x="10" y="56" width="2" height="8" rx="1" fill="#7c3aed"/>
      <rect x="16" y="58" width="55" height="2.2" rx="1.1" fill="white" opacity="0.5"/>
      <rect x="16" y="62" width="40" height="1.8" rx="0.9" fill="white" opacity="0.3"/>
      <rect x="10" y="70" width="2" height="8" rx="1" fill="#7c3aed"/>
      <rect x="16" y="72" width="50" height="2.2" rx="1.1" fill="white" opacity="0.5"/>
      <rect x="16" y="76" width="35" height="1.8" rx="0.9" fill="white" opacity="0.3"/>
      {/* Guest callout — dark card */}
      <rect x="10" y="84" width="76" height="24" rx="3" fill="#1e293b"/>
      <rect x="10" y="84" width="76" height="3" rx="1.5" fill="#7c3aed"/>
      <rect x="16" y="91" width="55" height="2.2" rx="1.1" fill="white" opacity="0.5"/>
      <rect x="16" y="96" width="40" height="2" rx="1" fill="white" opacity="0.35"/>
      <rect x="16" y="101" width="46" height="2" rx="1" fill="#7c3aed" opacity="0.7"/>
    </svg>
  )
}

const THUMBNAILS = {
  'wedding-boda': ThumbWeddingBoda,
  'elegant':      ThumbElegant,
  'classic':      ThumbClassic,
  'modern':       ThumbModern,
}

// ── Picker component ────────────────────────────────────────────────────────

export default function BuiltInTemplatePicker({ value, onChange, eventCategory = '', lang = 'es' }) {
  const isEs = lang !== 'en'

  const label      = isEs ? 'Plantilla de Invitación Integrada' : 'Built-in Invitation Template'
  const subLabel   = isEs
    ? 'Selecciona el diseño predeterminado para las invitaciones de este evento.'
    : 'Select the default design for this event\'s invitations.'
  const recommended = isEs ? 'Recomendada' : 'Recommended'
  const newBadge   = isEs ? 'Nuevo' : 'New'
  const noneLabel  = isEs ? 'Sin plantilla' : 'No template'
  const noneDesc   = isEs ? 'Usa el póster integrado por defecto' : 'Use the default built-in poster'

  const recommendedIds = useMemo(
    () => BUILT_IN_TEMPLATES.filter((t) => t.categories.includes(eventCategory)).map((t) => t.id),
    [eventCategory]
  )

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <span className="text-xs text-slate-400">{subLabel}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* None option */}
        <TemplateCard
          id=""
          name={noneLabel}
          description={noneDesc}
          isSelected={value === '' || value == null}
          onClick={() => onChange('')}
          thumbnail={null}
        />

        {BUILT_IN_TEMPLATES.map((tmpl) => {
          const Thumb = THUMBNAILS[tmpl.id]
          return (
            <TemplateCard
              key={tmpl.id}
              id={tmpl.id}
              name={isEs ? tmpl.name : tmpl.nameEn}
              description={isEs ? tmpl.description : tmpl.descriptionEn}
              isSelected={value === tmpl.id}
              isRecommended={recommendedIds.includes(tmpl.id)}
              isNew={tmpl.isNew}
              palette={tmpl.palette}
              onClick={() => onChange(tmpl.id)}
              thumbnail={Thumb ? <Thumb /> : null}
              recommendedLabel={recommended}
              newLabel={newBadge}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Single card ─────────────────────────────────────────────────────────────

function TemplateCard({
  id,
  name,
  description,
  isSelected,
  isRecommended,
  isNew,
  palette,
  onClick,
  thumbnail,
  recommendedLabel = 'Recommended',
  newLabel = 'New',
}) {
  const borderClass = isSelected
    ? 'ring-2 ring-violet-500 border-violet-300'
    : 'border-slate-200 hover:border-violet-300'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center text-center border rounded-xl p-2 transition-all bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 ${borderClass}`}
    >
      {/* Badges */}
      <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
        {isNew && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-600 text-white leading-none">
            {newLabel}
          </span>
        )}
        {isRecommended && !isNew && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white leading-none">
            ✓ {recommendedLabel}
          </span>
        )}
        {isRecommended && isNew && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white leading-none">
            ✓ {recommendedLabel}
          </span>
        )}
      </div>

      {/* Selected check */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Thumbnail */}
      <div
        className="w-full rounded-lg overflow-hidden mb-2 mt-3"
        style={{ background: palette?.bg ?? '#f8fafc' }}
      >
        {thumbnail ?? (
          /* "None" placeholder */
          <div
            className="flex items-center justify-center"
            style={{ width: THUMB_W, height: THUMB_H, maxWidth: '100%' }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="4" width="32" height="32" rx="4" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3"/>
              <line x1="13" y1="13" x2="27" y2="27" stroke="#cbd5e1" strokeWidth="1.5"/>
              <line x1="27" y1="13" x2="13" y2="27" stroke="#cbd5e1" strokeWidth="1.5"/>
            </svg>
          </div>
        )}
      </div>

      {/* Colour swatches */}
      {palette && (
        <div className="flex gap-1 mb-1.5">
          {Object.values(palette).map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full border border-white/60 shadow-sm"
              style={{ background: color }}
            />
          ))}
        </div>
      )}

      {/* Name */}
      <p className="text-xs font-semibold text-slate-700 leading-tight">{name}</p>

      {/* Description — shown on hover via title tooltip & small text on larger screens */}
      <p className="hidden sm:block text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2 px-1">
        {description}
      </p>
    </button>
  )
}
