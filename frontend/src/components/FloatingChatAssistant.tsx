import { FormEvent, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { GeneratedPlanResponse } from '../types/workout.types'

interface FloatingChatAssistantProps {
  plan?: GeneratedPlanResponse | null
}

const prompts = ['Why this plan?', 'Make it lighter', 'Use dumbbells only']

export default function FloatingChatAssistant({ plan }: FloatingChatAssistantProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const { messages, lastResponse, loading, error, send } = useChat()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    send(message, plan)
    setMessage('')
  }

  return (
    <div className="floating-assistant">
      {open && (
        <section className="assistant-drawer">
          <div className="assistant-header">
            <div>
              <p className="assistant-title">Smart Workout Assistant</p>
              <p className="assistant-subtitle">RAG-grounded help with current plan context</p>
            </div>
            <button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={16} />
            </button>
          </div>

          <div className="assistant-prompt-row">
            {prompts.map((prompt) => (
              <button key={prompt} className="assistant-prompt" type="button" onClick={() => send(prompt, plan)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="assistant-body">
            {messages.length ? (
              messages.map((item, index) => (
                <div key={`${item.role}-${index}`} className={`assistant-message ${item.role}`}>
                  <p className="assistant-role">{item.role === 'user' ? 'You' : 'Assistant'}</p>
                  <p className="assistant-text">{item.text}</p>
                </div>
              ))
            ) : (
              <div className="assistant-empty">
                Ask about the generated plan, recovery adjustment, or equipment substitution.
              </div>
            )}

            {lastResponse?.retrieved_snippets.length ? (
              <div className="assistant-snippets">
                <p className="assistant-snippets-title">Retrieved Evidence</p>
                {lastResponse.retrieved_snippets.slice(0, 2).map((snippet, index) => (
                  <div key={`${snippet.source}-${index}`} className="snippet">
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 780 }}>{snippet.category}</p>
                    <p className="muted" style={{ margin: '3px 0 8px', fontSize: 12 }}>{snippet.source}</p>
                    <p style={{ margin: 0 }}>{snippet.text}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={submit} className="assistant-form">
            <textarea
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about this plan or your workout constraints"
            />
            <button className="primary-button" type="submit" disabled={loading || !message.trim()}>
              {loading ? 'Asking...' : 'Send'}
            </button>
          </form>
        </section>
      )}

      <button className="assistant-fab" type="button" onClick={() => setOpen((current) => !current)} aria-label="Open chat assistant">
        <MessageSquare size={18} />
      </button>
    </div>
  )
}
