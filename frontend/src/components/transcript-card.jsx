import { AlertOctagon, CheckCircle, AlertTriangle } from "lucide-react"

export function TranscriptCard({ item, index }) {
    const isScam = item.is_scam
    const score = item.scam_score

    const getRiskLevel = () => {
        if (isScam || score >= 70) return 'danger'
        if (score >= 30) return 'warning'
        return 'safe'
    }

    const riskLevel = getRiskLevel()

    const borderColors = {
        safe: 'border-neon-green',
        warning: 'border-neon-amber',
        danger: 'border-neon-red'
    }

    const glowColors = {
        safe: '0 0 10px rgba(34, 197, 94, 0.3)',
        warning: '0 0 10px rgba(245, 158, 11, 0.3)',
        danger: '0 0 15px rgba(239, 68, 68, 0.5), 0 0 30px rgba(239, 68, 68, 0.3)'
    }

    const textColors = {
        safe: 'text-neon-green',
        warning: 'text-neon-amber',
        danger: 'text-neon-red'
    }

    const Icons = {
        safe: CheckCircle,
        warning: AlertTriangle,
        danger: AlertOctagon
    }

    const Icon = Icons[riskLevel]

    return (
        <div
            className={`rounded-lg border-2 ${borderColors[riskLevel]} bg-card p-4 transition-all duration-300`}
            style={{ boxShadow: glowColors[riskLevel] }}
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">#{String(index + 1).padStart(3, '0')}</span>
                    <Icon className={`h-4 w-4 ${textColors[riskLevel]}`} />
                </div>

                <div className="flex items-center gap-2">
                    {isScam && (
                        <span
                            className="px-2 py-0.5 rounded text-xs font-bold bg-neon-red/20 text-neon-red border border-neon-red animate-pulse"
                            style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}
                        >
                            SCAM DETECTED
                        </span>
                    )}
                    <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${textColors[riskLevel]}`}
                        style={{ backgroundColor: `${riskLevel === 'danger' ? 'rgba(239, 68, 68, 0.2)' : riskLevel === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)'}` }}
                    >
                        Risk: {score}%
                    </span>
                </div>
            </div>

            <p className="text-sm text-foreground mb-3 leading-relaxed font-mono">
                {'"'}{item.text}{'"'}
            </p>

            {item.reason && (
                <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        <span className="text-primary font-semibold">ANALYSIS:</span> {item.reason}
                    </p>
                </div>
            )}
        </div>
    )
}
