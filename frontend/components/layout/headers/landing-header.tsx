import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AudioWaveformIcon as Waveform } from "lucide-react"

export function LandingHeader() {
    return (
        <header className="border-b border-gray-200 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Waveform className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900">SpeechGPT</span>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" className="text-gray-700 rounded-full hover:text-gray-900">
                            <Link href="/auth/login">Log in</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}