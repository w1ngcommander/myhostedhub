import { getDatabase } from "./database";
import Server, { ServerDefinition } from "../models/Server";
import { ServiceDefinition } from "../models/Service";

export function getAllServers(): Server[] {
  const db = getDatabase();
  const servers = db.prepare("SELECT * FROM servers ORDER BY name").all() as any[];
  const services = db.prepare("SELECT * FROM services").all() as any[];

  return servers.map((server) => {
    const serverServices = services
      .filter((s) => s.server_id === server.id)
      .map((s) => ({
        name: s.name,
        description: s.description || undefined,
        ports: JSON.parse(s.ports),
        icon: s.icon || undefined,
        image: s.image || undefined,
        color: s.color || undefined,
        protocol: (s.protocol || "http") as "http" | "https",
        tags: s.tags ? JSON.parse(s.tags) : undefined,
        healthcheckEnabled: s.healthcheck_enabled ? Boolean(s.healthcheck_enabled) : undefined,
        healthcheckUrl: s.healthcheck_url || undefined,
        healthcheckExpectedStatus: s.healthcheck_expected_status || undefined,
        publicUrl: s.public_url || undefined,
      }));

    return new Server({
      id: server.id,
      name: server.name,
      host: server.host,
      description: server.description || undefined,
      services: serverServices,
    });
  });
}

export function getServerById(id: string): Server | undefined {
  const db = getDatabase();
  const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(id) as any;

  if (!server) {
    return undefined;
  }

  const services = db
    .prepare("SELECT * FROM services WHERE server_id = ?")
    .all(id) as any[];

  const serverServices = services.map((s) => ({
    name: s.name,
    description: s.description || undefined,
    ports: JSON.parse(s.ports),
    icon: s.icon || undefined,
    image: s.image || undefined,
    color: s.color || undefined,
    protocol: (s.protocol || "http") as "http" | "https",
    tags: s.tags ? JSON.parse(s.tags) : undefined,
    healthcheckEnabled: s.healthcheck_enabled ? Boolean(s.healthcheck_enabled) : undefined,
    healthcheckUrl: s.healthcheck_url || undefined,
    healthcheckExpectedStatus: s.healthcheck_expected_status || undefined,
  }));

  return new Server({
    id: server.id,
    name: server.name,
    host: server.host,
    description: server.description || undefined,
    services: serverServices,
  });
}

export function createServer(server: Omit<ServerDefinition, "services">): Server {
  const db = getDatabase();
  db.prepare(
    "INSERT INTO servers (id, name, host, description) VALUES (?, ?, ?, ?)"
  ).run(server.id, server.name, server.host, server.description || null);

  return getServerById(server.id)!;
}

export function updateServer(
  id: string,
  server: Partial<Omit<ServerDefinition, "id" | "services">>
): Server {
  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (server.name !== undefined) {
    updates.push("name = ?");
    values.push(server.name);
  }
  if (server.host !== undefined) {
    updates.push("host = ?");
    values.push(server.host);
  }
  if (server.description !== undefined) {
    updates.push("description = ?");
    values.push(server.description || null);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE servers SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );
  }

  return getServerById(id)!;
}

export function deleteServer(id: string): void {
  const db = getDatabase();
  db.prepare("DELETE FROM servers WHERE id = ?").run(id);
}

