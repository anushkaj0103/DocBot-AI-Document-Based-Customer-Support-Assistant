function LoadingIndicator() {
  return (
    <div
      className="message message--assistant loading"
      role="status"
      aria-live="polite"
      aria-label="Loading response"
    >
      <span className="dot" aria-hidden="true"></span>
      <span className="dot" aria-hidden="true"></span>
      <span className="dot" aria-hidden="true"></span>
    </div>
  )
}

export default LoadingIndicator
