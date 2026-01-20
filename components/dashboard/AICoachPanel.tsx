"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

interface AICoachPanelProps {
  userId: Id<"users">;
}

export default function AICoachPanel({ userId }: AICoachPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<"daily_summary" | "weekly_review" | "performance_tip" | "milestone_celebration" | "streak_motivation">("performance_tip");
  
  const insights = useQuery(api.aiActions.getRecentInsights, { userId, limit: 5 });
  const generateTip = useAction(api.aiActions.generateAICoaching);

  const handleGenerateTip = async (type: typeof selectedType) => {
    setIsGenerating(true);
    try {
      const result = await generateTip({
        userId,
        insightType: type,
      });
      if (result.success) {
        console.log("AI insight generated:", result.content);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to generate tip:", error);
      alert("Failed to generate insight. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const insightTypeLabels = {
    daily_summary: "📊 Daily Summary",
    weekly_review: "📈 Weekly Review",
    performance_tip: "💡 Performance Tip",
    milestone_celebration: "🎉 Celebration",
    streak_motivation: "🔥 Streak Boost",
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-electric-purple" />
          AI Goon Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Insights */}
        <div className="space-y-3">
          {!insights ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-electric-purple" />
            </div>
          ) : insights.length === 0 ? (
            <div className="glass-panel p-4 rounded-xl border border-electric-purple/20 text-center">
              <p className="text-sm text-gray-400">
                No insights yet. Click below to generate your first AI coaching tip!
              </p>
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight._id}
                className="glass-panel p-4 rounded-xl border border-electric-purple/20 hover:border-electric-purple/40 transition-all"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-semibold text-electric-purple">
                    {insightTypeLabels[insight.insightType as keyof typeof insightTypeLabels]}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(insight._creationTime).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{insight.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Generate New Tip */}
        <Button
          onClick={() => handleGenerateTip(selectedType)}
          disabled={isGenerating}
          variant="secondary"
          className="w-full bg-electric-purple/20 hover:bg-electric-purple/30 border border-electric-purple/40"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {insightTypeLabels[selectedType]}
            </>
          )}
        </Button>

        {/* Coaching Categories */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-3">Quick Generate</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(insightTypeLabels) as Array<keyof typeof insightTypeLabels>).slice(0, 4).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  handleGenerateTip(type);
                }}
                disabled={isGenerating}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedType === type
                    ? "bg-electric-purple/30 text-white border border-electric-purple/50"
                    : "glass-panel-hover text-gray-400 hover:text-white"
                } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {insightTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Upgrade Prompt */}
        <div className="glass-panel p-4 rounded-xl border-2 border-electric-indigo/30 bg-gradient-to-br from-electric-indigo/10 to-electric-purple/10">
          <p className="text-sm font-bold mb-2">🚀 Unlock Unlimited AI Insights</p>
          <p className="text-xs text-gray-400 mb-3">
            Upgrade to Pro for 24/7 AI coaching and advanced pattern analysis.
          </p>
          <Button size="sm" className="w-full">
            Upgrade to Pro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
