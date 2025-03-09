import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/utils/auth";
import { clients } from "@/app/lib/utils/updates";
import { connectToDB } from "@/app/lib/utils/database";
import Update from "@/app/lib/models/update";

// Define proper interfaces
interface UpdateData {
  title: string;
  content: string;
  type: string;
  date?: Date;
  [key: string]: string | Date | undefined;
}

export async function GET(req: NextRequest): Promise<Response> {
  // Authenticate user
  const auth = authenticateRequest(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Create a unique client ID
  const clientId = crypto.randomUUID();

  // Set up SSE headers
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection message
  writer.write(
    encoder.encode("event: connected\ndata: Connected to server\n\n")
  );

  // Store the client's send method
  clients.set(clientId, {
    send: (data: string) => {
      writer.write(encoder.encode(data));
    },
    userId: auth.user.id,
  });

  // Clean up on disconnect
  req.signal.addEventListener("abort", () => {
    clients.delete(clientId);
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Check if user is admin
    const auth = authenticateRequest(req, "admin");
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();

    // Get update data from request
    const updateData: UpdateData = await req.json();

    // Remove unused variable
    // const clientId = auth.user?.id;

    // Create new update
    const update = new Update({
      ...updateData,
      date: new Date(),
    });

    await update.save();

    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    console.error("Error creating update:", error);
    return NextResponse.json(
      { message: "Error creating update" },
      { status: 500 }
    );
  }
}
