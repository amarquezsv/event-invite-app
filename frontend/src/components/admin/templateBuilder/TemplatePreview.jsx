import { useMemo } from 'react'
import { replaceTokens, SAMPLE_DATA } from '../../../utils/replaceTokens'

/**
 * TemplatePreview — renders the template HTML + CSS inside a sandboxed
 * `<iframe>` so the template's custom styles cannot bleed into the admin UI.
 *
 * Tokens are substituted with SAMPLE_DATA values for the preview; the raw
 * template (with tokens intact) is what actually gets saved to Cosmos DB.
 *
 * @param {{ html: string, css: string }} props
 */
export default function TemplatePreview({ html, css }) {
  // Build the complete HTML document injected into the iframe.
  // Recomputed only when html or css changes.
  const srcDoc = useMemo(() => {
    const processedHtml = replaceTokens(html, SAMPLE_DATA)
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    /* Base reset for consistent preview rendering */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f8fafc; padding: 1.5rem; }
    /* Injected template styles */
    ${css ?? ''}
  </style>
</head>
<body>${processedHtml}</body>
</html>`
  }, [html, css])

  if (!html?.trim()) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
        <p className="text-sm text-slate-400">Add HTML content above to see the live preview</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Fake browser chrome */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="ml-2 text-xs text-slate-400 font-mono">
          preview · sample data
        </span>
      </div>

      {/* Sandboxed preview — allow-same-origin so CSS works; scripts blocked */}
      <iframe
        srcDoc={srcDoc}
        title="Template Preview"
        sandbox="allow-same-origin"
        className="w-full bg-white"
        style={{ height: '480px', border: 'none' }}
      />
    </div>
  )
}
