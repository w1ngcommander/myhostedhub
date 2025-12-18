import Server from "@/lib/models/Server";
import ServiceCard from "./ServiceCard";

interface ServerCardProps {
  server: Server;
}

export default function ServerCard({ server }: ServerCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Server Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {server.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {server.host}
            </p>
            {server.description && (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                {server.description}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-3">
        {server.services.length > 0 ? (
          server.services.map((service) => (
            <ServiceCard key={service.name} service={service} host={server.host} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No services configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

