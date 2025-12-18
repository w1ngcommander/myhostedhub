import Service, { ServiceDefinition } from "./Service";

export interface ServerDefinition {
  id: string;
  name: string;
  host: string;
  description?: string;
  services: ServiceDefinition[];
}

class Server implements ServerDefinition {
  id: string;
  name: string;
  host: string;
  description?: string;
  services: Service[];

  constructor(server: ServerDefinition) {
    this.id = server.id;
    this.name = server.name;
    this.host = server.host;
    this.description = server.description;
    this.services = server.services.map((s) => new Service(s));
  }

  getServiceUrl(service: Service, port: number): string {
    return `${this.host}:${port}`;
  }
}

export default Server;

