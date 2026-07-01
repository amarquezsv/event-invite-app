import { TOKENS } from '../../../utils/replaceTokens'

/**
 * TokenSelector — sidebar listing all available template tokens.
 *
 * Clicking a token calls `onInsert` with the formatted `{tokenKey}` string.
 * The parent TemplateBuilder splices it at the textarea's current cursor position.
 *
 * To add a new token, add it to src/utils/replaceTokens.js — no changes needed here.
 *
 * @param {{ onInsert: (token: string) => void }} props
 */
export default function TokenSelector({ onInsert }) {
  return (
    <aside className="bg-white rounded-xl border border-slate-200 p-4 self-start">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
        Tokens
      </h2>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Click a token to insert it at the cursor in the HTML editor.
      </p>

      <ul className="space-y-2">
        {TOKENS.map(({ key, label, description }) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => onInsert(`{${key}}`)}
              className="w-full text-left group rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors px-3 py-2"
              title={description}
            >
              <span className="block font-mono text-xs font-semibold text-violet-700 group-hover:text-violet-900 truncate">
                {`{${key}}`}
              </span>
              <span className="block text-xs text-slate-400 mt-0.5 leading-tight">
                {label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
