export interface ServiceDefinition {
  name: string;
  description?: string;
  ports: number[];
  image?: string;
  icon?: string;
  color?: string;
  tags?: string[];
  protocol?: "http" | "https";
  healthcheckEnabled?: boolean;
  healthcheckUrl?: string;
  healthcheckExpectedStatus?: number;
  publicUrl?: string;
}

class Service implements ServiceDefinition {
  name: string;
  description?: string;
  ports: number[];
  image?: string;
  icon?: string;
  color?: string;
  tags?: string[];
  protocol?: "http" | "https";
  healthcheckEnabled?: boolean;
  healthcheckUrl?: string;
  healthcheckExpectedStatus?: number;
  publicUrl?: string;

  constructor(service: ServiceDefinition) {
    this.name = service.name;
    this.description = service.description;
    this.ports = service.ports;
    this.image = service.image;
    this.icon = service.icon;
    this.color = service.color;
    this.tags = service.tags;
    this.protocol = service.protocol || "http";
    this.healthcheckEnabled = service.healthcheckEnabled;
    this.healthcheckUrl = service.healthcheckUrl;
    this.healthcheckExpectedStatus = service.healthcheckExpectedStatus;
    this.publicUrl = service.publicUrl;
  }

  getUrl(host: string, port: number): string {
    return `${this.protocol}://${host}:${port}`;
  }
}

export default Service;