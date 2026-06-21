export default function ToolbarButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  )
}
