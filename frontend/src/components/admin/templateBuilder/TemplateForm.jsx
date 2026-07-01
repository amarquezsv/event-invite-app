/**
 * TemplateForm — template name input + action buttons row.
 *
 * Displayed at the top of the Template Builder page. When editing an
 * existing template `isEditing` is true, which swaps the save button label
 * to "Update Template" and shows a "+ New" button to reset the editor.
 *
 * @param {{
 *   name:         string,
 *   isEditing:    boolean,
 *   isSaving:     boolean,
 *   onNameChange: (value: string) => void,
 *   onSave:       () => void,
 *   onNew:        () => void,
 * }} props
 */
export default function TemplateForm({
  name,
  isEditing,
  isSaving,
  onNameChange,
  onSave,
  onNew,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
      {/* Name input */}
      <div className="flex-1">
        <label
          htmlFor="tpl-name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Template Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="tpl-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder='e.g. "Elegant Gold" or "Modern Dark"'
          maxLength={120}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 shrink-0">
        {/* New button — only visible when editing an existing template */}
        {isEditing && (
          <button
            type="button"
            onClick={onNew}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            + New
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-5 py-2 text-sm rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors min-w-[9rem] text-center"
        >
          {isSaving
            ? 'Saving…'
            : isEditing
            ? 'Update Template'
            : 'Save Template'}
        </button>
      </div>
    </div>
  )
}
