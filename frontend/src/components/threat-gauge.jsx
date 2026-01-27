export function ThreatGauge({ level }) {
    const clampedLevel = Math.max(0, Math.min(100, level))

    const getColor = () => {
        if (clampedLevel < 30) return { stroke: "#22c55e", glow: "0 0 20px #22c55e, 0 0 40px #22c55e" }
        if (clampedLevel < 70) return { stroke: "#f59e0b", glow: "0 0 20px #f59e0b, 0 0 40px #f59e0b" }
        return { stroke: "#ef4444", glow: "0 0 20px #ef4444, 0 0 40px #ef4444" }
    }

    const getLabel = () => {
        if (clampedLevel < 30) return "SAFE"
        if (clampedLevel < 70) return "CAUTION"
        return "DANGER"
    }

    const { stroke, glow } = getColor()

    // Calculate the arc
    const radius = 80
    const circumference = Math.PI * radius // Half circle
    const strokeDashoffset = circumference - (clampedLevel / 100) * circumference

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <svg
                    width="200"
                    height="120"
                    viewBox="0 0 200 120"
                    className="transform"
                >
                    {/* Background arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-secondary"
                    />
                    {/* Foreground arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={stroke}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            filter: `drop-shadow(${glow})`,
                            transition: "stroke-dashoffset 0.5s ease-out, stroke 0.3s ease"
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                    <span
                        className="text-4xl font-bold tabular-nums"
                        style={{ color: stroke, textShadow: glow }}
                    >
                        {Math.round(clampedLevel)}
                    </span>
                    <span className="text-xs text-muted-foreground">THREAT LEVEL</span>
                </div>
            </div>

            <div
                className="px-4 py-1 rounded-full text-sm font-bold tracking-wider"
                style={{
                    backgroundColor: `${stroke}20`,
                    color: stroke,
                    border: `1px solid ${stroke}`,
                    boxShadow: glow
                }}
            >
                {getLabel()}
            </div>
        </div>
    )
}
