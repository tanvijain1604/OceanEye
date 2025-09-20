import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/Button'

export type CommentItem = {
  id: string
  name: string
  text: string
  timestamp: number
}

const KEY = 'oceaneye-comments'

function load(): CommentItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

function save(items: CommentItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
}

const nowId = () => 'c_' + Math.random().toString(36).slice(2) + Date.now().toString(36)

export const CommentsBoard: React.FC = () => {
  const [items, setItems] = useState<CommentItem[]>([])
  const [name, setName] = useState<string>('')
  const [text, setText] = useState<string>('')
  const [q, setQ] = useState<string>('')

  useEffect(() => {
    const initial = load()
    setItems(initial)
    const n = localStorage.getItem('oceaneye-user-name') || ''
    setName(n)
  }, [])

  useEffect(() => { save(items) }, [items])

  const visible = useMemo(() => {
    if (!q.trim()) return [...items].sort((a,b)=>b.timestamp-a.timestamp)
    const qq = q.trim().toLowerCase()
    return [...items]
      .filter(i => i.name.toLowerCase().includes(qq) || i.text.toLowerCase().includes(qq))
      .sort((a,b)=>b.timestamp-a.timestamp)
  }, [items, q])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = (name || 'Anonymous').trim()
    const t = text.trim()
    if (!t) return
    const c: CommentItem = { id: nowId(), name: n, text: t, timestamp: Date.now() }
    setItems(prev => [c, ...prev])
    setText('')
    if (n && !localStorage.getItem('oceaneye-user-name')) localStorage.setItem('oceaneye-user-name', n)
  }

  const clear = () => {
    if (!confirm('Clear all comments?')) return
    setItems([])
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Search comments..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="px-3 py-2 border rounded md:col-span-2"
          />
        </div>
        <textarea
          placeholder="Share observations or tips about current ocean hazards..."
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="w-full px-3 py-2 border rounded min-h-[90px]"
        />
        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary">Post Comment</Button>
          <Button type="button" variant="outline" onClick={clear}>Clear All</Button>
        </div>
      </form>

      {visible.length === 0 ? (
        <div className="text-sm text-gray-600">No comments yet. Be the first to share.</div>
      ) : (
        <ul className="space-y-3">
          {visible.map((c)=> (
            <li key={c.id} className="p-3 border rounded bg-white">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-primary-navy">{c.name || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.text}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CommentsBoard
