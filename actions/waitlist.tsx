"use server"

import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { z } from "zod"

// Create a single supabase client for the server
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Schema for email validation
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export async function subscribeToWaitlist(formData: FormData) {
  try {
    // Get and validate email
    const email = formData.get("email") as string
    const validation = emailSchema.safeParse({ email })

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0].message,
      }
    }

    // Get IP address from headers (for analytics)
    const headersList = headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // Get referral source if provided
    const referralSource = (formData.get("referral_source") as string) || null

    // Insert into waitlist table
    const { error } = await supabase.from("waitlist").insert({
      email,
      ip_address: ip,
      referral_source: referralSource,
    })

    if (error) {
      // Handle unique constraint violation gracefully
      if (error.code === "23505") {
        return {
          success: true,
          message: "You're already on our waitlist! We'll be in touch soon.",
        }
      }

      console.error("Waitlist submission error:", error)
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      }
    }

    return {
      success: true,
      message: "Thanks for joining our waitlist! We'll keep you updated.",
    }
  } catch (error) {
    console.error("Waitlist action error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}
