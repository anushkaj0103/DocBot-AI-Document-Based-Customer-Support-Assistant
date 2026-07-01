import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import ErrorBanner from './components/ErrorBanner'
import InputBar from './components/InputBar'
import { USER_ERROR_MESSAGES } from './constants/errorMessages'
import { sendQuestion } from './services/api'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSend(questionText) {
    if (questionText.trim() === '') {
      setError(USER_ERROR_MESSAGES.EMPTY_QUESTION)
      return
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: questionText,
      timestamp: new Date().toISOString(),
    }

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const { answer } = await sendQuestion(questionText)
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString(),
      }

      setMessages((currentMessages) => [...currentMessages, assistantMessage])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>DocBot AI</h1>
      </header>
      <ChatWindow messages={messages} isLoading={isLoading} />
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <InputBar onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}

export default App
