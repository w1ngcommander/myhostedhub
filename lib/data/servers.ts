import Server, { ServerDefinition } from "../models/Server";
import { ServiceDefinition } from "../models/Service";

// Common service icons (using emoji for simplicity, can be replaced with images)
const serviceIcons: Record<string, string> = {
  plex: "🎬",
  apache: "🌐",
  nginx: "⚡",
  docker: "🐳",
  portainer: "📦",
  grafana: "📊",
  prometheus: "📈",
  jenkins: "🔧",
  gitlab: "🦊",
  nextcloud: "☁️",
  default: "🔌",
};

const serversData: ServerDefinition[] = [
  {
    id: "server-1",
    name: "Media Server",
    host: "192.168.1.100",
    description: "Main media and entertainment server",
    services: [
      {
        name: "Plex Media Server",
        description: "Stream your media collection",
        ports: [32400],
        icon: serviceIcons.plex,
        color: "#E5A00D",
        protocol: "http",
        tags: ["media", "streaming"],
      },
      {
        name: "Apache Web Server",
        description: "Hosting multiple sites",
        ports: [80, 443],
        icon: serviceIcons.apache,
        color: "#D22128",
        protocol: "https",
        tags: ["web", "hosting"],
      },
    ],
  },
  {
    id: "server-2",
    name: "Development Server",
    host: "192.168.1.101",
    description: "Development and CI/CD services",
    services: [
      {
        name: "Portainer",
        description: "Docker container management",
        ports: [9000],
        icon: serviceIcons.portainer,
        color: "#13BEF9",
        protocol: "http",
        tags: ["docker", "management"],
      },
      {
        name: "Jenkins",
        description: "CI/CD automation",
        ports: [8080],
        icon: serviceIcons.jenkins,
        color: "#D24939",
        protocol: "http",
        tags: ["ci/cd", "automation"],
      },
      {
        name: "Grafana",
        description: "Monitoring and dashboards",
        ports: [3000],
        icon: serviceIcons.grafana,
        color: "#F46800",
        protocol: "http",
        tags: ["monitoring", "dashboards"],
      },
    ],
  },
  {
    id: "server-3",
    name: "Storage Server",
    host: "192.168.1.102",
    description: "File storage and backup",
    services: [
      {
        name: "Nextcloud",
        description: "Self-hosted cloud storage",
        ports: [80, 443],
        icon: serviceIcons.nextcloud,
        color: "#0082C9",
        protocol: "https",
        tags: ["storage", "cloud"],
      },
    ],
  },
];

export function getServers(): Server[] {
  return serversData.map((server) => new Server(server));
}

export function getServerById(id: string): Server | undefined {
  const serverData = serversData.find((s) => s.id === id);
  return serverData ? new Server(serverData) : undefined;
}

