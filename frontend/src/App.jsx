//Novo comentario
import React, { useState, useEffect } from "react";
import Card from "./components/Card";
import Meter from "./components/Meter";
import SettingsModal from "./SettingsModal";
import { RefreshCw, Settings } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./App.css";

export default function App() {
  const [limits, setLimits] = useState({});
  const [usage, setUsage] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${apiUrl}/limits`).then(res => res.json()),
      fetch(`${apiUrl}/usage`).then(res => res.json()),
    ]).then(([limitsData, usageData]) => {
      setLimits(limitsData.limits || {});
      setUsage(limitsData.usage || {});

      // Defensive: ensure limits are numbers and > 0
      const safeLimits = {
        AllContacts: Number(limitsData.limits?.AllContacts) || 1,
        Email: Number(limitsData.limits?.Email) || 1,
        SMS: Number(limitsData.limits?.SMS) || 1,
        WhatsApp: Number(limitsData.limits?.WhatsApp) || 1,
        CloudPages: Number(limitsData.limits?.CloudPages) || 1,
      };

      const hist = (usageData.usage || []).map(row => ({
        date: row.date,
        contacts: Math.round((Number(row.all_contacts) / safeLimits.AllContacts) * 100 * 100) / 100,
        email: Math.round((Number(row.email_push_sent) / safeLimits.Email) * 100 * 100) / 100,
        sms: Math.round((Number(row.sms_sent) / safeLimits.SMS) * 100 * 100) / 100,
        wa: Math.round((Number(row.whatsapp_sent) / safeLimits.WhatsApp) * 100 * 100) / 100,
        cp: Math.round((Number(row.cloudpages_prints) / safeLimits.CloudPages) * 100 * 100) / 100,
      }));

      setHistory(hist);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Função para salvar limites
  const handleSaveLimits = (newLimits) => {
  fetch(`${apiUrl}/limits`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLimits),
  })
    .then(res => res.json())
    .then(() => {
      setSettingsOpen(false);
      fetchData();
    });
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        limits={limits}
        onSave={handleSaveLimits}
      />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketing Cloud — Contract Health</h1>
            <p className="text-sm text-gray-500">Admin view</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="rounded-2xl px-4 py-2 bg-gray-100 text-gray-900 flex items-center gap-2 shadow"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
              {loading ? "Syncing..." : "Sync now"}
            </button>
            <button
              className="rounded-2xl px-4 py-2 bg-gray-900 text-white flex items-center gap-2 shadow"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Limits summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-white rounded-xl p-3 border shadow flex flex-col items-center">
            <div className="text-gray-500">All Contacts</div>
            <div className="font-semibold">{limits.AllContacts?.toLocaleString() || "-"}</div>
          </div>
          <div className="bg-white rounded-xl p-3 border shadow flex flex-col items-center">
            <div className="text-gray-500">SuperMessages — Email/Push</div>
            <div className="font-semibold">{limits.Email?.toLocaleString() || "-"}</div>
          </div>
          <div className="bg-white rounded-xl p-3 border shadow flex flex-col items-center">
            <div className="text-gray-500">SuperMessages — SMS</div>
            <div className="font-semibold">{limits.SMS?.toLocaleString() || "-"}</div>
          </div>
          <div className="bg-white rounded-xl p-3 border shadow flex flex-col items-center">
            <div className="text-gray-500">SuperMessages — WhatsApp</div>
            <div className="font-semibold">{limits.WhatsApp?.toLocaleString() || "-"}</div>
          </div>
          <div className="bg-white rounded-xl p-3 border shadow flex flex-col items-center">
            <div className="text-gray-500">CloudPages Prints</div>
            <div className="font-semibold">{limits.CloudPages?.toLocaleString() || "-"}</div>
          </div>
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <Meter label="All Contacts" used={usage.AllContacts || 0} limit={limits.AllContacts || 1} />
          </Card>
          <Card>
            <Meter label="Email / Push" used={usage.Email || 0} limit={limits.Email || 1} />
          </Card>
          <Card>
            <Meter label="SMS" used={usage.SMS || 0} limit={limits.SMS || 1} />
          </Card>
          <Card>
            <Meter label="WhatsApp" used={usage.WhatsApp || 0} limit={limits.WhatsApp || 1} />
          </Card>
          <Card>
            <Meter label="CloudPages Prints" used={usage.CloudPages || 0} limit={limits.CloudPages || 1} />
          </Card>
        </div>

        {/* Trend */}
        <Card>
  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">Evolução do consumo (% do limite)</div>
  <div style={{ height: 320 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={history}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} tickFormatter={tick => `${tick}%`} />
        <Tooltip formatter={value => `${value}%`} />
        <Legend />
        <Line type="monotone" dataKey="contacts" name="All Contacts" stroke="#6366f1" />
        <Line type="monotone" dataKey="email" name="Email/Push" stroke="#4f46e5" />
        <Line type="monotone" dataKey="sms" name="SMS" stroke="#10b981" />
        <Line type="monotone" dataKey="wa" name="WhatsApp" stroke="#f59e42" />
        <Line type="monotone" dataKey="cp" name="CloudPages" stroke="#6366f1" />
      </LineChart>
    </ResponsiveContainer>
  </div>
</Card>
      </div>
    </div>
  );
}