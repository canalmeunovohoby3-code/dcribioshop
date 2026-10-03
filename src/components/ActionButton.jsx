export default function ActionButton({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`action-button ${className}`}>
      {children}
    </button>
  )
}
