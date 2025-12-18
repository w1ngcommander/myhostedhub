import { getDatabase } from "./database";
import { ServiceDefinition } from "../models/Service";

export interface ServiceWithId extends ServiceDefinition {
  id: string;
}

export function getServicesByServerId(serverId: string): ServiceWithId[] {
  const db = getDatabase();
  const services = db
    .prepare("SELECT * FROM services WHERE server_id = ?")
    .all(serverId) as any[];

  return services.map((s) => ({
    id: s.id,
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
}

export function createService(
  serverId: string,
  service: Omit<ServiceDefinition, "ports"> & { ports: number[] }
): void {
  const db = getDatabase();
  const id = `${serverId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  db.prepare(
    `INSERT INTO services (id, server_id, name, description, ports, icon, image, color, protocol, tags, healthcheck_enabled, healthcheck_url, healthcheck_expected_status, public_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    serverId,
    service.name,
    service.description || null,
    JSON.stringify(service.ports),
    service.icon || null,
    service.image || null,
    service.color || null,
    service.protocol || "http",
    service.tags ? JSON.stringify(service.tags) : null,
    service.healthcheckEnabled ? 1 : 0,
    service.healthcheckUrl || null,
    service.healthcheckExpectedStatus || null,
    service.publicUrl || null
  );
}

export function updateService(
  id: string,
  service: Partial<Omit<ServiceDefinition, "ports"> & { ports?: number[] }>
): void {
  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (service.name !== undefined) {
    updates.push("name = ?");
    values.push(service.name);
  }
  if (service.description !== undefined) {
    updates.push("description = ?");
    values.push(service.description || null);
  }
  if (service.ports !== undefined) {
    updates.push("ports = ?");
    values.push(JSON.stringify(service.ports));
  }
  if (service.icon !== undefined) {
    updates.push("icon = ?");
    values.push(service.icon || null);
  }
  if (service.image !== undefined) {
    updates.push("image = ?");
    values.push(service.image || null);
  }
  if (service.color !== undefined) {
    updates.push("color = ?");
    values.push(service.color || null);
  }
  if (service.protocol !== undefined) {
    updates.push("protocol = ?");
    values.push(service.protocol);
  }
  if (service.tags !== undefined) {
    updates.push("tags = ?");
    values.push(service.tags ? JSON.stringify(service.tags) : null);
  }
  if (service.healthcheckEnabled !== undefined) {
    updates.push("healthcheck_enabled = ?");
    values.push(service.healthcheckEnabled ? 1 : 0);
  }
  if (service.healthcheckUrl !== undefined) {
    updates.push("healthcheck_url = ?");
    values.push(service.healthcheckUrl || null);
  }
  if (service.healthcheckExpectedStatus !== undefined) {
    updates.push("healthcheck_expected_status = ?");
    values.push(service.healthcheckExpectedStatus || null);
  }
  if (service.publicUrl !== undefined) {
    updates.push("public_url = ?");
    values.push(service.publicUrl || null);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE services SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );
  }
}

export function deleteService(id: string): void {
  const db = getDatabase();
  db.prepare("DELETE FROM services WHERE id = ?").run(id);
}

export function getServiceById(id: string): ServiceDefinition | undefined {
  const db = getDatabase();
  const service = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as any;

  if (!service) {
    return undefined;
  }

  return {
    name: service.name,
    description: service.description || undefined,
    ports: JSON.parse(service.ports),
    icon: service.icon || undefined,
    image: service.image || undefined,
    color: service.color || undefined,
    protocol: (service.protocol || "http") as "http" | "https",
    tags: service.tags ? JSON.parse(service.tags) : undefined,
    healthcheckEnabled: service.healthcheck_enabled ? Boolean(service.healthcheck_enabled) : undefined,
    healthcheckUrl: service.healthcheck_url || undefined,
    healthcheckExpectedStatus: service.healthcheck_expected_status || undefined,
    publicUrl: service.public_url || undefined,
  };
}

