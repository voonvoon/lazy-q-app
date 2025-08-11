"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/contexts/CartContext";
import React, { useEffect } from "react";

// 1. Base type for all fields
type CustomerInfoBase = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  state?: string;
  postcode?: string;
};



// 2. Reusable input component
function FormInput({
  name,
  type = "text",
  register,
  error,
  className = "",
  as = "input",
  placeholder = "",
}: {
  name: keyof CustomerInfoBase; //Only allows a key from your CustomerInfoBase
  type?: string;
  register: ReturnType<typeof useForm<CustomerInfoBase>>["register"];
  error?: { message?: string };
  className?: string;
  as?: "input" | "textarea";
  placeholder?: string;
}) {
  return (
    <div className="mb-4">
      {as === "textarea" ? (
        <textarea
          {...register(name)}
          className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${className}`}
          autoComplete="off"
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...register(name)}
          type={type}
          className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          autoComplete="off"
          placeholder={placeholder}
        />
      )}
      {error?.message && (
        <p className="text-xs text-red-600 mt-1">{error.message}</p>
      )}
    </div>
  );
}

// 3. Main form component
export default function CustomerInfoForm({
  delivery = false,
}: {
  delivery?: boolean;
} = {}) {
  const { setCustomerInfo, customerInfo } = useCart();

  // 4. Dynamic Zod schema based on delivery prop
  const schema = delivery
    ? z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        phone: z
          .string()
          .min(8, "Phone number is required")
          .regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
        address: z.string().min(1, "Address is required"),
        state: z.string().min(1, "State is required"),
        postcode: z.string().min(1, "Postcode is required"),
      })
    : z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        phone: z
          .string()
          .min(8, "Phone number is required")
          .regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
        address: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
      });

  type CustomerInfo = z.infer<typeof schema>;

  const {
    register,
    formState: { errors },
    watch,
  } = useForm<CustomerInfo>({
    resolver: zodResolver(schema),
    defaultValues: customerInfo, // Optional: prefill from context if available
    mode: "onChange",
  });

  // Watch all fields and update context on change
useEffect(() => {
  const subscription = watch((value) => {
    setCustomerInfo(value as CustomerInfoBase);
  });
  return () => subscription.unsubscribe();
}, [watch, setCustomerInfo]);

  return (
    <form className="max-w-md mx-auto">
      <FormInput
        name="name"
        register={register}
        error={errors.name}
        placeholder="Name"
      />
      <FormInput
        name="email"
        type="email"
        register={register}
        error={errors.email}
        placeholder="Email"
      />
      <FormInput
        name="phone"
        register={register}
        error={errors.phone}
        placeholder="Phone Number"
      />
      {delivery && (
        <>
          <FormInput
            name="address"
            register={register}
            error={errors.address}
            className="py-3 h-20"
            as="textarea"
            placeholder="Address"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <FormInput
                name="state"
                register={register}
                error={errors.state}
                placeholder="State"
              />
            </div>
            <div className="flex-1">
              <FormInput
                name="postcode"
                register={register}
                error={errors.postcode}
                placeholder="Postcode"
              />
            </div>
          </div>
        </>
      )}
    </form>
  );
}
