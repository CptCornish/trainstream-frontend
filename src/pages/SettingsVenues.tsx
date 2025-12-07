// src/pages/SettingsVenues.tsx
import { useEffect, useState } from "react";

type Venue = {
  id: number;
  name: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  postcode?: string | null;
};

function SettingsVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://127.0.0.1:8000/api/venues");
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load venues:", text);
          throw new Error("Failed to load venues");
        }

        const data: Venue[] = await res.json();
        setVenues(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load venues.");
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Venues</h1>
        <p className="text-sm text-slate-500">
          Manage training venues used for your courses.
        </p>
      </header>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">
            Venues ({venues.length})
          </h2>
          <input
            type="text"
            placeholder="Search venues…"
            className="px-3 py-1.5 rounded-full border border-slate-300 text-sm"
          />
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading venues…</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-500">{error}</div>
        ) : venues.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No venues found. Add some venues in the desktop app or via future
            web tools.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Venue
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {venues.map((v) => {
                  const locationParts = [
                    v.city || "",
                    v.postcode || "",
                  ].filter(Boolean);
                  const location = locationParts.join(" • ");

                  const addressParts = [
                    v.address1 || "",
                    v.address2 || "",
                  ].filter(Boolean);
                  const address = addressParts.join(", ");

                  return (
                    <tr key={v.id} className="hover:bg-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {v.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {location || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {address || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsVenuesPage;
