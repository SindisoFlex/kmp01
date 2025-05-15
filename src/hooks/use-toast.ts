
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import {
  useToast as useShadcnToast
} from "@/components/ui/use-toast"

type ToastOptions = ToastProps & {
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
}

export const useToast = () => {
  const { toast } = useShadcnToast()

  return { toast }
}

export const toast = (props: ToastOptions) => {
  const { toast } = useShadcnToast()
  return toast(props)
}
