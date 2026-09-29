"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Key, Eye, EyeOff, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ApiKeyEntry {
  id: string;
  name: string;
  prefix: string;
  lastFour: string;
}

export function ApiKeysCard() {
  const { data: session } = useSession();
  const [activeKey, setActiveKey] = useState<ApiKeyEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchFirstKey();
    }
  }, [session]);

  const fetchFirstKey = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/api-keys");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setActiveKey(data[0]); // Just pick the most recent one
        }
      }
    } catch (e) {
      // Keep silent for the dashboard card
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-violet-400" />
              API Keys
            </CardTitle>
            <CardDescription className="mt-1">
              Use your API key to authenticate requests
            </CardDescription>
          </div>
          {activeKey && (
            <Badge
              variant="outline"
              className="border-violet-500/30 bg-violet-500/10 text-violet-400"
            >
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ?
          <div className="py-2 flex justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        : activeKey ?
          <>
            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-black/20 px-4 py-3">
              <code className="flex-1 font-mono text-sm text-foreground tracking-wider">
                {activeKey.prefix}...{activeKey.lastFour}
              </code>
            </div>

            <p className="text-xs text-muted-foreground">
              Name: <span className="text-foreground">{activeKey.name}</span>
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-border/60"
                asChild
              >
                <Link href="/dashboard/api-keys">Manage Keys</Link>
              </Button>
            </div>
          </>
        : <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-4">
              No API keys found.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-border/60"
              asChild
            >
              <Link href="/dashboard/api-keys">
                <Plus className="h-4 w-4" /> Go to API Keys
              </Link>
            </Button>
          </div>
        }
      </CardContent>
    </Card>
  );
}
