"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain a special character"
      )
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
    confirmPassword: z.string(),
  })
  // refine() is used to add custom validation logic to a schema.
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error attached to confirmPassword field in form.
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSuccess(false);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    const result = await res.json();
    if (!res.ok || result.error) {
      setServerError(result.error || "Failed to change password");
    } else {
      toast.success("Password changed successfully!"); 
      setSuccess(true);
      reset();
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Change Password
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              className="block text-sm font-medium mb-1 text-gray-800"
              htmlFor="current-password"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1 text-gray-800"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              {...register("newPassword")}
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters, include at least one
              letter, one number, and one special character.
            </p>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1 text-gray-800"
              htmlFor="confirm-password"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {serverError && (
            <p className="text-red-600 text-sm text-center">{serverError}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center">
              Password changed successfully!
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}


