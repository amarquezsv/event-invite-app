import { useState } from 'react'
import { TOKENS, TOKEN_GROUPS } from '../../../utils/replaceTokens'

/**
 * TokenSelector — sidebar listing all available template tokens, grouped by category.
 *
 * Clicking a token calls `onInsert` with the formatted `{tokenKey}` string.
 * The parent TemplateBuilder splices it at the textarea's current cursor position.
 */
export default function TokenSelector({ onInsert }) {
  const [activeGroup, setActiveGroup] = useState(TOKEN_GROUPS[0])

  const filtered = TOKENS.filter((t) => t.group === activeGroup)

  return (
    <aside className="bg-white rounded-xl border border-slate-200 p-4 self-start">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
        Tokens
      </h2>
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        Click a token to insert it at the cursor in the HTML editor.
      </p>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {TOKEN_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g)}
            className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
              activeGroup === g
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <ul className="space-y-1.5">
        {filtered.map(({ key, label, description }) => (
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
