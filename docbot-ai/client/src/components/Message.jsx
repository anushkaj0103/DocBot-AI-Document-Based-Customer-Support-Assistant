function Message({ role, content }) {
  return (
    <div className={`message message--${role}`}>
      <p>{content}</p>
    </div>
  )
}

export default Message
