export default function StatusStamp({ status }) {
  return <span className={`stamp stamp-${status}`}>{status}</span>;
}

export function StampButton({ status, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`stamp-btn ${active ? `active ${status}` : ""}`}
    >
      {status}
    </button>
  );
}
