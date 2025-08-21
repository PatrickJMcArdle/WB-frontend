import { useEffect, useMemo, useState } from "react";

/**
 * Props:
 *  - initial: { id|null, title, focuses[], date(yyyy-mm-dd), minutes, reps, sets, notes }
 *  - focusOptions: string[] (e.g. ["arms","legs","core","cardio"])
 *  - onSave(payload)
 *  - onCancel()
 */
export default function WorkoutForm({
  initial,
  focusOptions = [],
  onSave,
  onCancel,
}) {
  // normalize initial
  const init = useMemo(
    () => ({
      id: initial?.id ?? null,
      title: initial?.title ?? "",
      focuses: Array.isArray(initial?.focuses) ? initial.focuses : [],
      date: (initial?.date || new Date().toISOString().slice(0, 10)).slice(
        0,
        10
      ),
      minutes: Number(initial?.minutes) || 30,
      reps: Number(initial?.reps) || 15,
      sets: Number(initial?.sets) || 3,
      notes: initial?.notes ?? "",
    }),
    [initial]
  );

  const [title, setTitle] = useState(init.title);
  const [focus, setFocus] = useState(init.focuses[0] || focusOptions[0] || "");
  const [date, setDate] = useState(init.date);
  const [minutes, setMinutes] = useState(init.minutes);
  const [reps, setReps] = useState(init.reps);
  const [sets, setSets] = useState(init.sets);
  const [notes, setNotes] = useState(init.notes);
  const [err, setErr] = useState("");

  // if parent swaps initial (e.g. Edit), re-seed the form
  useEffect(() => {
    setTitle(init.title);
    setFocus(init.focuses[0] || focusOptions[0] || "");
    setDate(init.date);
    setMinutes(init.minutes);
    setReps(init.reps);
    setSets(init.sets);
    setNotes(init.notes);
    setErr("");
  }, [init, focusOptions]);

  function validate() {
    if (!title.trim()) return "Please enter a workout title.";
    if (!date) return "Please select a date.";
    if (!focus) return "Please choose a focus.";
    if (!Number(minutes) || Number(minutes) <= 0)
      return "Minutes must be greater than 0.";
    if (!Number(sets) || Number(sets) <= 0)
      return "Sets must be greater than 0.";
    if (!Number(reps) || Number(reps) <= 0)
      return "Reps must be greater than 0.";
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    const payload = {
      id: init.id, // keep id if editing; null on create
      title: title.trim(),
      focuses: [focus], // planner expects array
      date: (date || "").slice(0, 10),
      minutes: Number(minutes),
      reps: Number(reps),
      sets: Number(sets),
      notes,
      // you can also carry a serverId if you map it elsewhere
    };
    onSave?.(payload);
  }

  return (
    <form className="workout-form" onSubmit={handleSubmit}>
      <div className="workout-form-inner">
        {/* Title */}
        <div className="workout-form-row">
          <input
            type="text"
            placeholder="Title (e.g., Push Day)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Focus + Date */}
        <div className="workout-form-row">
          <select value={focus} onChange={(e) => setFocus(e.target.value)}>
            {focusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Minutes + Reps */}
        <div className="workout-form-row">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
        <div className="workout-form-row">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>

        {/* Sets */}
        <div className="workout-form-row">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="sets"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
          />
        </div>

        {/* Notes */}
        <textarea
          rows={4}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Errors */}
        {err && (
          <div style={{ color: "#9c2a2a", fontWeight: 700, marginTop: 6 }}>
            {err}
          </div>
        )}

        {/* Actions */}
        <div className="workout-form-actions">
          <button type="submit">Add Workout</button>
          <button type="button" onClick={() => onCancel?.()}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
