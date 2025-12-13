import { Zap, Bot } from "lucide-react";

export function BargainHeader() {
  return (
    <header className="p-4 border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shadow-glow-primary">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Cascada</h1>
            <p className="text-xs text-muted-foreground font-mono">
              We don't find discounts — we create them
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <span>LIVE NEGOTIATIONS</span>
        </div>
      </div>
    </header>
  );
}