"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Flame } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";import { formatDuration } from "@/lib/utils/format";
interface RecentSessionsProps {
  userId: Id<"users">;
}

export default function RecentSessions({ userId }: RecentSessionsProps) {
  const sessions = useQuery(api.functions.getUserSessions, {
    userId,
    limit: 5,
  });

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return "text-red-500";
    if (intensity >= 6) return "text-orange-500";
    if (intensity >= 4) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-electric-cyan" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!sessions || sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No sessions yet</p>
            <p className="text-sm">Start your first goon session above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${getIntensityColor(session.intensity)}`} />
                    <span className="font-semibold">
                      {formatDuration(session.duration)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(session.startTime)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Intensity: </span>
                      <span className={`font-bold ${getIntensityColor(session.intensity)}`}>
                        {session.intensity}/10
                      </span>
                    </div>
                    {session.mood && (
                      <div>
                        <span className="text-gray-500">Mood: </span>
                        <span className="capitalize text-gray-300">
                          {session.mood}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {session.notes && (
                  <p className="mt-2 text-sm text-gray-400 italic">
                    "{session.notes}"
                  </p>
                )}

                {session.tags && session.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {session.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-full bg-electric-indigo/20 text-electric-indigo"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
