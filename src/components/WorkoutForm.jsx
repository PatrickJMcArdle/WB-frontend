import { useEffect, useState } from "react";

export default function WorkoutForm({
  initial = {
    id: null,
    title: "",
    focus: "upper",
    date: new Date().toISOString().slice(0, 10),
    minutes: 30,
    reps: 10,
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

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!focusOptions.includes(form.focus)) e.focus = "Pick a valid focus";

    const mins = Number(form.minutes);
    if (!Number.isFinite(mins) || mins < 5 || mins > 180)
      e.minutes = "Minutes must be 5–180";

    const reps = Number(form.reps);
    if (!Number.isFinite(reps) || reps < 1 || reps > 100)
      e.reps = "Reps must be 1–100";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      title: form.title.trim(),
      minutes: Math.round(Number(form.minutes)),
      reps: Math.round(Number(form.reps)),
    };
    onSave?.(payload);
  }

  return (
    <form
      onSubmit={submit}
      style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
    >
      <h2 style={{ marginTop: 0 }}>
        {form.id ? "Edit Workout" : "Add Workout"}
      </h2>

      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
        }}
      >
        <div>
          <input
            placeholder="Title (e.g., Push Day)"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            style={{ width: "100%" }}
          />
          {errors.title && (
            <div style={{ color: "crimson", fontSize: 12 }}>{errors.title}</div>
          )}
        </div>

        <div>
          <select
            value={form.focus}
            onChange={(e) => update("focus", e.target.value)}
            style={{ width: "100%" }}
          >
            {focusOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {errors.focus && (
            <div style={{ color: "crimson", fontSize: 12 }}>{errors.focus}</div>
          )}
        </div>

        <input
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
        />

        <div>
          <input
            type="number"
            min={5}
            max={180}
            value={form.minutes}
            onChange={(e) => update("minutes", e.target.value)}
            placeholder="Minutes"
            style={{ width: "100%" }}
          />
          {errors.minutes && (
            <div style={{ color: "crimson", fontSize: 12 }}>
              {errors.minutes}
            </div>
          )}
        </div>

        <div>
          <input
            type="number"
            min={1}
            max={100}
            value={form.reps}
            onChange={(e) => update("reps", e.target.value)}
            placeholder="Reps"
            style={{ width: "100%" }}
          />
          {errors.reps && (
            <div style={{ color: "crimson", fontSize: 12 }}>{errors.reps}</div>
          )}
        </div>
      </div>

      <textarea
        rows={3}
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => update("notes", e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit">
          {form.id ? "Save Changes" : "Add Workout"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
