"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ServerCard from "./components/ServerCard";
import Server from "@/lib/models/Server";

export default function Home() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/servers");
      const data = await response.json();
      setServers(data);
    } catch (error) {
      console.error("Error fetching servers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-5xl">
                My Hosted Hub
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Manage and access your self-hosted services
              </p>
            </div>
            <Link
              href="/servers"
              className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Configure Servers
            </Link>
          </div>
        </div>

        {/* Servers Grid */}
        <div className="mx-auto max-w-6xl space-y-8">
          {servers.length > 0 ? (
            servers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                No servers configured.
              </p>
              <Link
                href="/servers"
                className="inline-block rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Add Your First Server
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
