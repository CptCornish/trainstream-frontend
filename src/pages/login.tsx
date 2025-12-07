import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Invalid login. Please try again.");
        return;
      }

      const data = await res.json();

      // Save session
      localStorage.setItem("ts_token", data.access_token);
      localStorage.setItem("ts_user", data.username);

      navigate("/courses");
    } catch (err) {
      setError("Server error. Check backend is running.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-800 mb-3 text-center">
          TrainStream Login
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Enter your credentials to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

