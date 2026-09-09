"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ItemCard } from "@/components/items/item-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton-card";
import { toast } from "@/components/ui/toaster";
import {
  getDigestSettings,
  updateDigestSettings,
  generateDigest,
} from "@/lib/api";
import { type Item, type DigestFrequency } from "@/types";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Mail,
  MailX,
  Clock,
} from "lucide-react";

const FREQUENCY_OPTIONS: { value: DigestFrequency; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "biweekly", label: "Every 2 weeks" },
];

export default function DigestPage() {
  const { user, getJwt } = useAuth();
  const [jwt, setJwt] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Settings state
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<DigestFrequency>("daily");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Generate state
  const [items, setItems] = useState<Item[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Load JWT
  useEffect(() => {
    if (user && !jwt) getJwt().then(setJwt);
  }, [user, jwt, getJwt]);

  // Load settings
  useEffect(() => {
    if (!jwt) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettingsLoading(true);
    getDigestSettings(jwt)
      .then((s) => {
        setEnabled(s.enabled);
        setFrequency(s.frequency);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, [jwt]);

  // Save settings
  const saveSettings = async (patch: {
    enabled?: boolean;
    frequency?: DigestFrequency;
  }) => {
    if (!jwt) return;
    setSettingsSaving(true);
    try {
      const updated = await updateDigestSettings(jwt, patch);
      setEnabled(updated.enabled);
      setFrequency(updated.frequency);
      toast({ title: "Settings saved", variant: "success" });
    } catch {
      toast({ title: "Failed to save settings", variant: "error" });
    } finally {
      setSettingsSaving(false);
    }
  };

  // Generate digest
  const handleGenerate = async () => {
    if (!jwt) return;
    setGenerating(true);
    try {
      const result = await generateDigest(jwt);
      setItems(result.items);
      setGenerated(true);
      toast({
        title: `Found ${result.count} items for you`,
        variant: "success",
      });
    } catch {
      toast({ title: "Failed to generate digest", variant: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const handleItemClick = (item: Item) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 lg:pl-64">
        <Header viewMode={viewMode} onViewModeChange={setViewMode} />
        <main className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto pt-16 sm:pt-6">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="w-5 h-5 text-[#1F8932] dark:text-[#5CC061]" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Daily Digest</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get personalized recommendations from your saved content.
            </p>
          </div>

          {/* Settings card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Digest Settings
            </h2>

            {settingsLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading settings...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {enabled ? (
                      <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <MailX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Enable digest
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Receive resurfaced content recommendations
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => saveSettings({ enabled: !enabled })}
                    disabled={settingsSaving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enabled ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Frequency selector */}
                {enabled && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Frequency
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          How often to generate recommendations
                        </p>
                      </div>
                    </div>
                    <select
                      value={frequency}
                      onChange={(e) =>
                        saveSettings({
                          frequency: e.target.value as DigestFrequency,
                        })
                      }
                      disabled={settingsSaving}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#5CC061]"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generate button */}
          <div className="mb-6">
            <button
              onClick={handleGenerate}
              disabled={generating || !jwt}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#5CC061] hover:bg-[#1F8932] text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {generating
                ? "Generating..."
                : generated
                  ? "Regenerate Digest"
                  : "Generate Digest"}
            </button>
          </div>

          {/* Generated items */}
          {generated && items.length === 0 && (
            <EmptyState
              title="No recommendations yet"
              description="Try saving more content — the digest surfaces items you haven't engaged with recently."
            />
          )}

          {generating && <SkeletonList rows={6} viewMode={viewMode} />}

          {items.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
                  : "flex flex-col gap-3"
              }
            >
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}

          {/* Initial state */}
          {!generated && items.length === 0 && !generating && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-950 dark:to-green-950 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#1F8932] dark:text-[#5CC061]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Ready to rediscover?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Click &quot;Generate Digest&quot; to get AI-powered
                recommendations from your saved content.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
