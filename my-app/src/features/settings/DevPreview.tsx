import { useLanguageStore } from '@/lib/i18n/languageStore'
import { FIXTURES, useDevPreviewStore } from '@/lib/dev/devPreviewStore'
import { useConnectivityStore } from '@/lib/offline/connectivity'

export function DevPreview() {
  const fixture = useDevPreviewStore((s) => s.fixture)
  const setFixture = useDevPreviewStore((s) => s.setFixture)
  const setOnline = useConnectivityStore((s) => s.setOnline)
  const online = useConnectivityStore((s) => s.online)
  const clearLanguage = useLanguageStore((s) => s.clearLanguage)

  if (!import.meta.env.DEV) return null

  return (
    <section className="mt-8" aria-labelledby="dev-preview-heading">
      <h2
        id="dev-preview-heading"
        className="mb-3 font-display text-lg font-bold text-ink"
      >
        Preview
      </h2>
      <div className="flex flex-col gap-3 rounded-[20px] border border-line bg-card p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-ink2">
            Forecast fixture
          </span>
          <select
            value={fixture}
            onChange={(e) => setFixture(e.target.value)}
            className="min-h-[var(--touch-min)] rounded-xl border border-line2 bg-bg px-3 text-sm font-semibold text-ink"
          >
            {FIXTURES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {fixture !== 'calm' && (
            <span className="text-xs font-semibold text-amber">
              Day picker demo needs fixture &quot;calm&quot; — other fixtures ignore the
              selected day.
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setOnline(!online)}
          className="min-h-[var(--touch-min)] rounded-xl border border-line2 bg-bg px-4 text-left text-sm font-semibold text-ink"
        >
          {online ? 'Go offline' : 'Go online'}
        </button>
        <button
          type="button"
          onClick={() => clearLanguage()}
          className="min-h-[var(--touch-min)] rounded-xl border border-line2 bg-bg px-4 text-left text-sm font-semibold text-ink"
        >
          Reset language gate
        </button>
      </div>
    </section>
  )
}
