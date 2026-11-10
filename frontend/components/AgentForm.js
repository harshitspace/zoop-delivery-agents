"use client";

import { useEffect, useState } from "react";

const EMPTY = {
  full_name: "",
  phone: "",
  email: "",
  service_area: "",
  status: "active",
};

export default function AgentForm({ initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial || EMPTY);
    setError(null);
    setDetails([]);
    setSaving(false);
  }, [initial]);

  const change = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setDetails([]);
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
      setDetails(err.details || []);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      {error && (
        <div className="alert error">
          {error}
          {details.length > 0 && (
            <ul>
              {details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <label>Full name</label>
        <input name="full_name" value={form.full_name} onChange={change} />
      </div>

      <div>
        <label>Phone</label>
        <div className="phone-input">
          <span className="prefix">+91</span>
          <input
            name="phone"
            value={form.phone}
            onChange={change}
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number"
          />
        </div>
      </div>

      <div>
        <label>Email</label>
        <input name="email" value={form.email} onChange={change} />
      </div>

      <div>
        <label>Service area</label>
        <input
          name="service_area"
          value={form.service_area}
          onChange={change}
        />
      </div>

      <div>
        <label>Status</label>
        <select name="status" value={form.status} onChange={change}>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>

      <button type="submit" className="btn primary" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
