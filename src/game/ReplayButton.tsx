interface Props { label: string; onReplay: () => void; }

export function ReplayButton({ label, onReplay }: Props) {
  return (
    <button type="button" className="replay-btn" aria-label={label} onClick={onReplay}>
      <span aria-hidden="true">🔊</span>
    </button>
  );
}
