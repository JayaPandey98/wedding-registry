import { Link } from 'react-router-dom'

export default function NotFound({ message }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-3xl">We couldn’t find that page</h1>
      <p className="text-sm text-muted">{message || 'The link may be mistyped. Ask the couple to resend their invite.'}</p>
      <Link to="/" className="btn btn-primary">Go to the home page</Link>
    </div>
  )
}
