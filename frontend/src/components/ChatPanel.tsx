import { FormEvent, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { GeneratedPlanResponse } from '../types/workout.types'

interface ChatPanelProps {
  plan?: GeneratedPlanResponse | null
}

const prompts = ['Why this plan?', 'Make it lighter', 'Use dumbbells only', 'Explain recovery time']

export default function ChatPanel({ plan }: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const { messages, lastResponse, loading, error, send } = useChat()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    send(message, plan)
    setMessage('')
  }

  return (
    <div className="grid two-column">
      <section className="panel">
        <h3 className="panel-title">RAG Chat</h3>
        <div className="checkbox-row" style={{ marginBottom: 12 }}>
          {prompts.map((prompt) => (
            <button key={prompt} className="icon-button" type="button" onClick={() => send(prompt, plan)}>
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="field">
          <label htmlFor="chat">Question</label>
          <textarea id="chat" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
          <button className="primary-button" type="submit" disabled={loading || !message.trim()}>
            {loading ? 'Asking...' : 'Send'}
          </button>
        </form>
        {error && <p className="error-banner">{error}</p>}
        <div className="grid" style={{ marginTop: 14 }}>
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className="panel" style={{ background: item.role === 'user' ? '#f8fafc' : '#f4f9fb' }}>
              <p style={{ margin: 0, fontWeight: 750 }}>{item.role === 'user' ? 'You' : 'Smart Workout'}</p>
              <p style={{ margin: '6px 0 0' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3 className="panel-title">Retrieved Snippets</h3>
        {lastResponse?.retrieved_snippets.length ? (
          <div className="grid">
            {lastResponse.retrieved_snippets.map((snippet, index) => (
              <div key={`${snippet.source}-${index}`} className="snippet">
                <p style={{ margin: 0, fontSize: 12, fontWeight: 780 }}>{snippet.category}</p>
                <p className="muted" style={{ margin: '3px 0 8px', fontSize: 12 }}>{snippet.source}</p>
                <p style={{ margin: 0 }}>{snippet.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Ask a question to see retrieved context.</p>
        )}
      </section>
    </div>
  )
}

