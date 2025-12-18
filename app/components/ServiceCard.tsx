"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceDefinition } from "@/lib/models/Service";

interface ServiceCardProps {
  service: ServiceDefinition;
  host: string;
}

interface HealthStatus {
  healthy: boolean | null;
  status: number | null;
  checking: boolean;
}

interface PublicUrlStatus {
  available: boolean | null;
  checking: boolean;
}

export default function ServiceCard({ service, host }: ServiceCardProps) {
  const primaryPort = service.ports[0];
  const protocol = service.protocol || "http";
  const serviceUrl = `${protocol}://${host}:${primaryPort}`;
  const primaryUrl = service.publicUrl || serviceUrl;
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    healthy: null,
    status: null,
    checking: false,
  });
  const [publicUrlStatus, setPublicUrlStatus] = useState<PublicUrlStatus>({
    available: null,
    checking: false,
  });
  const [imageError, setImageError] = useState(false);

  // Helper to check if a string is a URL
  const isUrl = (str: string | undefined): boolean => {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Determine what to display: image URL, icon, or default
  const getDisplayContent = () => {
    // Priority: image field > icon if it's a URL > icon emoji > default
    const imageUrl = service.image || (isUrl(service.icon) ? service.icon : null);
    const iconEmoji = !isUrl(service.icon) ? service.icon : null;

    if (imageUrl && !imageError) {
      return { type: 'image' as const, value: imageUrl };
    }
    return { type: 'icon' as const, value: iconEmoji || "🔌" };
  };

  const displayContent = getDisplayContent();

  const checkHealth = useCallback(async () => {
    if (!service.healthcheckUrl) return;

    setHealthStatus((prev) => ({ ...prev, checking: true }));
    try {
      const params = new URLSearchParams({
        url: service.healthcheckUrl,
      });
      if (service.healthcheckExpectedStatus) {
        params.append("expectedStatus", service.healthcheckExpectedStatus.toString());
      }

      const response = await fetch(`/api/healthcheck?${params.toString()}`);
      const data = await response.json();
      setHealthStatus({
        healthy: data.healthy,
        status: data.status,
        checking: false,
      });
    } catch (error) {
      setHealthStatus({
        healthy: false,
        status: null,
        checking: false,
      });
    }
  }, [service.healthcheckUrl, service.healthcheckExpectedStatus]);

  const checkPublicUrl = useCallback(async () => {
    if (!service.publicUrl) return;

    setPublicUrlStatus((prev) => ({ ...prev, checking: true }));
    try {
      const params = new URLSearchParams({
        url: service.publicUrl,
      });

      const response = await fetch(`/api/healthcheck?${params.toString()}`);
      const data = await response.json();
      setPublicUrlStatus({
        available: data.healthy,
        checking: false,
      });
    } catch (error) {
      setPublicUrlStatus({
        available: false,
        checking: false,
      });
    }
  }, [service.publicUrl]);

  useEffect(() => {
    // Reset image error when service changes
    setImageError(false);
    
    if (service.healthcheckEnabled && service.healthcheckUrl) {
      checkHealth();
      // Check health every 30 seconds
      const interval = setInterval(checkHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [service.healthcheckEnabled, service.healthcheckUrl, service.healthcheckExpectedStatus, service.image, service.icon, checkHealth]);

  useEffect(() => {
    if (service.publicUrl) {
      checkPublicUrl();
      // Check public URL every 30 seconds
      const interval = setInterval(checkPublicUrl, 30000);
      return () => clearInterval(interval);
    }
  }, [service.publicUrl, checkPublicUrl]);

  const getHealthIndicator = () => {
    if (!service.healthcheckEnabled || !service.healthcheckUrl) return null;

    if (healthStatus.checking) {
      return (
        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-zinc-300 dark:bg-zinc-600">
          <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-500"></div>
        </div>
      );
    }

    if (healthStatus.healthy === true) {
      return (
        <div
          className="h-3 w-3 rounded-full bg-green-500"
          title={`Healthy (Status: ${healthStatus.status})`}
        ></div>
      );
    }

    if (healthStatus.healthy === false) {
      return (
        <div
          className="h-3 w-3 rounded-full bg-red-500"
          title={`Unhealthy (Status: ${healthStatus.status || "Error"})`}
        ></div>
      );
    }

    return null;
  };

  const getPublicUrlIndicator = () => {
    if (!service.publicUrl) return null;

    if (publicUrlStatus.checking) {
      return (
        <svg
          className="h-4 w-4 text-zinc-400 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Checking public URL..."
        >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
        </svg>
      );
    }

    if (publicUrlStatus.available === true) {
      return (
        <div
          className="text-green-500"
          title={`Public URL available: ${service.publicUrl}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
          </svg>
        </div>
      );
    }

    if (publicUrlStatus.available === false) {
      return (
        <div
          className="text-red-500"
          title={`Public URL unavailable: ${service.publicUrl}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <a
      href={primaryUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start gap-4">
        {/* Service Icon/Image */}
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg transition-transform group-hover:scale-110"
          style={{
            backgroundColor: service.color
              ? `${service.color}15`
              : "rgba(0, 0, 0, 0.05)",
          }}
        >
          {displayContent.type === 'image' ? (
            <img
              src={displayContent.value}
              alt={service.name}
              className="h-full w-full object-contain p-1"
              onError={() => {
                console.error("Failed to load image:", displayContent.value);
                setImageError(true);
              }}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <div className="text-2xl">{displayContent.value}</div>
          )}
        </div>

        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white">
              {service.name}
            </h3>
            {getHealthIndicator()}
            {getPublicUrlIndicator()}
          </div>
          {service.description && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {service.description}
            </p>
          )}

          {/* Ports */}
          <div className="mt-3 flex flex-wrap gap-2">
            {service.ports.map((port) => (
              <span
                key={port}
                className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {service.protocol?.toUpperCase() || "HTTP"} :{port}
              </span>
            ))}
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className="shrink-0 flex items-center gap-2">
          {service.publicUrl && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(serviceUrl, '_blank', 'noopener,noreferrer');
              }}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title={`Open local URL: ${serviceUrl}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
            </button>
          )}
          <div className="text-zinc-400 transition-transform group-hover:translate-x-1 dark:text-zinc-500">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}

