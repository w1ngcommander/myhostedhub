import { NextRequest, NextResponse } from "next/server";
import {
  getAllServers,
  createServer,
  updateServer,
  deleteServer,
} from "@/lib/db/servers";

export async function GET() {
  try {
    const servers = getAllServers();
    // Convert Server instances to plain objects to ensure proper serialization
    const serversData = servers.map((server) => ({
      id: server.id,
      name: server.name,
      host: server.host,
      description: server.description,
      services: server.services.map((service) => ({
        name: service.name,
        description: service.description,
        ports: service.ports,
        icon: service.icon,
        image: service.image,
        color: service.color,
        protocol: service.protocol,
        tags: service.tags,
        healthcheckEnabled: service.healthcheckEnabled,
        healthcheckUrl: service.healthcheckUrl,
        healthcheckExpectedStatus: service.healthcheckExpectedStatus,
        publicUrl: service.publicUrl,
      })),
    }));
    return NextResponse.json(serversData);
  } catch (error) {
    console.error("Error fetching servers:", error);
    return NextResponse.json(
      { error: "Failed to fetch servers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const server = createServer({
      id: body.id || `server-${Date.now()}`,
      name: body.name,
      host: body.host,
      description: body.description,
    });
    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.error("Error creating server:", error);
    return NextResponse.json(
      { error: "Failed to create server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const server = updateServer(body.id, {
      name: body.name,
      host: body.host,
      description: body.description,
    });
    return NextResponse.json(server);
  } catch (error) {
    console.error("Error updating server:", error);
    return NextResponse.json(
      { error: "Failed to update server" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Server ID is required" },
        { status: 400 }
      );
    }
    deleteServer(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting server:", error);
    return NextResponse.json(
      { error: "Failed to delete server" },
      { status: 500 }
    );
  }
}

