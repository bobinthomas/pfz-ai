import { Mic, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer } from '@/components/ui/Drawer'
import type { Forecast } from '@/domain/types'
import { useLanguageStore } from '@/lib/i18n/languageStore'
import { useSpeechRecognition } from '@/lib/voice/useSpeechRecognition'
import { buildReply } from './classifier'

interface Message {
  who: 'bot' | 'user'
  text: string
}

interface AssistantDrawerProps {
  open: boolean
  onClose: () => void
  forecast: Forecast
}

const CHIPS = ['chipBest', 'chipTuna', 'chipLastWeek', 'chipOutOfRange'] as const

const SPEECH_LANG: Record<string, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
}

export function AssistantDrawer({ open, onClose, forecast }: AssistantDrawerProps) {
  const { t } = useTranslation(['assistant', 'today'])
  const language = useLanguageStore((s) => s.language) ?? 'en'
  const greeting = t('assistant:greeting')
  const [msgs, setMsgs] = useState<Message[]>([{ who: 'bot', text: greeting }])
  const [input, setInput] = useState('')
  const logRef = useRef<HTMLDivElement>(null)

  const speechLang = SPEECH_LANG[language] ?? 'en-IN'
  const { listening, start, stop, available } = useSpeechRecognition(speechLang)

  function handleClose() {
    stop()
    setMsgs([{ who: 'bot', text: greeting }])
    setInput('')
    onClose()
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [msgs])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const reply = buildReply(trimmed, forecast, (k, opts) => t(k, opts ?? {}))
    setMsgs((m) => [...m, { who: 'user', text: trimmed }, { who: 'bot', text: reply }])
    setInput('')
  }

  function toggleMic() {
    if (listening) {
      stop()
      return
    }
    start((transcript) => send(transcript))
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={t('assistant:title')}
      icon={<Sparkles className="h-5 w-5 text-teal" />}
    >
      <div
        ref={logRef}
        className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto px-5 py-4 min-[980px]:max-h-none min-[980px]:flex-1"
        aria-live="polite"
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15.5px] leading-relaxed ${
              m.who === 'bot'
                ? 'self-start rounded-bl-[5px] border border-line bg-card'
                : 'self-end rounded-br-[5px] bg-teal font-medium text-white'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-5 pb-3">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => send(t(`assistant:${chip}`))}
            className="min-h-[var(--touch-min)] rounded-[var(--radius-pill)] border border-line2 bg-card px-4 text-sm font-semibold text-teal hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            {t(`assistant:${chip}`)}
          </button>
        ))}
      </div>
      <div className="flex gap-2.5 border-t border-line bg-card px-4 py-4">
        {available && (
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[15px] border bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
              listening
                ? 'border-stop text-stop'
                : 'border-line2 text-teal'
            }`}
            aria-label={listening ? t('assistant:stopListening') : t('assistant:startListening')}
            aria-pressed={listening}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder={`${t('today:ask')}…`}
          aria-label={t('assistant:inputLabel')}
          className="min-h-[54px] flex-1 rounded-[15px] border border-line2 bg-bg px-4 text-base text-ink outline-none focus:border-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        />
        <button
          type="button"
          onClick={() => send(input)}
          className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[15px] bg-teal text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          aria-label={t('assistant:send')}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </Drawer>
  )
}
