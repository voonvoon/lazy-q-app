"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    setMessage(result.message || "If your email exists, you will receive a reset link.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Forgot Password</h2>
        <input
          type="email"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition" type="submit">
          Send Reset Link
        </button>
        {message && <p className="mt-3 text-sm text-gray-700 text-center">{message}</p>}
      </form>
    </div>
  );
}