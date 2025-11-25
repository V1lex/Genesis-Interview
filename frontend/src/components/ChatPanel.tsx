import { type FormEvent, useEffect, useRef, useState } from 'react'
import {
  type ChatMessage,
  type ChatEvent,
  type ChatStream,
  createAssistantMessage,
  generateMessageId,
  mockChatStream,
} from '../shared/api/chatMock'

const initialMessages: ChatMessage[] = [
  {
    id: generateMessageId('sys'),
    role: 'assistant',
    content:
      'Привет! Я ИИ-интервьюер. Расскажи, по какому стеку хочешь интервью и какой у тебя уровень.',
    createdAt: new Date().toISOString(),
    status: 'final',
  },
]

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const streamRef = useRef<ChatStream | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.cancel()
    }
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleEvent = (event: ChatEvent) => {
    setMessages((prev) => {
      const next = [...prev]
      const idx = next.findIndex((msg) => msg.id === event.messageId)

      if (event.type === 'typing' && idx === -1) {
        next.push(createAssistantMessage(event.messageId))
        return next
      }

      if (idx === -1) {
        return next
      }

      const current = next[idx]

      if (event.type === 'delta') {
        next[idx] = {
          ...current,
          status: 'streaming',
          content: current.content
            ? `${current.content} ${event.content}`.replace(/\s+/g, ' ').trim()
            : event.content,
        }
      } else if (event.type === 'final') {
        next[idx] = {
          ...current,
          status: 'final',
          content: current.content || event.content,
        }
      } else if (event.type === 'error') {
        next[idx] = {
          ...current,
          status: 'error',
          content: current.content || event.error,
        }
      }

      return next
    })

    if (event.type === 'final' || event.type === 'error') {
      setIsSending(false)
    }
  }

  const handleSend = (evt: FormEvent) => {
    evt.preventDefault()
    const text = draft.trim()
    if (!text || isSending) return

    const userMessage: ChatMessage = {
      id: generateMessageId('user'),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
      status: 'final',
    }

    const assistantId = generateMessageId('asst')

    setMessages((prev) => [...prev, userMessage, createAssistantMessage(assistantId)])
    setDraft('')
    setIsSending(true)

    streamRef.current?.cancel()
    streamRef.current = mockChatStream(text, handleEvent, { messageId: assistantId })
  }

  return (
    <div className="panel grid-full">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Шаг 3 · чат с ИИ</p>
          <h2>Моковый чат Scibox (SSE-like)</h2>
          <p className="muted">
            Имитируем потоковые ответы: typing → delta → final → error. На API переключимся
            через VITE_API_URL, сохраняя формат событий.
          </p>
        </div>
        <div className="pill pill-ghost">Статус: mock</div>
      </div>

      <div className="chat-shell">
        <div className="chat-messages" ref={listRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`bubble bubble-${msg.role}`}>
              <div className="bubble-meta">
                <span className="pill pill-ghost">{msg.role === 'assistant' ? 'ИИ' : 'Вы'}</span>
                <span className="muted">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                <span className={`status status-${msg.status}`}>
                  {msg.status === 'streaming'
                    ? 'typing'
                    : msg.status === 'final'
                      ? 'final'
                      : 'error'}
                </span>
              </div>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <div className="chat-hint">
            Отправь текст — мок ответит частями. Напиши «error» для проверки обработки ошибок.
          </div>
          <div className="chat-input-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Опиши стек или спроси интервьюера..."
              disabled={isSending}
            />
            <button className="cta" type="submit" disabled={!draft.trim() || isSending}>
              {isSending ? 'Ждём ответ...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
