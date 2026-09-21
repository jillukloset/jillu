const LABELS: Record<string, string> = {
  NEW_WITH_TAGS: 'New with tags',
  NEW_WITHOUT_TAGS: 'New without tags',
  LIKE_NEW: 'Like new',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  VISIBLE_WEAR: 'Visible wear',
};

export function conditionLabel(condition: string) {
  return LABELS[condition] ?? condition;
}

export function ConditionBadge({ condition, className }: { condition: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink ${className ?? ''}`}
    >
      {conditionLabel(condition)}
    </span>
  );
}
