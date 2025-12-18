"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description?: string;
  ports: number[];
  icon?: string;
  image?: string;
  color?: string;
  protocol?: "http" | "https";
  tags?: string[];
  healthcheckEnabled?: boolean;
  healthcheckUrl?: string;
  healthcheckExpectedStatus?: number;
  publicUrl?: string;
}

interface Server {
  id: string;
  name: string;
  host: string;
  description?: string;
}

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

// Component to display service icon/image
function ServiceIconDisplay({
  service,
  image,
  icon,
  color,
}: {
  service: Service;
  image?: string;
  icon?: string;
  color?: string;
}) {
  const [imageError, setImageError] = useState(false);

  // Determine what to display: image URL, icon, or default
  const imageUrl = image || (isUrl(icon) ? icon : null);
  const iconEmoji = !isUrl(icon) ? icon : null;

  useEffect(() => {
    setImageError(false);
  }, [image, icon]);

  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
      style={{
        backgroundColor: color ? `${color}15` : "rgba(0, 0, 0, 0.05)",
      }}
    >
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={service.name}
          className="h-full w-full object-contain p-1"
          onError={() => {
            console.error("Failed to load image:", imageUrl);
            setImageError(true);
          }}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      ) : (
        <div className="text-2xl">{iconEmoji || "🔌"}</div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;

  const [server, setServer] = useState<Server | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ports: "",
    icon: "",
    image: "",
    color: "",
    protocol: "http" as "http" | "https",
    tags: "",
    healthcheckEnabled: false,
    healthcheckUrl: "",
    healthcheckExpectedStatus: "",
    publicUrl: "",
  });

  useEffect(() => {
    fetchServer();
    fetchServices();
  }, [serverId]);

  const fetchServer = async () => {
    try {
      const response = await fetch("/api/servers");
      const data = await response.json();
      const found = data.find((s: Server) => s.id === serverId);
      if (found) {
        setServer(found);
      } else {
        router.push("/servers");
      }
    } catch (error) {
      console.error("Error fetching server:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?serverId=${serverId}`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ports = formData.ports
        .split(",")
        .map((p) => parseInt(p.trim()))
        .filter((p) => !isNaN(p));
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Auto-populate healthcheck URL if enabled and not set
      let healthcheckUrl = formData.healthcheckUrl;
      if (formData.healthcheckEnabled && !healthcheckUrl && server && ports.length > 0) {
        healthcheckUrl = `${formData.protocol}://${server.host}:${ports[0]}`;
      }

      const serviceData: any = {
        serverId,
        name: formData.name,
        description: formData.description || undefined,
        ports,
        icon: formData.icon || undefined,
        image: formData.image || undefined,
        color: formData.color || undefined,
        protocol: formData.protocol,
        tags,
        healthcheckEnabled: formData.healthcheckEnabled,
        healthcheckUrl: formData.healthcheckEnabled ? (healthcheckUrl || undefined) : undefined,
        healthcheckExpectedStatus: formData.healthcheckEnabled && formData.healthcheckExpectedStatus
          ? parseInt(formData.healthcheckExpectedStatus)
          : undefined,
        publicUrl: formData.publicUrl || undefined,
      };

      if (editingService) {
        serviceData.id = editingService.id;
      }

      const response = await fetch("/api/services", {
        method: editingService ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        await fetchServices();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    const ports = service.ports.join(", ");
    const defaultHealthcheckUrl = server && service.ports.length > 0
      ? `${service.protocol || "http"}://${server.host}:${service.ports[0]}`
      : "";
    
    setFormData({
      name: service.name,
      description: service.description || "",
      ports,
      icon: service.icon || "",
      image: service.image || "",
      color: service.color || "",
      protocol: service.protocol || "http",
      tags: service.tags?.join(", ") || "",
      healthcheckEnabled: service.healthcheckEnabled || false,
      healthcheckUrl: service.healthcheckUrl || defaultHealthcheckUrl,
      healthcheckExpectedStatus: service.healthcheckExpectedStatus?.toString() || "",
      publicUrl: service.publicUrl || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ports: "",
      icon: "",
      image: "",
      color: "",
      protocol: "http",
      tags: "",
      healthcheckEnabled: false,
      healthcheckUrl: "",
      healthcheckExpectedStatus: "",
      publicUrl: "",
    });
    setEditingService(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!server) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/servers"
            className="mb-4 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Servers
          </Link>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                {server.name} - Services
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {server.host}
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add Service
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Ports (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ports}
                    onChange={(e) =>
                      setFormData({ ...formData, ports: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="8080, 443"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Protocol
                  </label>
                  <select
                    value={formData.protocol}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        protocol: e.target.value as "http" | "https",
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Icon (emoji or URL)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="🎬"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Color (hex)
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="#E5A00D"
                  />
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="healthcheckEnabled"
                    checked={formData.healthcheckEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      let healthcheckUrl = formData.healthcheckUrl;
                      
                      // Auto-populate URL if enabling and URL is empty
                      if (enabled && !healthcheckUrl && server) {
                        const ports = formData.ports
                          .split(",")
                          .map((p) => parseInt(p.trim()))
                          .filter((p) => !isNaN(p));
                        if (ports.length > 0) {
                          healthcheckUrl = `${formData.protocol}://${server.host}:${ports[0]}`;
                        }
                      }
                      
                      setFormData({
                        ...formData,
                        healthcheckEnabled: enabled,
                        healthcheckUrl,
                      });
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <label
                    htmlFor="healthcheckEnabled"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Enable Health Check
                  </label>
                </div>
                {formData.healthcheckEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Health Check URL/Endpoint
                      </label>
                      <input
                        type="url"
                        value={formData.healthcheckUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, healthcheckUrl: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        placeholder="http://192.168.1.100:8080/health"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Expected Status Code
                      </label>
                      <input
                        type="number"
                        value={formData.healthcheckExpectedStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            healthcheckExpectedStatus: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        placeholder="200"
                        min="100"
                        max="599"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Public URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.publicUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, publicUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="https://example.com"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Public-facing URL for this service. A globe icon will appear if specified.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="media, streaming"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {editingService ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                No services configured. Click "Add Service" to get started.
              </p>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-4">
                  <ServiceIconDisplay
                    service={service}
                    image={service.image}
                    icon={service.icon}
                    color={service.color}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {service.description}
                      </p>
                    )}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

