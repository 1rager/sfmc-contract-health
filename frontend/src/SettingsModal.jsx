import React, { useState, useEffect } from "react";

export default function SettingsModal({ open, onClose, limits, onSave }) {
  const [form, setForm] = useState(limits);

  // Sincroniza o formulário com os limites sempre que abrir ou limites mudarem
  useEffect(() => {
    if (open) setForm(limits);
  }, [open, limits]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.replace(/\D/g, "") });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Configurar Limites Contratuais</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(form).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={key}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
              </label>
              <input
                type="text"
                name={key}
                id={key}
                value={value}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}