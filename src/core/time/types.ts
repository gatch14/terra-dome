/** Shared timer types for the absolute-endTime timer system. */
export interface Timer {
  id: string
  endTime: number
  onComplete: () => void
}
