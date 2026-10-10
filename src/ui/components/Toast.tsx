import { signal } from '@preact/signals'

type ToastType = 'info' | 'success' | 'warning'

const toasts = signal<{ id: number; message: string; type: ToastType }[]>([])
let nextId = 0

export function showToast(message: string, type: ToastType = 'info') {
  const id = nextId++
  toasts.value = [...toasts.value, { id, message, type }]
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

export function ToastContainer() {
  return (
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.value.map(toast => (
        <div key={toast.id} class={`toast ${toast.type}`} role="alert">
          {toast.message}
        </div>
      ))}
    </div>
  )
}
