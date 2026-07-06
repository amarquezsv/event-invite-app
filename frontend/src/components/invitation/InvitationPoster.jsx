import ElegantTemplate      from './ElegantTemplate'
import ModernTemplate       from './ModernTemplate'
import ClassicTemplate      from './ClassicTemplate'
import WeddingBodaTemplate  from './WeddingBodaTemplate'

/**
 * Template registry.
 *
 * To add a new built-in template:
 *  1. Create a React component in this directory (e.g. RusticTemplate.jsx).
 *  2. Import it above.
 *  3. Add an entry to TEMPLATES using the same key you'll use as templateId
 *     in the event config.
 *
 * Each template component receives:
 *   event    — event config object  { name, description, location, address, date, time, lang }
 *   guest    — guest object         { name, seats, confirmed }  (nullable on the home page)
 *   tokenMap — token replacement map (optional, used by dynamic templates)
 *   lang     — 'es' | 'en' for bilingual templates
 */
const TEMPLATES = {
  elegant:       ElegantTemplate,
  modern:        ModernTemplate,
  classic:       ClassicTemplate,
  'wedding-boda': WeddingBodaTemplate,
}

/**
 * InvitationPoster
 *
 * Selects and renders the template whose key matches event.templateId.
 * Falls back to ElegantTemplate if the key is not found.
 */
export default function InvitationPoster({ event, guest, tokenMap, lang }) {
  const Template = TEMPLATES[event?.templateId] ?? ElegantTemplate
  return <Template event={event} guest={guest} tokenMap={tokenMap} lang={lang} />
}
