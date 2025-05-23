"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Check, Eye, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { subscribeToWaitlist } from "@/actions/waitlist"

export default function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await subscribeToWaitlist(formData)
      setResult(response)
    } catch (error) {
      console.error("Waitlist join error:", error)
      setResult({
        success: false,
        message: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-8">
              <div className="flex items-center justify-center">
                <Eye className="h-8 w-8 text-primary" />
                <span className="ml-2 text-2xl font-bold">App Sensa</span>
              </div>

              <div className="space-y-4 max-w-[800px]">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  See Your Competitors' Next Move Before They Make It
                </h1>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  App Sensa gives you unprecedented visibility into your competitors' strategies, product updates, and
                  market positioning before they go public.
                </p>
              </div>

              {/* <Image
                src="/competitive-intelligence-dashboard.png"
                width={800}
                height={500}
                alt="App Sensa Dashboard Preview"
                className="mx-auto rounded-xl shadow-lg border border-border"
              /> */}

              <Card className="w-full max-w-md mt-8">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-center">Join Our Exclusive Waitlist</h2>
                    <p className="text-center text-muted-foreground">
                      Be among the first to gain this competitive advantage. Limited spots available.
                    </p>

                    {result && (
                      <Alert
                        className={
                          result.success
                            ? "bg-green-50 text-green-800 border-green-200"
                            : "bg-red-50 text-red-800 border-red-200"
                        }
                      >
                        <AlertDescription className="flex items-center gap-2">
                          {result.success && <Check className="h-4 w-4" />}
                          {result.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="w-full"
                        required
                        disabled={isSubmitting}
                      />
                      <Button type="submit" className="w-full gap-1" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            Join Waitlist <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-3 md:gap-12 mt-12">
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Early Detection</h3>
                  <p className="text-muted-foreground">Identify competitors' moves weeks before they launch.</p>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Market Trends</h3>
                  <p className="text-muted-foreground">Spot emerging industry trends before they become mainstream.</p>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Strategic Insights</h3>
                  <p className="text-muted-foreground">
                    Receive actionable recommendations based on competitive intelligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-semibold">App Sensa</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} App Sensa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
