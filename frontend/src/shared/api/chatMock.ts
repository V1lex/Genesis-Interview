type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  status: 'streaming' | 'final' | 'error'
}

export type ChatEvent =
  | { type: 'typing'; messageId: string }
  | { type: 'delta'; messageId: string; content: string }
  | { type: 'final'; messageId: string; content: string }
  | { type: 'error'; messageId: string; error: string }

export type ChatStream = {
  cancel: () => void
  messageId: string
}

const replies = [
  'Давай начнём с простого: оцени сложность твоего решения и возможные узкие места.',
  'Подумай про граничные случаи: пустой ввод, большие данные, нестабильную сеть.',
  'Окей, а как бы ты добавил метрики и логирование вокруг выполнения задачи?',
  'Представь, что нужно масштабировать. Что поменяешь в архитектуре решения?',
  'Если тест упал: как будешь дебажить и какой сигнал хочешь видеть первым?',
]

const pickReply = (userText: string) => {
  if (userText.toLowerCase().includes('sql')) {
    return 'Для SQL важно: индексы, план выполнения и защита от инъекций. Как учтёшь это в решении?'
  }

  if (userText.toLowerCase().includes('cache')) {
    return 'Подумай про стратегию инвалидации и метрики кэша. Что будешь мониторить?'
  }

  return replies[Math.floor(Math.random() * replies.length)]
}

export const generateMessageId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 7)}`

export function mockChatStream(
  userText: string,
  onEvent: (event: ChatEvent) => void,
  opts?: { messageId?: string },
): ChatStream {
  const messageId = opts?.messageId ?? generateMessageId('asst')
  const shouldError = userText.toLowerCase().includes('error')
  const reply = pickReply(userText)
  const chunks = reply.split(/(?<=[.!?])\s/)

  const timers: Array<ReturnType<typeof setTimeout>> = []

  timers.push(
    setTimeout(() => {
      onEvent({ type: 'typing', messageId })
    }, 200),
  )

  let acc = ''
  chunks.forEach((chunk, idx) => {
    timers.push(
      setTimeout(() => {
        acc += (acc ? ' ' : '') + chunk.trim()
        onEvent({ type: 'delta', messageId, content: chunk.trim() })
      }, 600 + idx * 420),
    )
  })

  if (shouldError) {
    timers.push(
      setTimeout(() => {
        onEvent({
          type: 'error',
          messageId,
          error: 'Моковая ошибка: проверь контракт или ответ сервера',
        })
      }, 1600),
    )
  } else {
    timers.push(
      setTimeout(() => {
        onEvent({ type: 'final', messageId, content: acc || reply })
      }, 600 + chunks.length * 420 + 80),
    )
  }

  return {
    cancel: () => {
      timers.forEach((timer) => clearTimeout(timer))
    },
    messageId,
  }
}

export function createAssistantMessage(id: string): ChatMessage {
  return {
    id,
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
    status: 'streaming',
  }
}
