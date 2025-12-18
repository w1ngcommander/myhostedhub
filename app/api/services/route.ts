import { NextRequest, NextResponse } from "next/server";
import {
  getServicesByServerId,
  createService,
  updateService,
  deleteService,
} from "@/lib/db/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");
    
    if (!serverId) {
      return NextResponse.json(
        { error: "Server ID is required" },
        { status: 400 }
      );
    }

    const services = getServicesByServerId(serverId);
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    createService(body.serverId, {
      name: body.name,
      description: body.description,
      ports: body.ports || [],
      icon: body.icon,
      image: body.image,
      color: body.color,
      protocol: body.protocol || "http",
      tags: body.tags || [],
      healthcheckEnabled: body.healthcheckEnabled,
      healthcheckUrl: body.healthcheckUrl,
      healthcheckExpectedStatus: body.healthcheckExpectedStatus,
      publicUrl: body.publicUrl,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    updateService(body.id, {
      name: body.name,
      description: body.description,
      ports: body.ports,
      icon: body.icon,
      image: body.image,
      color: body.color,
      protocol: body.protocol,
      tags: body.tags,
      healthcheckEnabled: body.healthcheckEnabled,
      healthcheckUrl: body.healthcheckUrl,
      healthcheckExpectedStatus: body.healthcheckExpectedStatus,
      publicUrl: body.publicUrl,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
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
        { error: "Service ID is required" },
        { status: 400 }
      );
    }
    deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}

