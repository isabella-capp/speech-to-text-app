import { Hero } from "../layout/hero"
import { Footer } from "../layout/footer"
import { LandingHeader } from "../layout/headers/landing-header"


export function LandingPage() {
  return (
    <div className="h-screen bg-white flex flex-col">
      <LandingHeader />

      <main className="flex-1 flex items-center justify-center">
        <Hero />
      </main>

      <Footer />
    </div>
  )
}
