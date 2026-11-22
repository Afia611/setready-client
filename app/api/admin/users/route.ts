async function forward(request: Request, path: string) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Please sign in." }, { status: 401 });
  }

  const apiUrl = (
    process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  try {
    const upstream = await fetch(`${apiUrl}${path}`, {
      method: request.method,
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body: request.method === "PATCH" ? await request.text() : undefined,
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
      { message: "Could not reach the server." },
      { status: 502 },
    );
  }
}

export function GET(request: Request) {
  return forward(request, "/api/admin/users");
}

export function PATCH(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
    return Response.json({ message: "Invalid user ID." }, { status: 400 });
  }

  return forward(request, `/api/admin/users/${id}/role`);
}