"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, Timer } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";

interface SessionTrackerProps {
  userId: Id<"users">;
}

export default function SessionTracker({ userId }: SessionTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const [intensity, setIntensity] = useState(7);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState("");

  const startSession = useMutation(api.functions.startSession);
  const endSession = useMutation(api.functions.endSession);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = async () => {
    try {
      const id = await startSession({
        userId,
        intensity,
        tags: ["manual"],
        mood: "focused",
      });
      setSessionId(id);
      setIsActive(true);
      setDuration(0);
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to start session. Please try again.");
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;
    try {
      await endSession({
        sessionId,
        notes: notes || undefined,
      });
      setIsActive(false);
      setSessionId(null);
      setNotes("");
      setDuration(0);
    } catch (error) {
      console.error("Failed to end session:", error);
      alert("Failed to end session. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-2 border-electric-indigo/30 glow-indigo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Timer className="w-6 h-6 text-electric-indigo" />
          Goon Session Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center py-8">
          <div className="text-7xl font-black text-gradient mb-2 font-mono">
            {formatTime(duration)}
          </div>
          <p className="text-gray-400">
            {isActive ? "Session in progress..." : "Ready to start"}
          </p>
        </div>

        {/* Intensity Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-semibold text-gray-300">
              Intensity Level
            </label>
            <span className="text-sm font-bold text-electric-indigo">
              {intensity}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            disabled={isActive}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${intensity * 10}%, rgba(255,255,255,0.1) ${intensity * 10}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Chill</span>
            <span>Moderate</span>
            <span>Maximum</span>
          </div>
        </div>

        {/* Notes */}
        {isActive && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Session Notes (optional)
            </label>
            <Input
              placeholder="Add notes about this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5"
            />
          </div>
        )}

        {/* Control Button */}
        <div className="flex gap-4">
          {!isActive ? (
            <Button
              onClick={handleStart}
              size="xl"
              className="w-full"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Goon Session
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              variant="destructive"
              size="xl"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Square className="w-5 h-5 mr-2" />
              End Session
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-black text-electric-cyan">
              {Math.floor(duration / 60)}
            </div>
            <div className="text-xs text-gray-500">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-electric-purple">
              {intensity}
            </div>
            <div className="text-xs text-gray-500">Intensity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-electric-indigo">
              {isActive ? "🔴" : "⚪"}
            </div>
            <div className="text-xs text-gray-500">Status</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
