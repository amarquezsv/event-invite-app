import ElegantTemplate from './ElegantTemplate'
import ModernTemplate  from './ModernTemplate'
import ClassicTemplate from './ClassicTemplate'

/**
 * Template registry.
 *
 * To add a new built-in template:
 *  1. Create a React component in this directory (e.g. RusticTemplate.jsx).
 *  2. Import it above.
 *  3. Add an entry to TEMPLATES using the same key you'll use as templateId
 *     in the event config.
 *
 * Each template component receives two props:
 *   event  — the event config object  { name, description, location, address, date, time }
 *   guest  — the guest object         { name, seats, confirmed }  (nullable on the home page)
 */
const TEMPLATES = {
  elegant: ElegantTemplate,
  modern:  ModernTemplate,
  classic: ClassicTemplate,
}

/**
 * InvitationPoster
 *
 * Selects and renders the template whose key matches event.templateId.
 * Falls back to ElegantTemplate if the key is not found.
 */
export default function InvitationPoster({ event, guest }) {
  const Template = TEMPLATES[event?.templateId] ?? ElegantTemplate
  return <Template event={event} guest={guest} />
}
