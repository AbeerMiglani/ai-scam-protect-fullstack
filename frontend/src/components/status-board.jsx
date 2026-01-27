import { Activity, Wifi, WifiOff, Shield, AlertTriangle } from "lucide-react"
import { ThreatGauge } from "./threat-gauge"

export function StatusBoard({ isListening, threatLevel, isConnected }) {
    return (
        <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-wider uppercase">System Status</h2>
            </div>

            <div className="grid gap-6">
                {/* Threat Gauge */}
                <div className="flex justify-center py-4">
                    <ThreatGauge level={threatLevel} />
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Connection Status */}
                    <div className="rounded-lg border border-border bg-secondary/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {isConnected ? (
                                <Wifi className="h-4 w-4 text-neon-green" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-neon-red" />
                            )}
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Backend</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-neon-red'}`}
                                style={{ boxShadow: isConnected ? '0 0 8px #22c55e' : '0 0 8px #ef4444' }}
                            />
                            <span className={`text-sm font-medium ${isConnected ? 'text-neon-green' : 'text-neon-red'}`}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>

                    {/* Monitoring Status */}
                    <div className="rounded-lg border border-border bg-secondary/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {isListening ? (
                                <Activity className="h-4 w-4 text-neon-green" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-neon-amber" />
                            )}
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Monitor</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isListening ? 'bg-neon-green animate-pulse' : 'bg-neon-amber'}`}
                                style={{ boxShadow: isListening ? '0 0 8px #22c55e' : '0 0 8px #f59e0b' }}
                            />
                            <span className={`text-sm font-medium ${isListening ? 'text-neon-green' : 'text-neon-amber'}`}>
                                {isListening ? 'Active' : 'Standby'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
