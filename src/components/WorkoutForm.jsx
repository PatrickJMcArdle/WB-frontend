import { useEffect, useState } from "react";

export default function WorkoutForm({
  initial = {
    id: null,
    title: "",
    focuses: [], // <- multi
    date: new Date().toISOString().slice(0, 10),
    minutes: 30,
    reps: 15,
    sets: 3,
    notes: "",
  },
  focusOptions = [],
  onSave, // (payload) => void
  onCancel, // () => void
}) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => setForm(initial), [initial]);

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleFocus(key) {
    setForm((f) => {
      const cur = new Set(f.focuses || []);
      if (cur.has(key)) cur.delete(key);
      else cur.add(key);
      return { ...f, focuses: Array.from(cur) };
    });
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!Array.isArray(form.focuses) || form.focuses.length === 0)
      e.focuses = "Pick at least one focus";
    const mins = Number(form.minutes);
    if (!Number.isFinite(mins) || mins < 5 || mins > 180)
      e.minutes = "Minutes must be 5–180";
    const reps = Number(form.reps);
    if (!Number.isFinite(reps) || reps < 1 || reps > 50)
      e.reps = "Reps must be 1–50";
    const sets = Number(form.sets);
    if (!Number.isFinite(sets) || sets < 1 || sets > 10)
      e.sets = "Sets must be 1–10";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      title: form.title.trim(),
      date: (form.date || "").slice(0, 10),
      minutes: Math.round(Number(form.minutes)),
      reps: Math.round(Number(form.reps)),
      sets: Math.round(Number(form.sets)),
      focuses: Array.from(new Set(form.focuses || [])),
    };
    onSave?.(payload);
  }

  return (
    <form onSubmit={submit} className="workout-form">
      <h2 className="workout-form-title">
        {form.id ? "Edit Workout" : "Add Workout"}
      </h2>

      <div className="workout-form-inner">
        <div className="workout-form-row">
          <input
            placeholder="Title (e.g., Push Day)"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>

        <div className="workout-form-row">
          <select
            value={form.focus}
            onChange={(e) => update("focus", e.target.value)}
          >
            {focusOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>

        <div className="workout-form-row">
          <input
            type="number"
            min={5}
            max={180}
            value={form.minutes}
            onChange={(e) => update("minutes", e.target.value)}
            placeholder="Minutes"
          />
          <input
            type="number"
            min={1}
            max={300}
            value={form.reps}
            onChange={(e) => update("reps", e.target.value)}
            placeholder="Reps"
          />
        </div>

        <div className="workout-form-row">
          <textarea
            rows={3}
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>

        <div className="workout-form-actions">
          <button type="submit">
            {form.id ? "Save Changes" : "Add Workout"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
