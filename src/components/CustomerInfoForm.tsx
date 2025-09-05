"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/contexts/CartContext";
import React, { useEffect, useRef } from "react";

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
    <div className="mb-2">
      {as === "textarea" ? (
        <textarea
          {...register(name)}
          className={`text-sm w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${className} scrollbar-thin`}
          autoComplete="off"
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...register(name)}
          type={type}
          className={`text-sm w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
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
  onValidityChange,
}: {
  delivery?: boolean;
  onValidityChange?: (isValid: boolean) => void;
} = {}) {
  const {
    setCustomerInfo,
    customerInfo,
    triggerCheck,
    delivery: deliverStateInCartContext, //nick name
  } = useCart();

  const prevDeliveryRef = useRef(deliverStateInCartContext); // To track previous delivery state to trigger useEffect!
  const deliveryChangeCountRef = useRef(0);//track this cuz i want trigger on 2nd change else first load all red ugly!

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
    formState: { errors, isValid },
    watch,
    reset,
    trigger,
  } = useForm<CustomerInfo>({
    resolver: zodResolver(schema),
    defaultValues: customerInfo, // Optional: prefill from context if available
    mode: "all",
  });

  //when pay btn check trigger a validation check in Zod so error then show!
  useEffect(() => {
    if (triggerCheck) {
      trigger();
    }
  }, [triggerCheck, trigger]); //add deliverStateInCartContext so when it change will re-check validity.

  //if delivery state change trigger validation again!
  //Use a Ref to Store Previous Value to compare
 useEffect(() => {
  if (prevDeliveryRef.current !== deliverStateInCartContext) {
    deliveryChangeCountRef.current += 1;
    if (deliveryChangeCountRef.current > 1) {
      trigger(); // Only validate on 2nd and subsequent changes to avoid initial load red errors
    }
    prevDeliveryRef.current = deliverStateInCartContext; // Update previous value for next comparison
  }
}, [deliverStateInCartContext, trigger]);

  // Notify global state when validity changes
  //isValid: prop from react-hook-form, boolean, tells if all required fields are filled correctly
  //onValidityChange is a func passed from parent comp. == setCustomerInfoValid (state in CartContext)
  useEffect(() => {
    if (onValidityChange) onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  //tis useEffect --> even user refresh page form field persist.
  //cuz react-hook-form’s defaultValues are only set on the first render.
  //refresh->context (customerInfo) is loaded from localStorage after the form already mounted, so form fields stay empty.
  //But navigate between pages (without a full reload), the context is already in memory, so the form gets the values.
  useEffect(() => {
    // Only reset if values are different else looping error
    //watch() gets the current values in the form fields.
    //when refresh watch() is {} but customerInfo is not, so reset the form so it gets the values
    if (JSON.stringify(watch()) !== JSON.stringify(customerInfo)) {
      reset(customerInfo);
    }
  }, [customerInfo]);

  // Watch all fields and update context on change
  // subscription : listener for form changes.
  // .unsubscribe() stops listening when no longer needed.
  useEffect(() => {
    const subscription = watch((value) => {
      setCustomerInfo(value as CustomerInfoBase);
    });
    return () => subscription.unsubscribe();
  }, [watch, setCustomerInfo]);

  return (
    <form className="w-full max-w-none mx-auto">
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
          <div className="flex gap-1">
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
          <p className="text-xs text-gray-600 mt-2">
            **All your information is protected and kept confidential.
          </p>
        </>
      )}
    </form>
  );
}
