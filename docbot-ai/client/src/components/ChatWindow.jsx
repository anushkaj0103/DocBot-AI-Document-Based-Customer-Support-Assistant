import { useEffect, useRef } from 'react'
import LoadingIndicator from './LoadingIndicator'
import Message from './Message'

function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  return (
    <div className="chat-window">
      <div className="chat-window__content">
        {messages.map((message) => (
          <Message
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
        {isLoading ? <LoadingIndicator /> : null}
        <div ref={bottomRef}></div>
      </div>
    </div>
  )
}

export default ChatWindow
