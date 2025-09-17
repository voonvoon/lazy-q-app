"use client";
import { useState } from "react";
import Navbar from "@/components/shared/Navbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    setMessage(
      result.message || "If your email exists, you will receive a reset link."
    );
    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          className="bg-white p-4 rounded shadow-md w-full max-w-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Reset Password
          </h2>
          <p className="text-xs text-gray-500 mb-4 text-center">
            Enter your email and we’ll send you a link to reset your password.
          </p>
          <input
            type="email"
            required
            className="w-full border border-gray-300 px-3 py-2 mb-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
            ) : null}
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          {message && (
            <p className="mt-3 text-sm text-gray-700 text-center">{message}</p>
          )}
        </form>
      </div>
    </>
  );
}
