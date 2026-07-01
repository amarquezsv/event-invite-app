/**
 * replaceTokens — token replacement utility for invitation templates.
 *
 * HOW TO ADD A NEW TOKEN:
 *  1. Add an entry to TOKENS below with { key, label, description }.
 *  2. Add the corresponding key + sample value to SAMPLE_DATA.
 *  3. The token becomes available in TokenSelector automatically.
 */

/**
 * Sample values used when rendering the live preview in the Template Builder.
 * These are never sent to guests — they exist solely for the admin preview.
 */
export const SAMPLE_DATA = {
  eventName:      'The Johnson Wedding',
  eventSubtitle:  'A Celebration of Love',
  eventDate:      'Saturday, January 1, 2027',
  eventLocation:  'The Grand Ballroom',
  eventAddress:   '123 Celebration Ave, New York, NY 10001',
  eventTime:      '6:00 PM',
  guestSeatsText: 'You have 2 seats reserved.',
  adultOnlyText:  'This is an adults-only event.',
  thanksMessage:  'Thank you for your understanding.',
  closingMessage: 'We hope to see you there!',
}

/**
 * Master list of all supported template tokens.
 * Each entry describes a single placeholder that can be embedded in the HTML.
 *
 * @type {Array<{ key: string, label: string, description: string }>}
 */
export const TOKENS = [
  {
    key:         'eventName',
    label:       'Event Name',
    description: 'Full event title (e.g. "The Johnson Wedding")',
  },
  {
    key:         'eventSubtitle',
    label:       'Event Subtitle',
    description: 'Secondary heading below the title',
  },
  {
    key:         'eventDate',
    label:       'Event Date',
    description: 'Formatted date string (e.g. "Saturday, January 1, 2027")',
  },
  {
    key:         'eventLocation',
    label:       'Event Location',
    description: 'Venue or location name',
  },
  {
    key:         'eventAddress',
    label:       'Event Address',
    description: 'Full postal address of the venue',
  },
  {
    key:         'eventTime',
    label:       'Event Time',
    description: 'Start time (e.g. "6:00 PM")',
  },
  {
    key:         'guestSeatsText',
    label:       'Guest Seats',
    description: 'Personalised seat-count sentence for the guest',
  },
  {
    key:         'adultOnlyText',
    label:       'Adult Only Notice',
    description: 'Adults-only policy notice (shown conditionally)',
  },
  {
    key:         'thanksMessage',
    label:       'Thanks Message',
    description: 'Thank-you note shown near the end',
  },
  {
    key:         'closingMessage',
    label:       'Closing Message',
    description: 'Final line of the invitation',
  },
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
    Object.prototype.hasOwnProperty.call(data, key) ? data[key] : `{${key}}`
  )
}
