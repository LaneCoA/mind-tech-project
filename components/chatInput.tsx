'use client'

import { useState } from 'react'

/* ---------- Typing Indicator ---------- */
function TypingIndicator() {
  return (
    <div className="flex gap-1">
      <span className="animate-bounce">.</span>
      <span className="animate-bounce [animation-delay:150ms]">.</span>
      <span className="animate-bounce [animation-delay:300ms]">.</span>
    </div>
  )
}

/* ---------- Types ---------- */
type ChatMessage = {
  role: 'bot' | 'user'
  text: string
}

/* ---------- Chat Component ---------- */
export default function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Hola 👋 ¿Dime qué candidato buscas?' },
  ])
  const [isSending, setIsSending] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)

    // Mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', text: message }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: data?.reply || 'No recibí respuesta del bot 😕',
        },
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: 'Ocurrió un error, intenta de nuevo.',
        },
      ])
    } finally {
      setIsSending(false)
      setMessage('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl p-3 text-sm max-w-[85%] ${
              m.role === 'bot'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-indigo-600 text-white self-end text-right'
            }`}
          >
            <p className="text-xs opacity-70 mb-1">
              {m.role === 'bot' ? 'AI Assistant' : 'Tú'}
            </p>
            <p>{m.text}</p>
          </div>
        ))}

        {/* Typing indicator */}
        {isSending && (
          <div className="rounded-xl p-3 text-sm max-w-[85%] bg-gray-100 text-gray-800">
            <p className="text-xs opacity-70 mb-1">AI Assistant</p>
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Escribe aquí…"
          disabled={isSending}
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={isSending}
          className="rounded-xl bg-indigo-600 text-white px-4 text-sm"
        >
          {isSending ? '...' : '➤'}
        </button>
      </div>
    </div>
  )
}

