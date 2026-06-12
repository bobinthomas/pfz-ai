import { ShieldAlert } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import {
  bestReachable,
  confidenceLabelKey,
  displayConfidenceForZone,
  isReachable,
  presenceColor,
  type Boat,
  type Coast,
  type StalenessLevel,
  type Zone,
} from '@/domain'
import { isSafetyBlocked } from '@/domain/safety'
import type { Weather } from '@/domain/types'
import { MAP_HARBOUR, MAP_SCALE, zoneToMapXY } from '@/lib/utils/mapCoords'
import { buildZoneLetterMap } from '@/lib/utils/zoneLetters'
import { tierColor } from '@/lib/utils/tier'
import { tierPillLabel } from './tierLabels'

interface CourseMapProps {
  coast: Coast
  zones: Zone[]
  boat: Boat
  weather: Weather
  dataStaleness?: StalenessLevel
  size?: 'compact' | 'full'
}

const CX = MAP_HARBOUR.x
const CY = MAP_HARBOUR.y

function MapPresenceIndicator({
  x,
  y,
  markerR,
  zone,
  full,
  label,
}: {
  x: number
  y: number
  markerR: number
  zone: Zone
  full: boolean
  label: string
}) {
  const presence = zone.presence
  if (presence?.boatCount == null || presence.bucket === 'unknown') return null

  const color = presenceColor(presence.bucket)
  const countText = `~${presence.boatCount}`
  const fontSize = full ? 11 : 9
  const badgeH = full ? 18 : 16
  const badgeW = 10 + countText.length * (full ? 7 : 6)
  const badgeY = y + markerR + (full ? 11 : 9)

  return (
    <g aria-hidden>
      <title>{label}</title>
      <rect
        x={x - badgeW / 2}
        y={badgeY - badgeH / 2}
        width={badgeW}
        height={badgeH}
        rx={badgeH / 2}
        fill="var(--card)"
        stroke={color}
        strokeWidth="1.5"
        opacity={0.97}
      />
      <text
        x={x}
        y={badgeY + (full ? 4 : 3)}
        fontSize={fontSize}
        fontWeight="700"
        fill={color}
        textAnchor="middle"
        fontFamily="var(--font-body)"
      >
        {countText}
      </text>
    </g>
  )
}

export function CourseMap({
  coast,
  zones,
  boat,
  weather,
  dataStaleness = 'fresh',
  size = 'compact',
}: CourseMapProps) {
  const { t } = useTranslation(['today', 'confidence'])
  const gradientId = useId().replace(/:/g, '')
  const blocked = isSafetyBlocked(weather)
  const best = bestReachable(zones, boat)
  const letters = buildZoneLetterMap(zones, boat)
  const okZones = zones.filter((z) => z.dataStatus === 'ok')
  const harbour = coast.name.split(',')[0]
  const full = size === 'full'

  const bestConfidence = best
    ? (() => {
        const level = displayConfidenceForZone(best, dataStaleness)
        return level
          ? t(`confidence:${confidenceLabelKey(level)}`)
          : t('howSure')
      })()
    : ''

  const bestBoats =
    best?.presence?.boatCount != null
      ? t('presenceCount', { count: best.presence.boatCount })
      : null

  const ariaLabel = best
    ? bestBoats
      ? t('mapAriaWithBoats', {
          name: best.name,
          km: best.distanceKm,
          bearing: best.bearing,
          tier: tierPillLabel(best.catch?.tier ?? 'nodata', (k) => t(k)),
          confidence: bestConfidence,
          boats: bestBoats,
        })
      : t('mapAria', {
          name: best.name,
          km: best.distanceKm,
          bearing: best.bearing,
          tier: tierPillLabel(best.catch?.tier ?? 'nodata', (k) => t(k)),
          confidence: bestConfidence,
        })
    : t('zonesToday')

  const ringLabelSize = full ? 13 : 11
  const zoneMarkerR = full ? 14 : 11
  const bestMarkerR = full ? 24 : 20
  const bestLabelSize = full ? 15 : 13
  const bestLetterSize = full ? 19 : 17
  const rangeR = boat.rangeKm * MAP_SCALE

  return (
    <div
      className={`card relative rounded-[20px] border-[1.5px] border-line bg-card ${
        full ? 'flex min-h-[min(72vh,640px)] flex-1 flex-col p-3 sm:p-4' : 'p-2.5'
      }`}
    >
      <svg
        viewBox="0 0 560 340"
        className={`block w-full ${full ? 'min-h-0 flex-1' : 'max-h-[min(42vw,280px)]'}`}
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--map-sea-top)" />
            <stop offset="100%" stopColor="var(--map-sea-bottom)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="560" height="340" rx="14" fill={`url(#${gradientId})`} />
        <path d="M0,280 Q140,262 280,280 T560,280 L560,340 L0,340 Z" fill="var(--map-shore)" />
        <path
          d="M0,280 Q140,262 280,280 T560,280"
          fill="none"
          stroke="var(--map-shore-line)"
          strokeWidth="2"
        />

        {[60, 130, 200].map((r) => (
          <g key={r} aria-hidden>
            <circle
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="var(--map-ring)"
              strokeDasharray="2 5"
              strokeWidth={full ? 2.5 : 2}
            />
            <text
              x={CX + 5}
              y={CY - r + (full ? 16 : 14)}
              fontSize={ringLabelSize}
              fill="var(--teal)"
              fontWeight="700"
              fontFamily="var(--font-body)"
            >
              {Math.round(r / MAP_SCALE)} km
            </text>
          </g>
        ))}

        <circle
          cx={CX}
          cy={CY}
          r={rangeR}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={full ? 2.5 : 2}
          strokeDasharray="8 6"
          opacity={0.55}
          aria-hidden
        />
        <text
          x={CX}
          y={CY - rangeR - 6}
          fontSize={ringLabelSize}
          fill="var(--teal)"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="var(--font-body)"
        >
          {t('rangeRing', { km: boat.rangeKm })}
        </text>

        <g transform="translate(56,48)" aria-hidden>
          <circle r={full ? 26 : 23} fill="rgba(255,255,255,0.8)" stroke="var(--map-shore-line)" />
          <text
            y={full ? -11 : -9}
            fontSize={full ? 14 : 12}
            fontWeight="700"
            fill="var(--ink)"
            textAnchor="middle"
          >
            N
          </text>
          <line
            x1="0"
            y1={full ? -22 : -18}
            x2="0"
            y2={full ? -4 : -3}
            stroke="var(--stop)"
            strokeWidth="2"
          />
        </g>

        {okZones
          .filter((z) => z.id !== best?.id)
          .map((z) => {
            const p = zoneToMapXY(z.distanceKm, z.bearing)
            const reachable = isReachable(z, boat)
            const tier = z.catch?.tier ?? 'nodata'
            const letter = letters.get(z.id) ?? '?'
            return (
              <g key={z.id} opacity={reachable ? 0.85 : 0.38} aria-hidden>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={zoneMarkerR}
                  fill={reachable ? tierColor(tier) : 'var(--ink2)'}
                  opacity={reachable ? 0.65 : 0.45}
                  stroke="var(--card)"
                  strokeWidth="1.5"
                />
                <text
                  x={p.x}
                  y={p.y + (full ? 5 : 4)}
                  fontSize={full ? 13 : 11}
                  fontWeight="800"
                  fill="var(--card)"
                  textAnchor="middle"
                  fontFamily="var(--font-display)"
                >
                  {letter}
                </text>
                <MapPresenceIndicator
                  x={p.x}
                  y={p.y}
                  markerR={zoneMarkerR}
                  zone={z}
                  full={full}
                  label={
                    z.presence?.boatCount != null
                      ? t('presenceCount', { count: z.presence.boatCount })
                      : t('presenceUnknown')
                  }
                />
              </g>
            )
          })}

        {best && (() => {
          const p = zoneToMapXY(best.distanceKm, best.bearing)
          const tier = best.catch?.tier ?? 'good'
          const letter = letters.get(best.id) ?? 'A'
          const midX = (CX + p.x) / 2
          const midY = (CY + p.y) / 2
          return (
            <g aria-hidden>
              <line
                x1={CX}
                y1={CY}
                x2={p.x}
                y2={p.y}
                stroke={tierColor(tier)}
                strokeWidth={full ? 5 : 4}
                strokeLinecap="round"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={bestMarkerR}
                fill={tierColor(tier)}
                stroke="var(--card)"
                strokeWidth="3"
              />
              <text
                x={p.x}
                y={p.y + (full ? 7 : 6)}
                fontSize={bestLetterSize}
                fontWeight="800"
                fill="var(--card)"
                textAnchor="middle"
                fontFamily="var(--font-display)"
              >
                {letter}
              </text>
              <MapPresenceIndicator
                x={p.x}
                y={p.y}
                markerR={bestMarkerR}
                zone={best}
                full={full}
                label={
                  best.presence?.boatCount != null
                    ? t('presenceCount', { count: best.presence.boatCount })
                    : t('presenceUnknown')
                }
              />
              <g transform={`translate(${midX},${midY})`}>
                <rect
                  x={full ? -58 : -50}
                  y={full ? -17 : -15}
                  width={full ? 116 : 100}
                  height={full ? 34 : 30}
                  rx="15"
                  fill="var(--navy)"
                />
                <text
                  fontSize={bestLabelSize}
                  fontWeight="700"
                  fill="var(--card)"
                  textAnchor="middle"
                  y="5"
                  fontFamily="var(--font-body)"
                >
                  {best.distanceKm} km · {best.bearing}
                </text>
              </g>
            </g>
          )
        })()}

        <g transform={`translate(${CX},${CY})`} aria-hidden>
          <circle r={full ? 12 : 10} fill="var(--navy)" stroke="var(--card)" strokeWidth="2.5" />
          <text
            y={full ? 28 : 25}
            fontSize={full ? 14 : 13}
            fontWeight="700"
            fill="var(--navy)"
            textAnchor="middle"
            fontFamily="var(--font-body)"
          >
            {harbour}
          </text>
        </g>
      </svg>

      {blocked && (
        <div
          className="absolute inset-2.5 grid place-items-center rounded-[15px] border-[1.5px] border-stop bg-[rgba(187,57,44,0.12)] p-6 text-center"
          role="alert"
        >
          <ShieldAlert className="mx-auto text-stop" size={34} aria-hidden />
          <p className="mt-2 font-display text-lg font-bold text-stop">{t('mapOverlay')}</p>
        </div>
      )}
    </div>
  )
}
