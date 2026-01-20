"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
}: StatsCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
      ? "text-red-500"
      : "text-gray-500";

  return (
    <Card className="glass-panel-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-gradient mb-1">{value}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendIcon className={`w-3 h-3 ${trendColor}`} />
          <span>{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}
