export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Sign in as an Owner." }, { status: 401 });
  }

  const apiUrl = (process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000")
    .replace(/\/+$/, "");

  try {
    const upstream = await fetch(`${apiUrl}/api/owner/equipment`, {
      method: "POST",
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body: await request.text(),
      cache: "no-store",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ message: "Could not reach the equipment API." }, { status: 502 });
  }
}