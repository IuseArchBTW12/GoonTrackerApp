"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Download, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function SettingsPage() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Get current user from Convex
  const currentUser = useQuery(api.functions.getCurrentUser, 
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get user settings
  const settings = useQuery(api.userSettings.getUserSettings,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // Mutations
  const updateProfile = useMutation(api.userSettings.updateProfile);
  const updateNotification = useMutation(api.userSettings.updateNotificationSettings);
  const updatePrivacy = useMutation(api.userSettings.updatePrivacySettings);
  const exportData = useQuery(api.userSettings.exportUserData,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const deleteAccount = useMutation(api.userSettings.deleteUserAccount);

  // Initialize form values when user data loads
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        userId: currentUser._id,
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = async (setting: string, currentValue: boolean) => {
    if (!currentUser) return;
    
    try {
      await updateNotification({
        userId: currentUser._id,
        setting,
        enabled: !currentValue,
      });
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };

  const togglePrivacy = async (setting: string, currentValue: boolean) => {
    if (!currentUser) return;
    
    try {
      await updatePrivacy({
        userId: currentUser._id,
        setting,
        enabled: !currentValue,
      });
    } catch (error) {
      console.error("Failed to update privacy:", error);
    }
  };

  const handleExportData = () => {
    if (!exportData) return;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `goontracker-data-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    const confirmed = confirm(
      "⚠️ WARNING: This will permanently delete your account and ALL data (sessions, stats, AI insights, chat history). This CANNOT be undone!\n\nType 'DELETE' to confirm:"
    );
    
    if (confirmed) {
      const doubleConfirm = prompt("Type 'DELETE' to confirm account deletion:");
      if (doubleConfirm === "DELETE") {
        try {
          await deleteAccount({ userId: currentUser._id });
          // Redirect to sign out
          window.location.href = "/api/auth/signout";
        } catch (error) {
          console.error("Failed to delete account:", error);
          alert("Failed to delete account. Please try again or contact support.");
        }
      }
    }
  };

  if (!currentUser || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-electric-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gradient mb-2">
          Settings ⚙️
        </h1>
        <p className="text-gray-400">
          Manage your account, preferences, and subscription.
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-electric-indigo" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.imageUrl}
              alt={user?.firstName || "User"}
              className="w-20 h-20 rounded-full ring-4 ring-electric-indigo/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">
                Display Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-20 px-4 py-3 rounded-2xl glass-panel border border-white/10 bg-white/5 resize-none focus:ring-2 focus:ring-electric-indigo"
              placeholder="Tell other gooners about yourself..."
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-electric-purple" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "sessionReminders",
              title: "Session Reminders",
              description: "Get notified when it's time for your next session",
              enabled: settings.notifications.sessionReminders,
            },
            {
              key: "streakAlerts",
              title: "Streak Alerts",
              description: "Never break your streak with timely reminders",
              enabled: settings.notifications.streakAlerts,
            },
            {
              key: "leaderboardUpdates",
              title: "Leaderboard Updates",
              description: "Get notified when you move up in rankings",
              enabled: settings.notifications.leaderboardUpdates,
            },
            {
              key: "aiCoachInsights",
              title: "AI Coach Insights",
              description: "Receive daily AI-generated performance tips",
              enabled: settings.notifications.aiCoachInsights,
            },
            {
              key: "achievementUnlocks",
              title: "Achievement Unlocks",
              description: "Celebrate when you hit new milestones",
              enabled: settings.notifications.achievementUnlocks,
            },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-4 glass-panel rounded-xl"
            >
              <div className="flex-1">
                <p className="font-semibold">{setting.title}</p>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
              <button
                onClick={() => toggleNotification(setting.key, setting.enabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  setting.enabled ? "bg-electric-indigo" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    setting.enabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-electric-cyan" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "profileVisibility",
              title: "Profile Visibility",
              description: "Make your profile visible on leaderboards",
              enabled: settings.privacy.profileVisibility,
            },
            {
              key: "showStatsPublicly",
              title: "Show Stats Publicly",
              description: "Allow others to see your session statistics",
              enabled: settings.privacy.showStatsPublicly,
            },
            {
              key: "anonymousMode",
              title: "Anonymous Mode",
              description: "Hide your identity from other users",
              enabled: settings.privacy.anonymousMode,
            },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-4 glass-panel rounded-xl"
            >
              <div className="flex-1">
                <p className="font-semibold">{setting.title}</p>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
              <button
                onClick={() => togglePrivacy(setting.key, setting.enabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  setting.enabled ? "bg-electric-cyan" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    setting.enabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="border-2 border-electric-indigo/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-electric-indigo" />
            Subscription & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="glass-panel p-6 rounded-xl bg-gradient-to-br from-electric-indigo/20 to-electric-purple/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-black text-gradient">FREE TIER</p>
                <p className="text-sm text-gray-400">Limited features</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">$0</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            </div>
            <Button size="lg" className="w-full">
              🚀 Upgrade to Pro - $9.99/month
            </Button>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Pro Features Include:</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-electric-indigo">✓</span>
                Unlimited AI coaching insights
              </li>
              <li className="flex items-center gap-2">
                <span className="text-electric-indigo">✓</span>
                Advanced analytics & pattern detection
              </li>
              <li className="flex items-center gap-2">
                <span className="text-electric-indigo">✓</span>
                Create private competitions with friends
              </li>
              <li className="flex items-center gap-2">
                <span className="text-electric-indigo">✓</span>
                Priority support & early access to features
              </li>
              <li className="flex items-center gap-2">
                <span className="text-electric-indigo">✓</span>
                Custom session tags & advanced filters
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 glass-panel rounded-xl">
            <div>
              <p className="font-semibold">Export Your Data</p>
              <p className="text-sm text-gray-400">
                Download all your session data
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 glass-panel rounded-xl">
            <div>
              <p className="font-semibold text-red-500">Delete Account</p>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
