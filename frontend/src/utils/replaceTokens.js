/**
 * replaceTokens — token replacement utility for invitation templates.
 *
 * HOW TO ADD A NEW TOKEN:
 *  1. Add an entry to TOKENS below with { key, label, description, group }.
 *  2. Add the corresponding key + sample value to SAMPLE_DATA.
 *  3. The token becomes available in TokenSelector automatically.
 */

/**
 * Sample values used when rendering the live preview in the Template Builder.
 * These are never sent to guests — they exist solely for the admin preview.
 */
export const SAMPLE_DATA = {
  // Event data
  eventName:      'Alfredo & Lourdes',
  eventSubtitle:  '¡Nos casamos!',
  eventDate:      'Sábado, 21 de noviembre de 2026',
  eventLocation:  'Quinta Mirasol, San Salvador, El Salvador',
  eventAddress:   'Calle El Pedregal, San Salvador, El Salvador',
  eventTime:      '4:00 PM',
  category:       'wedding',
  // Color palette
  color1:         '#21418d',
  color2:         '#b8942d',
  color3:         '#f7f3ea',
  color4:         '#2e7d32',
  color5:         '#ffffff',
  // Guest data
  guestName:      'Alfredo Márquez',
  guestSeats:     '2',
  customNotes:    'Por favor llegue 15 minutos antes.',
  inviteLink:     'https://example.com/invite/preview',
  // Custom event texts
  guestSeatsText:  'Le hemos reservado 2 espacios.',
  adultOnlyText:   'Para mantener un ambiente íntimo y elegante, respetuosamente este evento será solo para adultos.',
  noChildrenText:  'No se permiten niños menores de 12 años.',
  thanksMessage:   'Gracias por su comprensión.',
  closingMessage:  'Esperamos contar con su presencia para celebrar este gran día.',
  dressCode:       'Etiqueta',
  giftSuggestions: 'Agradecemos que las muestras de cariño sean gentilmente entregadas en sobre.',
  recommendations: 'Recomendamos llegar 15 minutos antes de la ceremonia.',
  rsvpDate:        '1 de noviembre de 2026',
}

/**
 * Token groups for organised display in the token selector UI.
 */
export const TOKEN_GROUPS = [
  'Event',
  'Colors',
  'Guest',
  'Content',
]

/**
 * Master list of all supported template tokens.
 */
export const TOKENS = [
  // ── Event ──────────────────────────────────────────────────────
  { key: 'eventName',     label: 'Event Name',     description: 'Full event title',                   group: 'Event' },
  { key: 'eventSubtitle', label: 'Event Subtitle',  description: 'Secondary heading',                  group: 'Event' },
  { key: 'eventDate',     label: 'Event Date',      description: 'Formatted date string',              group: 'Event' },
  { key: 'eventTime',     label: 'Event Time',      description: 'Start time (e.g. "6:00 PM")',        group: 'Event' },
  { key: 'eventLocation', label: 'Event Location',  description: 'Venue or location name',             group: 'Event' },
  { key: 'eventAddress',  label: 'Event Address',   description: 'Full postal address',                group: 'Event' },
  { key: 'category',      label: 'Category',        description: 'Event category (wedding, birthday…)', group: 'Event' },
  // ── Colors ─────────────────────────────────────────────────────
  { key: 'color1', label: 'Color 1 (Primary)',    description: 'Primary palette color (hex)',    group: 'Colors' },
  { key: 'color2', label: 'Color 2 (Secondary)',  description: 'Secondary palette color (hex)',  group: 'Colors' },
  { key: 'color3', label: 'Color 3 (Accent)',     description: 'Accent palette color (hex)',     group: 'Colors' },
  { key: 'color4', label: 'Color 4 (Text)',       description: 'Text color (hex)',               group: 'Colors' },
  { key: 'color5', label: 'Color 5 (Background)', description: 'Background palette color (hex)', group: 'Colors' },
  // ── Guest ──────────────────────────────────────────────────────
  { key: 'guestName',   label: 'Guest Name',   description: "Guest's full name",          group: 'Guest' },
  { key: 'guestSeats',  label: 'Guest Seats',  description: 'Number of seats reserved',   group: 'Guest' },
  { key: 'customNotes', label: 'Custom Notes', description: 'Per-guest custom note',      group: 'Guest' },
  { key: 'inviteLink',  label: 'Invite Link',  description: 'Personalised RSVP URL',      group: 'Guest' },
  // ── Content ────────────────────────────────────────────────────
  { key: 'guestSeatsText',  label: 'Seats Sentence',     description: 'Full seat-count sentence',          group: 'Content' },
  { key: 'adultOnlyText',   label: 'Adults Only Notice', description: 'Adults-only policy notice',         group: 'Content' },
  { key: 'noChildrenText',  label: 'No Children Notice', description: 'No-children policy notice',         group: 'Content' },
  { key: 'dressCode',       label: 'Dress Code',         description: 'Dress code requirement',            group: 'Content' },
  { key: 'giftSuggestions', label: 'Gift Suggestions',   description: 'Gift or registry suggestions',      group: 'Content' },
  { key: 'recommendations', label: 'Recommendations',    description: 'General recommendations / notes',   group: 'Content' },
  { key: 'rsvpDate',        label: 'RSVP Date',          description: 'RSVP deadline date',                group: 'Content' },
  { key: 'thanksMessage',   label: 'Thanks Message',     description: 'Thank-you note at the end',         group: 'Content' },
  { key: 'closingMessage',  label: 'Closing Message',    description: 'Final line of the invitation',      group: 'Content' },
]

/**
 * Replaces all `{tokenKey}` placeholders in the given HTML string with the
 * corresponding values from `data`.
 *
 * Tokens present in the HTML but absent from `data` are left as-is, so they
 * remain visible in the preview and are not silently dropped.
 *
 * @param {string} html                      - Raw HTML template string
 * @param {Record<string, string>} data      - Map of token key → replacement value
 * @returns {string}                         - HTML with tokens replaced
 */
export function replaceTokens(html, data) {
  if (!html) return ''
  return html.replace(/\{(\w+)\}/g, (_match, key) =>
    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : `{${key}}`
  )
}

