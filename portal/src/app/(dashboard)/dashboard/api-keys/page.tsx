"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Copy, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokeTarget, setRevokeTarget] = useState<ApiKeyEntry | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

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
    } catch {
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
        toast.error("Failed to create key");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      const res = await fetch(`/api/api-keys/${revokeTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Key revoked successfully");
        setRevokeTarget(null);
        fetchKeys();
      } else {
        toast.error("Failed to revoke key");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsRevoking(false);
    }
  };

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="relative px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-h2 font-semibold tracking-tight text-ink">
            API keys
          </h1>
          <div className="mt-2 space-y-1 text-sm text-ink/60">
            <p>Keys authenticate verification calls from your servers.</p>
            <p>Never share a key or expose one in client-side code.</p>
          </div>
        </div>

        <Button
          size="sm"
          className="shrink-0 gap-2 bg-signal text-white hover:bg-signal/90"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create new secret key
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-mist/60">
              {["Name", "Secret Key", "Created", "Last Used", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink/45 ${i === 4 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ink/50">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : apiKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <p className="text-sm text-ink/60">No API keys yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create your first key
                  </Button>
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id} className="transition-colors hover:bg-mist/40">
                  <td className="px-4 py-3.5 text-sm font-medium text-ink">{key.name}</td>
                  <td className="px-4 py-3.5">
                    <code className="font-mono text-sm text-ink/55">
                      {key.prefix}…{key.lastFour}
                    </code>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-ink/60">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-ink/60">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setRevokeTarget(key)}
                      aria-label={`Revoke ${key.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">Create new secret key</DialogTitle>
            <DialogDescription>
              Name it after where it will be used, so a leak is easy to trace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Production API"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-signal text-white hover:bg-signal/90"
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal dialog */}
      <Dialog open={newlyCreatedKey !== null} onOpenChange={() => setNewlyCreatedKey(null)}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">Save your secret key</DialogTitle>
            <DialogDescription>
              Copy it somewhere safe. For security reasons{" "}
              <strong>you won&apos;t see it again</strong> — lose it and you
              generate a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-mist p-3">
            <code className="flex-1 break-all font-mono text-sm text-ink">
              {newlyCreatedKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => newlyCreatedKey && copyKey(newlyCreatedKey)}
              aria-label="Copy key"
            >
              {copied ? <Check className="h-4 w-4 text-verified" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setNewlyCreatedKey(null)}
              className="bg-signal text-white hover:bg-signal/90"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm dialog */}
      <Dialog open={revokeTarget !== null} onOpenChange={() => setRevokeTarget(null)}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">Revoke {revokeTarget?.name}?</DialogTitle>
            <DialogDescription>
              Applications using this key stop working immediately. This cannot
              be undone — you would create a new key instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeTarget(null)}>
              Keep key
            </Button>
            <Button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
