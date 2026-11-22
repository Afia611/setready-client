type RouteContext = {
  params: Promise<{ id: string }>;
};

async function forward(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Please sign in." }, { status: 401 });
  }

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return Response.json({ message: "Invalid equipment ID." }, { status: 400 });
  }

  const apiUrl = (
    process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(`${apiUrl}/api/owner/equipment/${id}`, {
      method: request.method,
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body: request.method === "PATCH" ? await request.text() : undefined,
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { message: "Could not reach the equipment API." },
      { status: 502 },
    );
  }
}

export const GET = forward;
export const PATCH = forward;
export const DELETE = forward;