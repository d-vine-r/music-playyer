// lib/toasts.ts (toast helpers)
import { toast } from "sonner"

export const showErrorToast = (message: string) => {
  // Use built-in error variant to avoid JSX in a .ts file
  toast.error(message, { duration: 3000 })
}

export const showSuccessToast = (message: string) => {
  // Use built-in success variant
  toast.success(message, { duration: 2500 })
}
