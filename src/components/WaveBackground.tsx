import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface WaveBackgroundProps {
  children?: React.ReactNode
  className?: string
  variant?: 'video' | 'animated' | 'static'
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({ 
  children, 
  className = '',
  variant = 'animated'
}) => {
  // Keep previous variants intact
  if (variant === 'video') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Ocean_Waves_and_Birds_Video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary-navy/20" />
        {children && (
          <div className="relative z-10">
            {children}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'static') {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-navy via-primary-ocean to-primary-seafoam" />
        <div className="absolute inset-0 bg-wave-pattern opacity-10" />
        {children && (
          <div className="relative z-10">
            {children}
          </div>
        )}
      </div>
    )
  }

  // Animated + Ambient variant
  // Interactive values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const scrollY = useMotionValue(0)
  const time = useMotionValue(0)

  const lensX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const lensY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  // Tide shift mixes time of day and scroll
  const tide = useTransform([time, scrollY], (vals) => {
    const t = Number((vals as any[])[0] ?? 0)
    const s = Number((vals as any[])[1] ?? 0)
    const wave = Math.sin(t / 1200) * 8 // time-driven
    const scrollInfluence = ((s % 300) / 300) * 8 // scroll-driven
    return wave + scrollInfluence
  })

  // Depth blur increases with scroll and cursor distance from center
  const [viewport, setViewport] = useState({ w: 1, h: 1 })
  const depth = useTransform([mouseX, mouseY, scrollY], ([x, y, s]) => {
    const cx = viewport.w / 2
    const cy = viewport.h / 2
    const dx = Math.abs((x as number) - cx)
    const dy = Math.abs((y as number) - cy)
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy) / Math.max(cx, cy), 1)
    const scrollFactor = Math.min((s as number) / 1200, 1)
    return 2 + dist * 3 + scrollFactor * 3 // 2px to ~8px
  })

  // Floating particles configuration
  const particles = useMemo(() => (
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: 1 + Math.random() * 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 4
    }))
  ), [])

  // Aurora bands configuration
  const auroraBands = useMemo(() => (
    [
      { id: 'a1', hue: 190, opacity: 0.18, height: '35%', blur: 24, speed: 30 },
      { id: 'a2', hue: 160, opacity: 0.14, height: '30%', blur: 28, speed: 36 },
      { id: 'a3', hue: 210, opacity: 0.12, height: '25%', blur: 20, speed: 42 }
    ]
  ), [])

  // Edge ripple state
  const [ripples, setRipples] = useState<{ id: number, x: number, y: number }[]>([])
  const rippleId = useRef(0)
  const lastRippleTs = useRef(0)

  // Frame loop for time
  useAnimationFrame((t) => {
    time.set(t)
  })

  useEffect(() => {
    const onScroll = () => {
      scrollY.set(window.scrollY || window.pageYOffset || 0)
    }
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    onResize()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [scrollY])

  // Device tilt influences lens flare position (mobile/tablet)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gx = e.gamma ?? 0 // left-right tilt (-90 to 90)
      const gy = e.beta ?? 0 // front-back tilt (-180 to 180)
      const cx = viewport.w / 2
      const cy = viewport.h / 2
      const offsetX = cx + (gx / 45) * cx * 0.15
      const offsetY = cy + (gy / 45) * cy * 0.1
      mouseX.set(offsetX)
      mouseY.set(offsetY)
    }
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [mouseX, mouseY, viewport])

  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const mx = e.clientX - (rect?.left || 0)
    const my = e.clientY - (rect?.top || 0)
    mouseX.set(mx)
    mouseY.set(my)

    // Edge ripples near top/bottom/left/right edges
    const now = performance.now()
    const nearEdge =
      my < 60 ||
      (rect ? my > rect.height - 60 : false) ||
      mx < 60 ||
      (rect ? mx > rect.width - 60 : false)

    if (nearEdge && now - lastRippleTs.current > 250) {
      lastRippleTs.current = now
      setRipples((prev) => [...prev.slice(-6), { id: rippleId.current++, x: mx, y: my }])
    }
  }

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className={`relative overflow-hidden ${className}`}>
      {/* Gradient ocean backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10,79,191,1) 0%, rgba(31,189,189,1) 55%, rgba(241,185,116,1) 100%)',
          y: tide
        }}
      />

      {/* Aurora light waves */}
      {auroraBands.map((band, i) => (
        <motion.div
          key={band.id}
          className="absolute left-[-30%] w-[160%] rounded-[40%]"
          style={{
            top: `${20 + i * 20}%`,
            height: band.height as any,
            filter: (depth as any).to((d: number) => `blur(${band.blur + d}px)`),
            background: `radial-gradient(60% 60% at 50% 50%, hsla(${band.hue},90%,70%,${band.opacity}) 0%, rgba(255,255,255,0) 60%)`
          }}
          animate={{ x: ['-10%', '10%', '-10%'] }}
          transition={{ duration: band.speed, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Floating particles (sea salt glimmer) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(0.3px)'
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 3, -2, 0],
            opacity: [0.2, 0.9, 0.2],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Lens flare following cursor */}
      <motion.div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: lensX, top: lensY }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          className="rounded-full"
          style={{
            width: 220,
            height: 220,
            background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0) 70%)',
            filter: (depth as any).to((d: number) => `blur(${1 + d / 6}px)`)
          }}
        />
      </motion.div>

      {/* Edge interactive ripples */}
      {ripples.map((r) => (
        <motion.div
          key={r.id}
          className="pointer-events-none absolute"
          style={{ left: r.x, top: r.y }}
          initial={{ opacity: 0.35, scale: 0.6 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.5)',
              boxShadow: '0 0 30px rgba(255,255,255,0.2) inset'
            }}
          />
        </motion.div>
      ))}

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

interface WaveSectionProps {
  children: React.ReactNode
  className?: string
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const WaveSection: React.FC<WaveSectionProps> = ({ 
  children, 
  className = '',
  height = 'md'
}) => {
  const heightClasses = {
    sm: 'h-32',
    md: 'h-64',
    lg: 'h-96',
    xl: 'h-screen',
    full: 'min-h-screen'
  }

  return (
    <WaveBackground 
      className={`${heightClasses[height]} ${className}`}
      variant="animated"
    >
      <div className="flex items-center justify-center h-full">
        {children}
      </div>
    </WaveBackground>
  )
}
