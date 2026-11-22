const apiUrl = (process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000")
  .replace(/\/+$/, "");

async function forward(request: Request, path: string, body?: string) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Sign in as an Admin." }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${apiUrl}${path}`, {
      method: request.method,
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body,
      cache: "no-store",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
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

export function GET(request: Request) {
  return forward(request, "/api/admin/equipment");
}

export async function PATCH(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
    return Response.json({ message: "Invalid equipment ID." }, { status: 400 });
  }

  return forward(request, `/api/admin/equipment/${id}/status`, await request.text());
}