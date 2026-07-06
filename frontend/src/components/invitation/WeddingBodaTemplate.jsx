/**
 * WeddingBodaTemplate
 *
 * Responsive, animated wedding invitation template.
 * Uses fondo-boda.png as the full card background — the PNG contains the
 * complete flower artwork (green rose TL, blue+cream roses BR, gold sparkles
 * and double gold frame) so no SVG approximations are needed.
 */
import fondoBoda from '../../assets/fondo-boda.png'

// ── Colour tokens ─────────────────────────────────────────────────────────
const BLUE      = '#1e3a7a'  // deep navy — all body text
const NAME2_COL = '#1a5226'  // dark forest green — second partner name
const GREEN_ICO = '#2d7a32'  // icon/accent green
const GOLD      = '#c9a227'  // warm gold — heart, rules
const CREAM     = '#f5f0e2'  // warm ivory — fallback background colour

// ── CSS animations + fonts ────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600;1,700&family=Imperial+Script&display=swap');

  @keyframes wbt-fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wbt-heartbeat {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.15); }
  }
  @keyframes wbt-expandLine {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 0.4; }
  }
  @keyframes wbt-shimmer {
    0%, 100% { opacity: 0.88; }
    50%      { opacity: 1; }
  }

  .wbt-card {
    box-shadow: 0 14px 55px rgba(30,58,122,.18), 0 2px 12px rgba(0,0,0,.08);
    border-radius: 2px;
    max-width: 460px;   /* mobile / tablet default */
    width: 100%;
  }
  @media (min-width: 1024px) {
    .wbt-card { max-width: 575px; }  /* desktop: 25% wider than mobile */
  }

  .wbt-a1 { animation: wbt-fadeInUp .75s ease both .10s; }
  .wbt-a2 { animation: wbt-fadeInUp .75s ease both .30s; }
  .wbt-a3 { animation: wbt-fadeInUp .75s ease both .50s; }
  .wbt-a4 { animation: wbt-fadeInUp .75s ease both .70s; }
  .wbt-a5 { animation: wbt-fadeInUp .75s ease both .90s; }
  .wbt-a6 { animation: wbt-fadeInUp .75s ease both 1.10s; }
  .wbt-a7 { animation: wbt-fadeInUp .75s ease both 1.30s; }
  .wbt-a8 { animation: wbt-fadeInUp .75s ease both 1.55s; }

  .wbt-heart   { animation: wbt-heartbeat 2.8s ease-in-out infinite 1.2s; display: inline-block; }
  .wbt-shimmer { animation: wbt-shimmer 4s ease-in-out infinite .6s; }
  .wbt-rule    { animation: wbt-expandLine .9s ease both; transform-origin: center; }
  .wbt-rule-1  { animation-delay: .40s; }
  .wbt-rule-2  { animation-delay: .80s; }
  .wbt-rule-3  { animation-delay: 1.20s; }
`

// ── Icons ─────────────────────────────────────────────────────────────────
function HeartIcon() {
  return (
    <svg width="22" height="20" viewBox="0 0 32 29" aria-hidden="true">
      <defs>
        <linearGradient id="wbt-hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2c15c" />
          <stop offset="1" stopColor="#a67d21" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.5S1.8 19 1.8 9.6A6.6 6.6 0 0 1 16 5.8 6.6 6.6 0 0 1 30.2 9.6C30.2 19 16 28.5 16 28.5z"
        fill="url(#wbt-hg)"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN_ICO}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN_ICO}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  )
}

// ── Gold rule ─────────────────────────────────────────────────────────────
function GoldRule({ className = '' }) {
  return (
    <div
      className={className}
      style={{
        width: '72%', height: '1px', background: GOLD,
        margin: '13px 0', transformOrigin: 'center',
      }}
    />
  )
}

// ── Detail row ────────────────────────────────────────────────────────────
function DetailRow({ icon, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '9px',
      fontStyle: 'italic', fontWeight: 600,
      fontSize: 'clamp(15px,3.3vw,19px)', color: BLUE, textAlign: 'left',
    }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span>{children}</span>
    </div>
  )
}

// ── Static UI strings ─────────────────────────────────────────────────────
const UI = {
  es: {
    invitedBy: 'Tienen el honor de invitarlo a celebrar\nsu unión en matrimonio.',
    presence:  'Será un honor que sea parte de este momento\nimportante para nosotros.',
    reserved:  (n) => `Le hemos reservado ${n} ${n === 1 ? 'espacio' : 'espacios'}.`,
    rsvp:      'Por favor confirme su asistencia.',
    adultOnly: 'Para mantener un ambiente íntimo y elegante, respetuosamente este evento será solo para adultos.',
    giftMsg:   'Agradecemos que las muestras de cariño sean gentilmente entregadas en sobre.',
    closing:   'Esperamos contar con su presencia para celebrar este gran día.',
  },
  en: {
    invitedBy: 'and we have the honour of inviting you\nto celebrate our wedding.',
    presence:  "We would love to have you join us\nand share this very special moment.",
    reserved:  (n) => `We have reserved ${n} ${n === 1 ? 'seat' : 'seats'} for you.`,
    rsvp:      'Please confirm your attendance.',
    adultOnly: 'To maintain an intimate and elegant atmosphere, this event is respectfully adults-only.',
    giftMsg:   'We kindly ask that any gifts be presented in an envelope.',
    closing:   'We hope to count on your presence to celebrate this great day.',
  },
}

// ── Main component ────────────────────────────────────────────────────────
export default function WeddingBodaTemplate({ event, guest, tokenMap = {}, lang = 'es' }) {
  const ui = UI[lang] ?? UI.es

  // Resolve values — tokenMap takes precedence over event/guest props
  const eventName = tokenMap.eventName     ?? event?.name     ?? ''
  const eventDate = tokenMap.eventDate     ?? event?.date     ?? ''
  const eventTime = tokenMap.eventTime     ?? event?.time     ?? ''
  const location  = tokenMap.eventLocation ?? event?.location ?? ''
  const guestName = tokenMap.guestName     ?? guest?.name     ?? ''
  const rawSeats  = tokenMap.guestSeats    ?? String(guest?.seats ?? '')
  const seats     = parseInt(rawSeats, 10) || 0

  // Split "Alfredo & Lourdes" → name1="Alfredo", name2="Lourdes"
  const [name1, name2] = eventName.includes(' & ')
    ? eventName.split(' & ', 2).map((n) => n.trim())
    : [eventName, '']

  // Custom event texts — fall back to lang defaults
  const invitedBy = tokenMap.invitedBy       ?? ui.invitedBy
  const presence  = tokenMap.presenceText    ?? ui.presence
  const adultOnly = tokenMap.adultOnlyText   ?? ui.adultOnly
  const giftMsg   = tokenMap.giftSuggestions ?? ui.giftMsg
  const closing   = tokenMap.closingMessage  ?? ui.closing
  // Tagline only shown if explicitly set (e.g. "¡Nos casamos!")
  const tagline   = tokenMap.eventSubtitle   ?? null

  const notes = [adultOnly, giftMsg, closing].filter(Boolean)

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif" }}>
      <style>{STYLES}</style>

      {/* ── Page wrapper ─────────────────────────────────────────────────── */}
      <div style={{
        minHeight: '100svh',
        background: 'linear-gradient(160deg,#e8e3d6 0%,#dbd6c8 100%)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px 14px 130px',
      }}>

        {/* ── Card ─────────────────────────────────────────────────────────
             fondo-boda.png is the background:
               • Double gold frame lines
               • Green rose + white jasmine (top-left)
               • Blue + cream roses + blue forget-me-nots (bottom-right)
               • Gold sparkle clusters (right-middle and bottom-left)
             background-size: 100% 100% stretches the image to exactly fill the
             card so the corner flowers and frame always align correctly.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          className="wbt-card"
          style={{
            position: 'relative',
            background: CREAM,
            backgroundImage: `url(${fondoBoda})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
          }}
        >

          {/* ── Text content ──────────────────────────────────────────────
               Padding is calibrated so text sits inside the gold frame and
               does not obscure the corner flower clusters. The flowers in the
               background image sit behind all text (z-index: auto < 1).
          ────────────────────────────────────────────────────────────────── */}
          <div style={{
            position: 'relative', zIndex: 1,
            padding: [
              'clamp(280px,63vw,335px)',   // top    — title below green rose cluster
              'clamp(36px,9vw,52px)',      // right  — inside right frame
              'clamp(180px,39vw,225px)',   // bottom — enough room so last text clears roses + sticky bar
              'clamp(36px,9vw,52px)',      // left   — inside left frame
            ].join(' '),
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center',
            color: BLUE,
          }}>

            {/* ── Couple names ─────────────────────────────────────────── */}
            <div
              className="wbt-a1 wbt-shimmer"
              style={{
                fontFamily: "'Imperial Script', cursive",
                fontSize: 'clamp(42px,11.5vw,74px)',
                lineHeight: 1.05, letterSpacing: '0.01em',
                marginTop: '4px', wordBreak: 'break-word',
              }}
            >
              {name2 ? (
                <>
                  <span style={{ color: BLUE }}>{name1}</span>
                  <span style={{ color: GOLD }}> &amp; </span>
                  <span style={{ color: NAME2_COL }}>{name2}</span>
                </>
              ) : (
                <span style={{ color: BLUE }}>{name1 || 'Nombre & Apellido'}</span>
              )}
            </div>

            {/* ── Heart row ────────────────────────────────────────────── */}
            <div className="wbt-a2" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '14px', width: '74%', margin: '8px 0 4px',
            }}>
              <div className="wbt-rule wbt-rule-1"
                style={{ flex: 1, height: '1px', background: GOLD, transformOrigin: 'right' }} />
              <span className="wbt-heart"><HeartIcon /></span>
              <div className="wbt-rule wbt-rule-1"
                style={{ flex: 1, height: '1px', background: GOLD, transformOrigin: 'left' }} />
            </div>

            {/* ── Optional tagline (e.g. "¡Nos casamos!") ──────────────── */}
            {tagline && (
              <div className="wbt-a2" style={{
                fontStyle: 'italic', fontWeight: 700,
                fontSize: 'clamp(20px,5vw,30px)', color: BLUE, marginTop: '4px',
              }}>
                {tagline}
              </div>
            )}

            {/* ── Invite text ──────────────────────────────────────────── */}
            <div className="wbt-a3" style={{
              fontStyle: 'italic', fontWeight: 500,
              fontSize: 'clamp(15px,3.3vw,19px)', color: BLUE,
              marginTop: '8px', lineHeight: 1.6, whiteSpace: 'pre-line',
            }}>
              {invitedBy}
            </div>

            {/* ── Guest name ────────────────────────────────────────────── */}
            {guestName && (
              <div className="wbt-a3" style={{
                fontFamily: "'Imperial Script', cursive",
                fontSize: 'clamp(34px,9vw,54px)',
                color: BLUE, lineHeight: 1.1, margin: '18px 0 2px',
              }}>
                {guestName}
              </div>
            )}

            {/* ── Presence text ─────────────────────────────────────────── */}
            <div className="wbt-a4" style={{
              fontStyle: 'italic', fontWeight: 500,
              fontSize: 'clamp(15px,3.3vw,19px)', color: BLUE,
              marginTop: '10px', lineHeight: 1.65, whiteSpace: 'pre-line',
            }}>
              {presence}
            </div>

            {/* Rule 1 */}
            <GoldRule className="wbt-rule wbt-rule-2" />

            {/* ── Event details ─────────────────────────────────────────── */}
            <div className="wbt-a5" style={{
              display: 'flex', flexDirection: 'column',
              gap: '11px', alignItems: 'flex-start', margin: '2px 0',
            }}>
              {eventDate && <DetailRow icon={<CalendarIcon />}>{eventDate}</DetailRow>}
              {location  && <DetailRow icon={<LocationIcon />}>{location}</DetailRow>}
              {eventTime && <DetailRow icon={<ClockIcon />}>{eventTime}</DetailRow>}
            </div>

            {/* Rule 2 */}
            <GoldRule className="wbt-rule wbt-rule-2" />

            {/* ── Reserved seats ────────────────────────────────────────── */}
            {seats > 0 && (
              <div className="wbt-a6" style={{
                fontStyle: 'italic', fontWeight: 700,
                fontSize: 'clamp(19px,4.2vw,26px)', color: BLUE, marginTop: '2px',
              }}>
                {ui.reserved(seats)}
              </div>
            )}

            {/* Rule 3 */}
            <GoldRule className="wbt-rule wbt-rule-3" />

            {/* ── Notes paragraphs ─────────────────────────────────────── */}
            {notes.length > 0 && (
              <div className="wbt-a7" style={{ display: 'flex', flexDirection: 'column' }}>
                {notes.map((text, i) => (
                  <p key={i} style={{
                    fontStyle: 'italic', fontWeight: 500,
                    fontSize: 'clamp(15px,3.3vw,19px)',
                    lineHeight: 1.55, color: BLUE, marginTop: '8px',
                  }}>
                    {text}
                  </p>
                ))}
              </div>
            )}

            {/* ── RSVP prompt ───────────────────────────────────────────── */}
            <div className="wbt-a8" style={{
              fontStyle: 'italic', fontWeight: 700,
              fontSize: 'clamp(15px,3.3vw,19px)', color: GREEN_ICO, marginTop: '16px',
            }}>
              {ui.rsvp}
            </div>

          </div>{/* /content */}
        </div>{/* /card */}
      </div>{/* /page wrapper */}
    </div>
  )
}
