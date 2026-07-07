import { FormEvent, useState } from 'react'
import FormattedText from './FormattedText'
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
        <div className="sequence-note" style={{ marginBottom: 12 }}>
          This panel explains the generated plan with retrieved evidence. It is retrieval-grounded support, not a final free-form coaching model yet.
        </div>
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
        <div className="chat-message-list">
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`chat-message ${item.role}`}>
              <p className="chat-message-author">{item.role === 'user' ? 'You' : 'Smart Workout'}</p>
              <FormattedText text={item.text} />
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3 className="panel-title">Retrieved Snippets</h3>
        {plan ? (
          <p className="muted" style={{ marginTop: 0, fontSize: 12 }}>
            Current plan context: {plan.plan_type} for {plan.weekly_schedule.length} scheduled session{plan.weekly_schedule.length === 1 ? '' : 's'}.
          </p>
        ) : (
          <p className="muted" style={{ marginTop: 0, fontSize: 12 }}>
            No plan has been generated yet. The chat can still answer general project questions from the RAG corpus.
          </p>
        )}
        {lastResponse?.retrieved_snippets.length ? (
          <div className="grid">
            {lastResponse.retrieved_snippets.map((snippet, index) => (
              <div key={`${snippet.source}-${index}`} className="snippet">
                <p className="snippet-title">{snippet.category}</p>
                <p className="muted snippet-source">{snippet.source}</p>
                <FormattedText text={snippet.text} />
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

