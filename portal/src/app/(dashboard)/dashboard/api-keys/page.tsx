"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Copy, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyEntry {
  id: string;
  name: string;
  prefix: string;
  lastFour: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Key Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // New Key Result Modal State
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchKeys();
    }
  }, [session]);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/api-keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the key");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.plainTextKey);
        setIsCreateOpen(false);
        setNewKeyName("");
        fetchKeys();
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Failed to create key");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this key? Any applications using it will stop working immediately.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Key revoked successfully");
        fetchKeys();
      } else {
        toast.error("Failed to revoke key");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const copyKey = async (key: string, id: string = "new-key") => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(id);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 relative">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            API keys
          </h1>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p>
              You have permission to view and manage all API keys in this
              project.
            </p>
            <p>
              Do not share your API key with others or expose it in the browser
              or other client-side code.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          className="gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create new secret key
        </Button>
      </div>

      <div className="rounded-xl border border-border/40 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Secret Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Last Used
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ?
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            : apiKeys.length === 0 ?
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No API keys found. Click &quot;Create new secret key&quot; to generate
                  one.
                </td>
              </tr>
            : apiKeys.map((key) => (
                <tr
                  key={key.id}
                  className="group hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3.5 text-sm font-medium text-foreground">
                    {key.name}
                  </td>
                  <td className="px-4 py-3.5">
                    <code className="font-mono text-sm text-muted-foreground">
                      {key.prefix}...{key.lastFour}
                    </code>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">
                    {key.lastUsedAt ?
                      new Date(key.lastUsedAt).toLocaleDateString()
                    : "Never"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card p-6 rounded-xl border border-border shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create new secret key</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newlyCreatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card p-6 rounded-xl border border-border shadow-xl">
            <h2 className="text-xl font-bold mb-2">Save your secret key</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Please save this secret key somewhere safe. For security reasons,{" "}
              <strong>you won&apos;t be able to view it again</strong> through your
              account. If you lose this key, you&apos;ll need to generate a new one.
            </p>
            <div className="p-3 bg-muted rounded-md border border-border flex items-center gap-3">
              <code className="text-sm break-all flex-1 text-foreground">
                {newlyCreatedKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyKey(newlyCreatedKey)}
              >
                {copiedKey === "new-key" ?
                  <Check className="h-4 w-4 text-green-500" />
                : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-end pt-6">
              <Button onClick={() => setNewlyCreatedKey(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
