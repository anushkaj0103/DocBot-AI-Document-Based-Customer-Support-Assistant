import { useState } from 'react'

function InputBar({ onSend, isLoading }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const nextValue = value
    onSend(nextValue)
    setValue('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form className="input-bar" onSubmit={handleSubmit} aria-busy={isLoading}>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about the document..."
        disabled={isLoading}
        aria-label="Your question"
      />
      <button type="submit" disabled={isLoading} aria-label="Send question">
        Send
      </button>
    </form>
  )
}

export default InputBar
