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
      minutes: Math.round(Number(form.minutes)),
      reps: Math.round(Number(form.reps)),
      sets: Math.round(Number(form.sets)),
      focuses: Array.from(new Set(form.focuses || [])),
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
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
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

        <div />
      </div>

      {/* Multi-focus checkbox grid */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Focus Areas</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 6,
          }}
        >
          {focusOptions.map((f) => {
            const checked = form.focuses?.includes(f);
            return (
              <label
                key={f}
                style={{ display: "flex", gap: 6, alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={!!checked}
                  onChange={() => toggleFocus(f)}
                />
                <span style={{ textTransform: "capitalize" }}>{f}</span>
              </label>
            );
          })}
        </div>
        {errors.focuses && (
          <div style={{ color: "crimson", fontSize: 12 }}>{errors.focuses}</div>
        )}
      </div>

      {/* Volume inputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 8,
        }}
      >
        <div>
          <input
            type="number"
            min={1}
            max={50}
            value={form.reps}
            onChange={(e) => update("reps", e.target.value)}
            placeholder="Reps (e.g., 15)"
            style={{ width: "100%" }}
          />
          {errors.reps && (
            <div style={{ color: "crimson", fontSize: 12 }}>{errors.reps}</div>
          )}
        </div>
        <div>
          <input
            type="number"
            min={1}
            max={10}
            value={form.sets}
            onChange={(e) => update("sets", e.target.value)}
            placeholder="Sets (e.g., 3)"
            style={{ width: "100%" }}
          />
          {errors.sets && (
            <div style={{ color: "crimson", fontSize: 12 }}>{errors.sets}</div>
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
