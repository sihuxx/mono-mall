export default function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="py-20 text-center">
      <p className="text-sm text-neutral-400 mb-4">{message}</p>
      {actionLabel && (
        <button onClick={onAction} className="text-xs tracking-[0.2em] underline hover:text-black">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
