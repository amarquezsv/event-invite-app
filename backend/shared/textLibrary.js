/**
 * textLibrary — curated reusable invitation text blocks.
 *
 * Each entry:
 *   id        — stable identifier
 *   category  — wedding | birthday | baby-shower | corporate | anniversary | graduation | religious | general
 *   tone      — formal | casual | elegant | modern
 *   text      — the phrase / paragraph
 */

module.exports = [
  // ── Wedding ──────────────────────────────────────────────────────────────
  { id: 'txt-wed-001', category: 'wedding', tone: 'elegant', text: 'Together with their families, {groomName} and {brideName} request the honour of your presence at their wedding.' },
  { id: 'txt-wed-002', category: 'wedding', tone: 'formal', text: 'You are cordially invited to celebrate the marriage of {groomName} and {brideName}.' },
  { id: 'txt-wed-003', category: 'wedding', tone: 'casual', text: 'We are getting married and we would love you to celebrate with us!' },
  { id: 'txt-wed-004', category: 'wedding', tone: 'modern', text: 'We said yes! Join us as we begin forever.' },
  { id: 'txt-wed-005', category: 'wedding', tone: 'elegant', text: 'With joy in our hearts, we invite you to share in the celebration of our love.' },
  { id: 'txt-wed-006', category: 'wedding', tone: 'formal', text: 'The honour of your presence is requested at the marriage ceremony.' },

  // ── Birthday ─────────────────────────────────────────────────────────────
  { id: 'txt-bday-001', category: 'birthday', tone: 'casual', text: 'It\'s party time! Come celebrate my birthday with food, fun, and friends.' },
  { id: 'txt-bday-002', category: 'birthday', tone: 'elegant', text: 'Please join us for an evening of celebration in honour of {name}\'s birthday.' },
  { id: 'txt-bday-003', category: 'birthday', tone: 'modern', text: 'Another year of adventures awaits — come help us celebrate!' },
  { id: 'txt-bday-004', category: 'birthday', tone: 'formal', text: 'You are cordially invited to attend the birthday celebration of {name}.' },
  { id: 'txt-bday-005', category: 'birthday', tone: 'casual', text: 'Let\'s eat cake! We\'re throwing {name} a birthday bash and you\'re invited.' },

  // ── Baby Shower ───────────────────────────────────────────────────────────
  { id: 'txt-baby-001', category: 'baby-shower', tone: 'elegant', text: 'A new little one is on the way! Please join us to shower {parentNames} with love and well-wishes.' },
  { id: 'txt-baby-002', category: 'baby-shower', tone: 'casual', text: 'Baby is coming soon! Join us for a baby shower to celebrate the new arrival.' },
  { id: 'txt-baby-003', category: 'baby-shower', tone: 'modern', text: 'Tiny hands, tiny feet — a new baby is all we need. Come celebrate with us!' },
  { id: 'txt-baby-004', category: 'baby-shower', tone: 'formal', text: 'You are warmly invited to a baby shower in honour of {parentNames} and their precious new arrival.' },

  // ── Corporate ─────────────────────────────────────────────────────────────
  { id: 'txt-corp-001', category: 'corporate', tone: 'formal', text: 'You are invited to attend our annual corporate event. Please join us for an evening of networking and celebration.' },
  { id: 'txt-corp-002', category: 'corporate', tone: 'modern', text: 'Connect, celebrate, and collaborate. We\'d love to see you at our event.' },
  { id: 'txt-corp-003', category: 'corporate', tone: 'formal', text: 'On behalf of {companyName}, we cordially invite you to our {eventType}.' },
  { id: 'txt-corp-004', category: 'corporate', tone: 'casual', text: 'Great team. Great year. Come celebrate with us!' },

  // ── Anniversary ──────────────────────────────────────────────────────────
  { id: 'txt-anniv-001', category: 'anniversary', tone: 'elegant', text: 'Celebrating {years} wonderful years together. Please join us for an evening of love and gratitude.' },
  { id: 'txt-anniv-002', category: 'anniversary', tone: 'casual', text: '{years} years and counting! Come celebrate our anniversary with us.' },
  { id: 'txt-anniv-003', category: 'anniversary', tone: 'formal', text: 'With deep gratitude, we invite you to join us in celebrating our {years} anniversary.' },

  // ── Graduation ────────────────────────────────────────────────────────────
  { id: 'txt-grad-001', category: 'graduation', tone: 'casual', text: 'We did it! Join us in celebrating this milestone graduation.' },
  { id: 'txt-grad-002', category: 'graduation', tone: 'formal', text: 'You are cordially invited to attend the graduation celebration of {name}.' },
  { id: 'txt-grad-003', category: 'graduation', tone: 'modern', text: 'Tassel worth the hassle — come celebrate the graduate!' },

  // ── Religious ─────────────────────────────────────────────────────────────
  { id: 'txt-relig-001', category: 'religious', tone: 'formal', text: 'With gratitude to God, we invite you to share in this blessed celebration.' },
  { id: 'txt-relig-002', category: 'religious', tone: 'elegant', text: 'Together with our families, we invite you to join us in this sacred milestone.' },
  { id: 'txt-relig-003', category: 'religious', tone: 'casual', text: 'We are blessed to share this special moment with family and friends — please join us!' },

  // ── General ───────────────────────────────────────────────────────────────
  { id: 'txt-gen-001', category: 'general', tone: 'casual', text: 'Your presence would make our celebration complete.' },
  { id: 'txt-gen-002', category: 'general', tone: 'formal', text: 'We respectfully request the pleasure of your company.' },
  { id: 'txt-gen-003', category: 'general', tone: 'elegant', text: 'It would be our honour to have you join us for this special occasion.' },
  { id: 'txt-gen-004', category: 'general', tone: 'modern', text: 'Good food, good vibes, great company. Come celebrate with us!' },
  { id: 'txt-gen-005', category: 'general', tone: 'elegant', text: 'Please kindly RSVP by {rsvpDate} to help us prepare a place for you.' },
  { id: 'txt-gen-006', category: 'general', tone: 'formal', text: 'Kindly respond no later than {rsvpDate}.' },
]
