export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="error-state">
      <i className="fas fa-exclamation-triangle"></i>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          <i className="fas fa-redo"></i> Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'No items found', icon = 'fas fa-inbox' }) {
  return (
    <div className="empty-state">
      <i className={icon}></i>
      <p>{message}</p>
    </div>
  );
}
