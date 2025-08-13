import React from "react";
import "./XPBar.css";

export default function XPBar({
  current = 0,
  target = 100,
  showNumbers = true,
  className = "",
}) {
  const safeTarget = Math.max(0, Number(target) || 0);
  const safeCurrent = Math.max(0, Number(current) || 0);
  const pct =
    safeTarget > 0
      ? Math.min(100, Math.round((safeCurrent / safeTarget) * 100))
      : 0;

  return (
    <div className={`xpbar-wrapper ${className}`}>
      {/* numbers / label */}
      {showNumbers && (
        <div className="xpbar-labels">
          <span>XP</span>
          <span>
            {safeCurrent} / {safeTarget} ({pct}%)
          </span>
        </div>
      )}

      {/* progress bar */}
      <div
        className="xpbar-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTarget || 0}
        aria-valuenow={Math.min(safeCurrent, safeTarget)}
        aria-label="Experience progress"
        title={`XP: ${safeCurrent} / ${safeTarget}`}
      >
        <div
          className="xpbar-fill"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%)",
          }}
        />
      </div>
    </div>
  );
}
