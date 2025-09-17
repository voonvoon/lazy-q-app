"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  //redirect to main after success
  useEffect(() => {
    if (message && !isError) {
      // Start countdown only on success
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);

      // Redirect after 5 seconds
      const redirectTimer = setTimeout(() => {
        window.location.href = "/signin";
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimer);
      };
    }
  }, [message, isError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setLoading(true);
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = await res.json();
    setMessage(result.message || "Password reset complete.");
    setIsError(res.status === 400);
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          className="bg-white p-6 rounded shadow-md w-full max-w-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Reset Password
          </h2>
          <input
            type="password"
            required
            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500px-3 py-2 mb-2 text-gray-900"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            required
            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 mb-2 text-gray-900"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <p className="text-xs text-gray-500 mb-2">
            Password must be at least 8 characters, include at least one letter,
            one number, and one special character.
          </p>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
            ) : null}
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          {message && (
            <p
              className={`mt-3 text-sm text-center ${
                isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
              {!isError && (
                <span className="block text-sm text-gray-500 mt-2">
                  Redirecting to sign in page in {redirectCountdown} seconds...
                </span>
              )}
            </p>
          )}
        </form>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
