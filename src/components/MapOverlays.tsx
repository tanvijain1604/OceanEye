import React, { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

/**********************
 * Utilities
 **********************/
const useHiDPICanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/**********************
 * Real-Time Streams Overlay (lines + glowing pulses)
 **********************/
export interface StreamNode { lat: number; lng: number; strength?: number }
export interface RealTimeStreamsOverlayProps {
  nodes: StreamNode[]
  color?: string // base color for glow
  maxLinksPerNode?: number
  zIndex?: number
}

export const RealTimeStreamsOverlay: React.FC<RealTimeStreamsOverlayProps> = ({
  nodes,
  color = 'rgba(0, 200, 255, 0.9)',
  maxLinksPerNode = 2,
  zIndex = 490
}) => {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)

  const links = useMemo(() => {
    // Build simple k-nearest neighbor links for each node
    const result: Array<[number, number]> = []
    const limit = Math.min(nodes.length, 64) // cap for perf
    for (let i = 0; i < limit; i++) {
      const a = nodes[i]
      const dists: Array<{ j: number; d: number }> = []
      for (let j = 0; j < limit; j++) {
        if (i === j) continue
        const b = nodes[j]
        const dx = a.lat - b.lat
        const dy = a.lng - b.lng
        dists.push({ j, d: dx * dx + dy * dy })
      }
      dists.sort((x, y) => x.d - y.d)
      const k = Math.min(maxLinksPerNode, dists.length)
      for (let n = 0; n < k; n++) {
        const j = dists[n].j
        if (i < j) result.push([i, j]) // add one direction to avoid duplicates
      }
    }
    return result
  }, [nodes, maxLinksPerNode])

  useEffect(() => {
    const pane = map.getPanes().overlayPane
    const canvas = L.DomUtil.create('canvas', '') as HTMLCanvasElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = String(zIndex)
    pane.appendChild(canvas)
    canvasRef.current = canvas

    useHiDPICanvas(canvas, map.getSize().x, map.getSize().y)

    let running = true
    const animate = (t: number) => {
      if (!running) return
      frameRef.current = requestAnimationFrame(animate)
      const size = map.getSize()
      const topLeft = map.containerPointToLayerPoint([0, 0])
      ;(L as any).DomUtil.setPosition(canvas, topLeft)
      useHiDPICanvas(canvas, size.x, size.y)
      const context = canvas.getContext('2d')!
      context.clearRect(0, 0, size.x, size.y)
      context.globalCompositeOperation = 'lighter'

      // Project nodes
      const pts = nodes.map((n) => map.latLngToLayerPoint([n.lat, n.lng]))

      // Draw base lines
      for (const [i, j] of links) {
        const a = pts[i]
        const b = pts[j]
        if (!a || !b) continue
        const grad = context.createLinearGradient(a.x, a.y, b.x, b.y)
        grad.addColorStop(0, 'rgba(0,200,255,0.05)')
        grad.addColorStop(0.5, 'rgba(0,200,255,0.25)')
        grad.addColorStop(1, 'rgba(0,200,255,0.05)')
        context.strokeStyle = grad
        context.lineWidth = 1.2
        context.beginPath()
        context.moveTo(a.x, a.y)
        context.lineTo(b.x, b.y)
        context.stroke()
      }

      // Draw pulses along links
      for (const [i, j] of links) {
        const a = pts[i]
        const b = pts[j]
        if (!a || !b) continue
        const tt = (t / 1000 + (i * 37 + j * 13) * 0.11) % 1 // 0..1 traveling
        const x = a.x + (b.x - a.x) * tt
        const y = a.y + (b.y - a.y) * tt
        const r = 2.2 + Math.sin(tt * Math.PI) * 1.8
        context.fillStyle = color
        context.shadowColor = color
        context.shadowBlur = 12
        context.beginPath()
        context.arc(x, y, r, 0, Math.PI * 2)
        context.fill()
        context.shadowBlur = 0
      }

      // Glowing nodes
      for (let idx = 0; idx < pts.length; idx++) {
        const p = pts[idx]
        if (!p) continue
        const pulse = (Math.sin((t / 700) + idx * 0.7) + 1) * 0.5
        const rr = 2 + pulse * 2
        context.fillStyle = 'rgba(255,255,255,0.95)'
        context.shadowColor = color
        context.shadowBlur = 10 + pulse * 10
        context.beginPath()
        context.arc(p.x, p.y, rr, 0, Math.PI * 2)
        context.fill()
        context.shadowBlur = 0
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    const handle = () => {
      if (!canvasRef.current) return
      useHiDPICanvas(canvasRef.current, map.getSize().x, map.getSize().y)
    }

    map.on('move zoom resize', handle)

    return () => {
      running = false
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      map.off('move zoom resize', handle)
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
      canvasRef.current = null
    }
  }, [map, nodes, links, color, zIndex])

  return null
}

/**********************
 * Predictive Currents Overlay (moving gradient fields)
 **********************/
export interface CurrentField { lat: number; lng: number; radiusKm?: number; intensity?: number; hue?: number }
export interface PredictiveCurrentsOverlayProps {
  fields: CurrentField[]
  opacity?: number
  zIndex?: number
}

export const PredictiveCurrentsOverlay: React.FC<PredictiveCurrentsOverlayProps> = ({
  fields,
  opacity = 0.18,
  zIndex = 480
}) => {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)

  function metersPerPixel(lat: number, zoom: number) {
    return 156543.03392 * Math.cos((lat * Math.PI) / 180) / Math.pow(2, zoom)
  }

  useEffect(() => {
    const pane = map.getPanes().overlayPane
    const canvas = L.DomUtil.create('canvas', '') as HTMLCanvasElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = String(zIndex)
    pane.appendChild(canvas)
    canvasRef.current = canvas

    const __ctx = useHiDPICanvas(canvas, map.getSize().x, map.getSize().y)
    __ctx.globalAlpha = opacity

    let running = true
    const animate = (t: number) => {
      if (!running) return
      frameRef.current = requestAnimationFrame(animate)
      const size = map.getSize()
      const topLeft = map.containerPointToLayerPoint([0, 0])
      ;(L as any).DomUtil.setPosition(canvas, topLeft)
      const context = useHiDPICanvas(canvas, size.x, size.y)
      context.clearRect(0, 0, size.x, size.y)
      context.globalAlpha = opacity

      // Subtle global flow gradient movement
      const shiftX = Math.sin(t / 5000) * 20
      const shiftY = Math.cos(t / 7000) * 15
      const g = context.createLinearGradient(shiftX, 0, size.x + shiftX, size.y + shiftY)
      g.addColorStop(0, 'rgba(0, 180, 255, 0.10)')
      g.addColorStop(0.5, 'rgba(0, 255, 200, 0.05)')
      g.addColorStop(1, 'rgba(0, 180, 255, 0.10)')
      context.fillStyle = g
      context.fillRect(0, 0, size.x, size.y)

      // Localized hazard/current blobs
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i]
        const center = map.latLngToLayerPoint([f.lat, f.lng])
        const mpp = metersPerPixel(f.lat, map.getZoom())
        const radiusPx = ((f.radiusKm ?? 8) * 1000) / mpp
        const hue = f.hue ?? (180 - (i * 15) % 90)
        const intensity = Math.max(0.2, Math.min(1, f.intensity ?? 0.6))
        const pulsate = 1 + Math.sin(t / (3000 + i * 217)) * 0.08
        const r = radiusPx * pulsate

        const grad = context.createRadialGradient(center.x, center.y, r * 0.1, center.x, center.y, r)
        grad.addColorStop(0, `hsla(${hue}, 90%, 60%, ${0.22 * intensity})`)
        grad.addColorStop(0.6, `hsla(${hue}, 80%, 55%, ${0.12 * intensity})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        context.fillStyle = grad
        context.beginPath()
        context.arc(center.x, center.y, r, 0, Math.PI * 2)
        context.fill()
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    const handle = () => {
      if (!canvasRef.current) return
      useHiDPICanvas(canvasRef.current, map.getSize().x, map.getSize().y)
    }

    map.on('move zoom resize', handle)

    return () => {
      running = false
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      map.off('move zoom resize', handle)
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas)
      canvasRef.current = null
    }
  }, [map, fields, opacity, zIndex])

  return null
}
