/**
 * InvitationRenderer — renders a template HTML+CSS with token replacement.
 *
 * Props:
 *   templateHtml  — raw HTML string with {token} placeholders
 *   templateCss   — scoped CSS string
 *   tokenMap      — { tokenKey: value } map for replacement
 *   className     — optional wrapper class
 */
import { useMemo } from 'react'
import { replaceTokens } from '../../utils/replaceTokens'

export default function InvitationRenderer({ templateHtml, templateCss, tokenMap, className = '' }) {
  const rendered = useMemo(
    () => replaceTokens(templateHtml ?? '', tokenMap ?? {}),
    [templateHtml, tokenMap]
  )

  return (
    <div className={`inv-renderer relative overflow-hidden ${className}`}>
      {templateCss && (
        <style>{templateCss}</style>
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: rendered }} />
    </div>
  )
}
