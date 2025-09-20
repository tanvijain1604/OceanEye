import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'

export type SocialHighlightsProps = {
  className?: string
  compact?: boolean
}

const trendingTags = [
  { tag: '#tsunami', change: '+32%', tone: 'danger' as const },
  { tag: '#stormsurge', change: '+15%', tone: 'warning' as const },
  { tag: '#highwaves', change: '+9%', tone: 'warning' as const },
  { tag: '#swell', change: '+6%', tone: 'info' as const },
  { tag: '#coastalcurrents', change: '+5%', tone: 'info' as const },
]

const officialSources = [
  { name: 'INCOIS', handle: '@INCOIS_moES', url: 'https://twitter.com/INCOIS_moES' },
  { name: 'IMD', handle: '@Indiametdept', url: 'https://twitter.com/Indiametdept' },
  { name: 'NDMA', handle: '@NDMAIndia', url: 'https://twitter.com/NDMAIndia' },
  { name: 'NDRF', handle: '@NDRFHQ', url: 'https://twitter.com/NDRFHQ' },
]

export const SocialHighlights: React.FC<SocialHighlightsProps> = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <div className={`w-full m-0 p-0 min-w-0 relative isolate ${className}`}>
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-primary-navy">Social Media Highlights</h3>
          <p className="text-sm text-gray-600">
            Emerging discussions and signals from public platforms and official accounts.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {/* Trending Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-navy">Trending Hashtags</h3>
                  <span className="text-xl">#</span>
                </div>
                <div className="space-y-2">
                  {trendingTags.map((t) => (
                    <div key={t.tag} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="font-mono text-primary-navy">{t.tag}</div>
                      <Badge variant={t.tone} size="sm">{t.change}</Badge>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-4">
                  <a
                    className="text-primary-navy underline text-sm"
                    href="https://twitter.com/search?q=%23tsunami%20OR%20%23stormsurge%20OR%20%23highwaves%20OR%20%23swell%20OR%20%23coastalcurrents&f=live"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View live hashtag search
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Official Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-navy">Official Sources</h3>
                  <span className="text-xl">🏛️</span>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {officialSources.map((s) => (
                    <li key={s.handle} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-primary-navy">{s.name}</div>
                        <a className="text-sm text-primary-ocean" href={s.url} target="_blank" rel="noopener noreferrer">{s.handle}</a>
                      </div>
                      <a className="text-sm underline text-primary-navy" href={s.url} target="_blank" rel="noopener noreferrer">Open</a>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-3">Links open public timelines on external sites.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-navy">Activity Snapshot</h3>
                  <span className="text-xl">📈</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Posts (24h)</span>
                    <span className="font-semibold text-primary-navy">~3.2k</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Hazard-related%</span>
                    <span className="font-semibold text-primary-navy">~42%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Avg. sentiment</span>
                    <span className="font-semibold text-primary-navy">Neutral</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Urgency mentions</span>
                    <Badge variant="warning" size="sm">Rising</Badge>
                  </div>
                </div>
                <div className="text-right mt-4">
                  <Button size="sm" variant="outline" onClick={() => window.open('https://twitter.com/search?q=%23tsunami%20OR%20%23stormsurge%20OR%20%23highwaves%20OR%20%23swell%20OR%20%23coastalcurrents&f=live', '_blank')}>Open Live View</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full m-0 p-0 min-w-0 relative isolate ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-primary-navy mb-3">Social Media Highlights</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Emerging discussions and signals around ocean hazards from public platforms and official accounts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trending Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            viewport={{ once: true }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary-navy">Trending Hashtags</h3>
                  <span className="text-2xl">#</span>
                </div>
                <div className="space-y-2">
                  {trendingTags.map((t) => (
                    <div key={t.tag} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="font-mono text-primary-navy">{t.tag}</div>
                      <Badge variant={t.tone} size="sm">{t.change}</Badge>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-4">
                  <a
                    className="text-primary-navy underline text-sm"
                    href="https://twitter.com/search?q=%23tsunami%20OR%20%23stormsurge%20OR%20%23highwaves%20OR%20%23swell%20OR%20%23coastalcurrents&f=live"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View live hashtag search
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Official Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary-navy">Official Sources</h3>
                  <span className="text-2xl">🏛️</span>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {officialSources.map((s) => (
                    <li key={s.handle} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-primary-navy">{s.name}</div>
                        <a className="text-sm text-primary-ocean" href={s.url} target="_blank" rel="noopener noreferrer">{s.handle}</a>
                      </div>
                      <a className="text-sm underline text-primary-navy" href={s.url} target="_blank" rel="noopener noreferrer">Open</a>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-3">Links open public timelines on external sites.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary-navy">Activity Snapshot</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Posts (24h)</span>
                    <span className="font-semibold text-primary-navy">~3.2k</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Hazard-related%</span>
                    <span className="font-semibold text-primary-navy">~42%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Avg. sentiment</span>
                    <span className="font-semibold text-primary-navy">Neutral</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Urgency mentions</span>
                    <Badge variant="warning" size="sm">Rising</Badge>
                  </div>
                </div>
                <div className="text-right mt-4">
                  <Button size="sm" variant="outline" onClick={() => window.open('https://twitter.com/search?q=%23tsunami%20OR%20%23stormsurge%20OR%20%23highwaves%20OR%20%23swell%20OR%20%23coastalcurrents&f=live', '_blank')}>Open Live View</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SocialHighlights
