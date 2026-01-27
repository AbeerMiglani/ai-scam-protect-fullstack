import { ScrollText, Radio } from "lucide-react"
import { TranscriptCard } from "./transcript-card"

export function TranscriptFeed({ transcripts, isListening }) {
    return (
        <div className="rounded-lg border border-border bg-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-wider uppercase">Live Transcript</h2>
                </div>

                {isListening && (
                    <div className="flex items-center gap-2 text-neon-green">
                        <Radio className="h-4 w-4 animate-pulse" />
                        <span className="text-xs uppercase tracking-wider">Recording</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {transcripts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4">
                            <ScrollText className="h-6 w-6 opacity-50" />
                        </div>
                        <p className="text-sm text-center">
                            {isListening
                                ? 'Listening for audio...'
                                : 'Start monitoring to capture transcripts'
                            }
                        </p>
                        <p className="text-xs mt-2 opacity-70">
                            Transcript entries will appear here in real-time
                        </p>
                    </div>
                ) : (
                    transcripts.map((item, index) => (
                        <TranscriptCard key={index} item={item} index={index} />
                    ))
                )}
            </div>

            {transcripts.length > 0 && (
                <div className="pt-4 mt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''} captured</span>
                        <span>
                            {transcripts.filter(t => t.is_scam).length} scam{transcripts.filter(t => t.is_scam).length !== 1 ? 's' : ''} detected
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
