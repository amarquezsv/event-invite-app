/**
 * Built-in template registry.
 *
 * This is the single source of truth for all built-in JSX templates.
 * It is consumed by:
 *   - BuiltInTemplatePicker (admin — visual card selector)
 *   - InvitationPoster      (guest — renders the matched component)
 *
 * To add a new template:
 *  1. Create MyTemplate.jsx in this directory.
 *  2. Import it in InvitationPoster.jsx and add the key to TEMPLATES.
 *  3. Add an entry here.
 *
 * Fields:
 *   id          — must match the key in InvitationPoster's TEMPLATES map and event.templateId
 *   name        — Spanish display name
 *   nameEn      — English display name
 *   description — Spanish short description for the picker
 *   descriptionEn — English short description
 *   categories  — event categories this template is recommended for (badge shown in picker)
 *   isNew       — show "Nuevo / New" badge
 *   palette     — preview colors used in the thumbnail SVG
 */
export const BUILT_IN_TEMPLATES = [
  {
    id: 'wedding-boda',
    name: 'Boda Elegante',
    nameEn: 'Elegant Wedding',
    description: 'Rosas azules y verdes, marfil cálido, dorado, tipografía cursiva. Animado y 100% responsive.',
    descriptionEn: 'Blue & green roses, warm ivory, gold accents, script fonts. Animated and fully mobile-responsive.',
    categories: ['wedding', 'anniversary'],
    isNew: true,
    palette: { bg: '#f5f0e2', border: '#c9a227', primary: '#1e3a7a', accent: '#1a5226' },
  },
  {
    id: 'elegant',
    name: 'Elegante Clásico',
    nameEn: 'Classic Elegant',
    description: 'Tonos crema y ámbar con tipografía serif. Formal y atemporal.',
    descriptionEn: 'Cream and amber tones with serif typography. Formal and timeless.',
    categories: ['wedding', 'anniversary', 'religious'],
    palette: { bg: '#fdf8ec', border: '#d4a853', primary: '#1e293b', accent: '#d4a853' },
  },
  {
    id: 'classic',
    name: 'Rosa Romántico',
    nameEn: 'Romantic Rose',
    description: 'Tarjeta blanca con cabecera rosa. Romántico y tradicional.',
    descriptionEn: 'White card with a rose header. Romantic and traditional.',
    categories: ['wedding', 'baby-shower', 'birthday', 'anniversary'],
    palette: { bg: '#fff1f2', border: '#f43f5e', primary: '#1e293b', accent: '#f43f5e' },
  },
  {
    id: 'modern',
    name: 'Moderno Oscuro',
    nameEn: 'Dark Modern',
    description: 'Fondo oscuro con tipografía bold y acento violeta. Contemporáneo y llamativo.',
    descriptionEn: 'Dark background with bold typography and violet accent. Contemporary and striking.',
    categories: ['corporate', 'graduation', 'birthday', 'other'],
    palette: { bg: '#0f172a', border: '#7c3aed', primary: '#ffffff', accent: '#7c3aed' },
  },
]

/** Default templateId to assign when no explicit choice is made. */
export const DEFAULT_TEMPLATE_ID = 'elegant'

/**
 * Returns the templateId recommended for a given event category.
 * Falls back to DEFAULT_TEMPLATE_ID if no match.
 *
 * @param {string} category
 * @returns {string}
 */
export function getRecommendedTemplateId(category) {
  const match = BUILT_IN_TEMPLATES.find((t) => t.categories.includes(category))
  return match?.id ?? DEFAULT_TEMPLATE_ID
}
