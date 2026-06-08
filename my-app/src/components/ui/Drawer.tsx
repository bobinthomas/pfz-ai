import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  icon?: ReactNode
  children: ReactNode
}

export function Drawer({ open, onClose, title, icon, children }: DrawerProps) {
  const { t } = useTranslation('common')
  const prevFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement as HTMLElement | null
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(10,24,40,0.4)]" />
        <Dialog.Content
          className="fixed z-50 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-line bg-bg shadow-xl outline-none focus:outline-none
            bottom-0 left-0 right-0 mx-auto max-w-[760px]
            min-[980px]:bottom-0 min-[980px]:left-auto min-[980px]:right-0 min-[980px]:top-0 min-[980px]:max-h-none min-[980px]:h-full min-[980px]:max-w-[480px] min-[980px]:rounded-l-[24px] min-[980px]:rounded-tr-none min-[980px]:rounded-br-none"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            prevFocus.current?.focus()
          }}
        >
          <div className="flex items-center gap-3 border-b border-line bg-card px-5 py-4">
            {icon}
            <Dialog.Title className="font-display text-lg font-bold text-ink">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="ml-auto flex h-[48px] w-[48px] items-center justify-center rounded-xl border border-line bg-soft text-ink hover:bg-soft2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                aria-label={t('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
