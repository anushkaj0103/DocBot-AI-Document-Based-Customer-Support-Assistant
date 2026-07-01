import { useEffect } from 'react'

function ErrorBanner({ message, onDismiss }) {
  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss()
    }, 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [message, onDismiss])

  if (message === null) {
    return null
  }

  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      <button type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  )
}

export default ErrorBanner
