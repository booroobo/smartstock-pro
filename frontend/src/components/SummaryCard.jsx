export default function SummaryCard({ label, value, icon, tone = "primary", hint, className = "" }) {
  return (
    <div className={`ss-summary-card ${className}`}>
      <div className="ss-summary-top">
        <span className={`ss-summary-icon ${tone}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </span>
        {hint && <small className={tone === "danger" ? "danger" : ""}>{hint}</small>}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
