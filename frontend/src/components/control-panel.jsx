import { Play, Square, Loader2, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ControlPanel({ isListening, isLoading, onStart, onStop }) {
    return (
        <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
                <Terminal className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-wider uppercase">Controls</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={onStart}
                    disabled={isListening || isLoading}
                    className="h-16 bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green/30 hover:text-neon-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                        <Play className="h-5 w-5 mr-2" />
                    )}
                    <span className="font-semibold tracking-wider">START</span>
                </Button>

                <Button
                    onClick={onStop}
                    disabled={!isListening || isLoading}
                    className="h-16 bg-neon-red/20 border border-neon-red text-neon-red hover:bg-neon-red/30 hover:text-neon-red disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                        <Square className="h-5 w-5 mr-2" />
                    )}
                    <span className="font-semibold tracking-wider">STOP</span>
                </Button>
            </div>

            <div className="mt-4 p-3 rounded border border-border bg-secondary/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-neon-green animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="uppercase tracking-wider">
                        {isListening ? 'Monitoring active — analyzing audio stream' : 'System idle — awaiting activation'}
                    </span>
                </div>
            </div>
        </div>
    )
}
