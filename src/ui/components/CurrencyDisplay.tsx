interface CurrencyDisplayProps {
  currency: number
}

export function CurrencyDisplay({ currency }: CurrencyDisplayProps) {
  return (
    <div class="currency-display" role="status" aria-live="polite">
      <span class="currency-icon">💎</span>
      <span class="currency-amount">{currency.toLocaleString()}</span>
    </div>
  )
}
