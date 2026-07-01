/**
 * TemplateEditor — side-by-side (stacked on mobile) textarea editors for
 * the template HTML and CSS.
 *
 * `htmlRef` is forwarded to the HTML textarea so the parent TemplateBuilder
 * can read `selectionStart` / `selectionEnd` when inserting tokens.
 *
 * @param {{
 *   html:     string,
 *   css:      string,
 *   htmlRef:  React.RefObject<HTMLTextAreaElement>,
 *   onChange: (field: 'html' | 'css', value: string) => void,
 * }} props
 */
export default function TemplateEditor({ html, css, htmlRef, onChange }) {
  const textareaClass =
    'w-full h-72 font-mono text-sm bg-slate-950 text-emerald-400 caret-white ' +
    'rounded-lg p-3 border border-slate-700 resize-y leading-relaxed ' +
    'focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-600'

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* ── HTML editor ────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">
          HTML{' '}
          <span className="text-xs font-normal text-slate-400">
            — use {`{token}`} placeholders
          </span>
        </label>
        <textarea
          ref={htmlRef}
          value={html}
          onChange={(e) => onChange('html', e.target.value)}
          placeholder={'<div class="invite">\n  <h1>{eventName}</h1>\n  <p>{eventDate}</p>\n</div>'}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className={textareaClass}
          aria-label="Template HTML"
        />
        <p className="text-xs text-slate-400">
          Tokens are replaced with real data at render time.
        </p>
      </div>

      {/* ── CSS editor ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">
          CSS{' '}
          <span className="text-xs font-normal text-slate-400">— optional, scoped to this template</span>
        </label>
        <textarea
          value={css}
          onChange={(e) => onChange('css', e.target.value)}
          placeholder={'.invite {\n  font-family: serif;\n  text-align: center;\n}'}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className={textareaClass}
          aria-label="Template CSS"
        />
        <p className="text-xs text-slate-400">
          Styles are injected into a sandboxed iframe — they won't affect the admin UI.
        </p>
      </div>
    </div>
  )
}
