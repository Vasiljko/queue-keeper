import { useState, useEffect, useRef } from "react";
import { Mail, CheckCircle2, XCircle, Loader2, Bot, Building2 } from "lucide-react";

interface Message {
  from: "agent" | "retailer";
  content: string;
}

interface AgentPanelProps {
  agentId: number;
  retailerName: string;
  retailerEmail: string;
  product: string;
  isRunning: boolean;
  onComplete: (agentId: number, success: boolean, discount?: number) => void;
  willSucceed: boolean;
  finalDiscount?: number;
  hardcodedRetailerResponse?: string;
  startDelay: number;
  shouldHide: boolean;
  typingSpeed: number;
}

type Status = "idle" | "connecting" | "negotiating" | "success" | "failed";

const getRetailerResponse = (round: number, retailerName: string, finalDiscount: number): string => {
  const responses: Record<number, string[]> = {
    1: [
      `Dear Cascada,

Thank you for reaching out. Your proposal is interesting, but 10% is quite aggressive for our margins.

We could consider 3% for this volume. Would that work for your group?

Best regards,
${retailerName} Procurement`,
      `Dear Cascada Team,

We've reviewed your bulk purchase inquiry. While we appreciate the volume commitment, our standard bulk discount is 4%.

Please let us know if this is acceptable.

Regards,
${retailerName} Sales`,
    ],
    2: [
      `Dear Cascada,

I understand your position. Given the guaranteed payment terms you mentioned, I can push this to ${Math.max(finalDiscount - 2, 3)}%.

This is the best I can do without escalating to management.

Best,
${retailerName} Team`,
      `Dear Cascada,

After internal discussion, we can improve our offer to ${Math.max(finalDiscount - 1, 4)}%.

The quick payment guarantee does add value from our perspective.

Regards,
${retailerName}`,
    ],
    3: [
      `Dear Cascada,

Your persistence is noted. I've spoken with our director.

We can confirm ${finalDiscount}% off MSRP for this order. This is our final offer.

Please confirm to proceed with the purchase agreement.

Best regards,
${retailerName} Management`,
      `Dear Cascada Team,

Given the volume and payment terms, we're prepared to offer ${finalDiscount}% discount.

I'll have our team prepare the documentation upon your confirmation.

Regards,
${retailerName} Procurement`,
    ],
  };

  const options = responses[round] || responses[3];
  return options[Math.floor(Math.random() * options.length)];
};

const getAgentMessage = (round: number, retailerName: string, product: string): string => {
  if (round === 0) {
    return `Dear ${retailerName} Team,

I am reaching out on behalf of Cascada, a verified collective purchasing organization. We currently represent 47 qualified buyers interested in ${product}.

We propose a 10% discount off MSRP with guaranteed payment within 48 hours.

Would you be open to this arrangement?

Best regards,
Cascada Procurement Team`;
  } else if (round === 1) {
    return `Dear ${retailerName},

Thank you for your response. We understand your margin constraints.

However, with 47 guaranteed units and immediate payment, we believe 8% would be mutually beneficial. This reduces your inventory risk significantly.

Can we meet in the middle?

Best regards,
Cascada Procurement Team`;
  } else {
    return `Dear ${retailerName},

We appreciate your flexibility. After consulting with our buyers, we can accept your offer.

Please proceed with the purchase agreement. Our payment will be processed within 48 hours of confirmation.

Best regards,
Cascada Procurement Team`;
  }
};

export function AgentPanel({
  agentId,
  retailerName,
  retailerEmail,
  product,
  isRunning,
  onComplete,
  willSucceed,
  finalDiscount,
  hardcodedRetailerResponse,
  startDelay,
  shouldHide,
  typingSpeed,
}: AgentPanelProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [currentTyping, setCurrentTyping] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFailing, setIsFailing] = useState(false);
  const [typingFrom, setTypingFrom] = useState<"agent" | "retailer">("agent");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasCompletedRef = useRef(false);
  const isRunningRef = useRef(false);

  const getSpeedMultiplier = () => typingSpeed;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, currentTyping]);

  useEffect(() => {
    if (!isRunning && isRunningRef.current) {
      setStatus("idle");
      setVisibleMessages([]);
      setCurrentTyping("");
      setIsTyping(false);
      setIsFailing(false);
      hasCompletedRef.current = false;
      isRunningRef.current = false;
    }
  }, [isRunning]);

  const typeMessage = async (content: string, from: "agent" | "retailer", speed: number, cancelled: () => boolean) => {
    setTypingFrom(from);
    setIsTyping(true);
    const words = content.split(" ");
    let typed = "";

    for (const word of words) {
      if (cancelled()) return false;
      typed += (typed ? " " : "") + word;
      setCurrentTyping(typed);
      await new Promise(resolve => setTimeout(resolve, (40 + Math.random() * 40) / speed));
    }

    if (cancelled()) return false;
    setIsTyping(false);
    setCurrentTyping("");
    setVisibleMessages(prev => [...prev, { from, content }]);
    await new Promise(resolve => setTimeout(resolve, 400 / speed));
    return true;
  };

  useEffect(() => {
    if (!isRunning || isRunningRef.current || hasCompletedRef.current) {
      return;
    }

    isRunningRef.current = true;
    let cancelled = false;
    const isCancelled = () => cancelled;
    const speed = getSpeedMultiplier();

    const runSequence = async () => {
      await new Promise(resolve => setTimeout(resolve, startDelay / speed));
      if (cancelled) return;

      setStatus("connecting");

      await new Promise(resolve => setTimeout(resolve, 1200 / speed));
      if (cancelled) return;

      setStatus("negotiating");

      const totalRounds = willSucceed ? 2 + Math.floor(Math.random() * 3) : 1;

      for (let round = 0; round < totalRounds; round++) {
        if (cancelled) return;

        const agentMessage = getAgentMessage(round, retailerName, product);
        if (cancelled) return;

        if (!await typeMessage(agentMessage, "agent", speed, isCancelled)) return;

        await new Promise(resolve => setTimeout(resolve, (800 + Math.random() * 400) / speed));
        if (cancelled) return;

        let retailerMessage: string;

        if (!willSucceed && hardcodedRetailerResponse) {
          retailerMessage = hardcodedRetailerResponse;
        } else if (willSucceed) {
          if (round === totalRounds - 1) {
            retailerMessage = `Dear Cascada,

Excellent. We have an agreement.

${finalDiscount}% discount confirmed for 47 units of ${product}. Our team will prepare the purchase agreement immediately.

We look forward to a successful partnership.

Best regards,
${retailerName} Procurement`;
          } else {
            retailerMessage = getRetailerResponse(round + 1, retailerName, finalDiscount || 5);
          }
        } else {
          retailerMessage = hardcodedRetailerResponse || "We cannot proceed at this time.";
        }

        if (!await typeMessage(retailerMessage, "retailer", speed, isCancelled)) return;

        await new Promise(resolve => setTimeout(resolve, (600 + Math.random() * 400) / speed));
      }

      if (cancelled) return;

      await new Promise(resolve => setTimeout(resolve, 800 / speed));
      if (cancelled) return;

      if (!willSucceed) {
        setIsFailing(true);
        await new Promise(resolve => setTimeout(resolve, 800 / speed));
        if (cancelled) return;
        setIsFailing(false);
        setStatus("failed");
      } else {
        setStatus("success");
      }

      hasCompletedRef.current = true;
      onComplete(agentId, willSucceed, finalDiscount);
    };

    runSequence();

    return () => {
      cancelled = true;
    };
  }, [isRunning, agentId, retailerName, product, willSucceed, finalDiscount, hardcodedRetailerResponse, startDelay, typingSpeed, onComplete]);

  if (shouldHide && status === "failed") {
    return null;
  }

  const getStatusBadge = () => {
    switch (status) {
      case "idle":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono uppercase tracking-wider bg-muted text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            Standby
          </span>
        );
      case "connecting":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono uppercase tracking-wider bg-primary/20 text-primary">
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting
          </span>
        );
      case "negotiating":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono uppercase tracking-wider bg-primary/20 text-primary shadow-glow-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Negotiating
          </span>
        );
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono uppercase tracking-wider bg-green-500/20 text-green-500">
            <CheckCircle2 className="w-3 h-3" />
            Deal: {finalDiscount}% OFF
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono uppercase tracking-wider bg-destructive/20 text-destructive">
            <XCircle className="w-3 h-3" />
            No Deal
          </span>
        );
    }
  };

  const panelClass = status === "success"
    ? "bg-card/80 backdrop-blur-xl border border-green-500/50 rounded-lg shadow-[0_0_30px_hsl(142_76%_45%/0.4)]"
    : isFailing
    ? "bg-card/80 backdrop-blur-xl border border-destructive rounded-lg bg-destructive/10 shadow-[0_0_30px_hsl(0_72%_51%/0.3)]"
    : status === "failed"
    ? "bg-card/80 backdrop-blur-xl border border-destructive/30 rounded-lg opacity-60"
    : status === "negotiating"
    ? "bg-card/80 backdrop-blur-xl border border-primary/30 rounded-lg shadow-glow-primary"
    : "bg-card/80 backdrop-blur-xl border border-border rounded-lg";

  return (
    <div className={`${panelClass} p-4 h-full flex flex-col transition-all duration-300 overflow-hidden`}>
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary">Agent #{agentId}</p>
            <p className="text-[10px] text-muted-foreground font-mono">CASCADA</p>
          </div>
        </div>

        <div className="text-muted-foreground text-xs font-mono px-2">↔</div>

        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs font-semibold text-foreground text-right">{retailerName}</p>
            <p className="text-[10px] text-muted-foreground font-mono text-right">{retailerEmail}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <span className="text-[10px] font-mono text-muted-foreground">PRODUCT: </span>
          <span className="text-[10px] font-mono text-primary">{product}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 scrollbar-hide">
        {visibleMessages.map((msg, idx) => (
          <div
            key={idx}
            className="animate-slide-up"
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div
              className={`rounded-lg p-3 text-xs ${
                msg.from === "agent"
                  ? "bg-primary/10 border border-primary/20 mr-4"
                  : "bg-secondary border border-border ml-4"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {msg.from === "agent" ? (
                  <Bot className="w-3 h-3 text-primary" />
                ) : (
                  <Mail className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="font-mono text-muted-foreground text-[10px]">
                  {msg.from === "agent" ? "CASCADA" : retailerEmail}
                </span>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && currentTyping && (
          <div className={`animate-fade-in ${typingFrom === "agent" ? "mr-4" : "ml-4"}`}>
            <div className={`rounded-lg p-3 text-xs ${
              typingFrom === "agent"
                ? "bg-primary/10 border border-primary/20"
                : "bg-secondary border border-border"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {typingFrom === "agent" ? (
                  <Bot className="w-3 h-3 text-primary" />
                ) : (
                  <Mail className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="font-mono text-muted-foreground text-[10px]">
                  {typingFrom === "agent" ? "CASCADA" : retailerEmail}
                </span>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {currentTyping}
                <span className="animate-pulse">▋</span>
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}