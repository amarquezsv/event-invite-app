/**
 * StatCard — a simple metric tile used on the admin dashboard.
 *
 * Props:
 *   label  {string}  — metric label
 *   value  {string|number}  — displayed value
 *   color  {'violet'|'green'|'amber'|'blue'}  — accent colour scheme
 */
export default function StatCard({ label, value, color = 'violet' }) {
  const styles = {
    violet: 'bg-violet-50  border-violet-200 text-violet-700',
    green:  'bg-green-50   border-green-200  text-green-700',
    amber:  'bg-amber-50   border-amber-200  text-amber-700',
    blue:   'bg-blue-50    border-blue-200   text-blue-700',
  }

  return (
    <div className={`rounded-2xl border p-5 ${styles[color] ?? styles.violet}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
