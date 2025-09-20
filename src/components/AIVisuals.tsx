import React, { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**********************
 * AI Beacon (Pulse Ring with Orbiting Dots)
 **********************/
export interface AIBeaconProps {
  active?: boolean
  position?: 'tl' | 'tr' | 'bl' | 'br' | 'none'
  className?: string
  label?: string
  onClick?: () => void
}

const cornerClasses: Record<NonNullable<AIBeaconProps['position']>, string> = {
  tl: 'fixed top-4 left-4',
  tr: 'fixed top-4 right-4',
  bl: 'fixed bottom-4 left-4',
  br: 'fixed bottom-4 right-4',
  none: ''
}

export const AIBeacon: React.FC<AIBeaconProps> = ({
  active = true,
  position = 'br',
  className = '',
  label = 'AI Active',
  onClick
}) => {
  const ringGlow = active ? 'shadow-[0_0_30px_rgba(0,200,255,0.35)]' : 'shadow-none'

  const orbs = useMemo(
    () => [
      { radius: 26, size: 5, duration: 6, delay: 0 },
      { radius: 20, size: 4, duration: 4.5, delay: 0.6 },
      { radius: 14, size: 3, duration: 3.5, delay: 1.1 }
    ],
    []
  )

  return (
    <div className={`${cornerClasses[position]} z-50 ${className}`}>
      <motion.button
        aria-label={label}
        className={`relative h-16 w-16 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.35),rgba(0,0,0,0)_60%)] border border-white/40 backdrop-blur-md ${ringGlow}`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        animate={active ? { boxShadow: ['0 0 10px rgba(0,200,255,0.2)', '0 0 30px rgba(0,200,255,0.45)', '0 0 10px rgba(0,200,255,0.2)'] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        onClick={onClick}
      >
        {/* Pulsing ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-cyan-300/70"
          animate={active ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Core glow */}
        <span className="absolute inset-2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,200,255,0.45),rgba(0,200,255,0.1)_60%,rgba(255,255,255,0)_75%)]" />

        {/* Orbiting dots */}
        {orbs.map((o, idx) => (
          <motion.span
            key={idx}
            className="absolute inset-0"
            style={{ transformOrigin: '50% 50%' }}
            animate={active ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: o.duration, ease: 'linear', repeat: Infinity, delay: o.delay }}
          >
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full bg-white"
              style={{ width: o.size, height: o.size, transform: `translateY(-${o.radius}px)`, boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}
            />
          </motion.span>
        ))}
      </motion.button>
    </div>
  )
}

/**********************
 * Brainwave Overlay (Neural/Brainwave Lines)
 **********************/
export interface BrainwaveOverlayProps {
  active?: boolean
  intensity?: number // 0..1 controls opacity/blur
  className?: string
  variant?: 'lines' | 'net'
}

export const BrainwaveOverlay: React.FC<BrainwaveOverlayProps> = ({
  active = false,
  intensity = 0.7,
  className = '',
  variant = 'lines'
}) => {
  const alpha = Math.max(0, Math.min(1, intensity))
  const baseOpacity = 0.08 + alpha * 0.12
  const blurPx = 10 + alpha * 10

  const lines = useMemo(() => [
    { top: '20%', speed: 18, hue: 190 },
    { top: '40%', speed: 22, hue: 165 },
    { top: '60%', speed: 26, hue: 205 },
    { top: '80%', speed: 30, hue: 180 }
  ], [])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={`pointer-events-none absolute inset-0 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: baseOpacity + 0.05 }}
          exit={{ opacity: 0 }}
          style={{ mixBlendMode: 'screen' }}
        >
          {variant === 'lines' && (
            <>
              {lines.map((l, i) => (
                <motion.div
                  key={i}
                  className="absolute left-[-30%] w-[160%] h-14 rounded-full"
                  style={{
                    top: l.top,
                    filter: `blur(${blurPx}px)`,
                    background: `linear-gradient(90deg, hsla(${l.hue},80%,70%,0) 0%, hsla(${l.hue},90%,70%,0.45) 50%, hsla(${l.hue},80%,70%,0) 100%)`
                  }}
                  animate={{ x: ['-5%', '5%', '-5%'] }}
                  transition={{ duration: l.speed, ease: 'easeInOut', repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
            </>
          )}

          {variant === 'net' && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(25% 25% at 20% 30%, rgba(0,200,255,0.15), rgba(0,0,0,0) 70%),\
                   radial-gradient(20% 20% at 70% 60%, rgba(0,255,180,0.14), rgba(0,0,0,0) 70%),\
                   radial-gradient(18% 18% at 40% 80%, rgba(0,180,255,0.12), rgba(0,0,0,0) 70%)',
                filter: `blur(${blurPx}px)`
              }}
              animate={{
                backgroundPosition: ['0px 0px, 0px 0px, 0px 0px', '20px -10px, -15px 15px, 10px -20px', '0px 0px, 0px 0px, 0px 0px']
              }}
              transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**********************
 * Smart Alert Bubble (Ripple-in with Mini Chart)
 **********************/
export interface SmartAlertBubbleProps {
  title: string
  message?: string
  severity?: number // 0..1
  data?: number[]
  onClose?: () => void
  className?: string
}

export const SmartAlertBubble: React.FC<SmartAlertBubbleProps> = ({
  title,
  message,
  severity = 0.5,
  data,
  onClose,
  className = ''
}) => {
  const sev = Math.max(0, Math.min(1, severity))
  const hue = 120 - Math.round(sev * 120) // green->red
  const bars = data && data.length ? data : useMemo(() => Array.from({ length: 7 }, () => Math.random()), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`relative glass-card p-3 pr-10 ${className}`}
      style={{ overflow: 'hidden' }}
    >
      {/* Ripple entry */}
      <motion.span
        className="absolute left-0 top-0 h-full w-full"
        initial={{ scale: 0, opacity: 0.3 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          background: `radial-gradient(circle at 10% 20%, hsla(${hue},80%,60%,0.25), rgba(255,255,255,0) 60%)`
        }}
      />

      <div className="flex items-start gap-3 relative">
        <div className="mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shadow" style={{ background: `linear-gradient(135deg, hsla(${hue},80%,55%,0.85), hsla(${hue},80%,55%,0.5))` }}>
          <span className="text-white text-sm">⚠️</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-primary-navy leading-tight">{title}</div>
          {message && <div className="text-xs text-gray-600 mt-0.5">{message}</div>}
          {/* Mini chart */}
          <div className="mt-2 flex items-end gap-1 h-10">
            {bars.map((v, i) => (
              <motion.span
                key={i}
                className="w-2 rounded-sm"
                style={{ background: `linear-gradient(180deg, hsla(${hue},85%,60%,0.9), hsla(${hue},85%,60%,0.4))` }}
                initial={{ height: 4 + v * 20 }}
                animate={{ height: 10 + v * 28 }}
                transition={{ duration: 0.8, delay: i * 0.05, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute right-2 top-2 text-gray-500 hover:text-gray-700">✕</button>
        )}
      </div>
    </motion.div>
  )
}

/**********************
 * Voice Mic Glow (Animated Sound Waves)
 **********************/
export interface VoiceMicGlowProps {
  listening: boolean
  level?: number // 0..1 amplitude
  onClick?: () => void
  className?: string
  label?: string
}

export const VoiceMicGlow: React.FC<VoiceMicGlowProps> = ({
  listening,
  level = 0.5,
  onClick,
  className = '',
  label = 'Voice Assistant'
}) => {
  const amp = Math.max(0.2, Math.min(1, level))
  const rings = [0, 0.6, 1.2]
  return (
    <div className={`relative ${className}`}>
      <button
        aria-label={label}
        onClick={onClick}
        className="relative h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500/80 to-emerald-400/80 text-white shadow-lg border border-white/30 backdrop-blur"
      >
        <span className="relative z-10">🎤</span>
        {/* Inner core glow */}
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),rgba(255,255,255,0)_70%)]" />
      </button>

      {/* Emitting rings when listening */}
      <AnimatePresence>
        {listening && rings.map((r, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/60"
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 + amp * 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 + amp * 0.6, repeat: Infinity, delay: r, ease: 'easeOut' }}
            style={{ width: 56, height: 56, boxShadow: '0 0 30px rgba(0,200,255,0.25)' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**********************
 * Fish Shoal (Swarm Intelligence)
 **********************/
export interface FishShoalProps {
  alertActive?: boolean
  count?: number
  className?: string
}

export const FishShoal: React.FC<FishShoalProps> = ({ alertActive = false, count = 8, className = '' }) => {
  const fish = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    delay: (i % 4) * 0.3,
    amp: 4 + (i % 3) * 2,
    speed: 2 + (i % 5) * 0.4
  })), [count])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="relative h-12 w-full">
        {fish.map((f) => (
          <motion.span
            key={f.id}
            className="absolute text-xl select-none"
            style={{ left: `${(f.id / count) * 90 + 2}%`, top: `${20 + (f.id % 4) * 15}%`, transformOrigin: 'center' }}
            animate={{
              x: alertActive ? [0, -12, 0] : [0, 12, 0],
              y: [0, -f.amp, 0, f.amp, 0],
              rotateY: alertActive ? 180 : 0
            }}
            transition={{ duration: 3.5 / f.speed, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
          >
            🐟
          </motion.span>
        ))}
      </div>
    </div>
  )
}
