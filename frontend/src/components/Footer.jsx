/**
 * Site-wide footer with copyright notice.
 */
export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} EventInvite App. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
