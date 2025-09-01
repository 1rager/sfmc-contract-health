function withCors(response, request) {
  const origin = request.headers.get("Origin") || "*";
  // Cria novo Response para garantir que os headers sejam aplicados
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", origin);
  newResponse.headers.set("Vary", "Origin");
  newResponse.headers.set(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, OPTIONS"
  );
  newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
  newResponse.headers.set("Cache-Control", "no-store");
  return newResponse;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), request);
    }

    // Health check
    if (path === "/") {
      return withCors(
        Response.json({
          message: "✅ SFMC Contract Health API is running!",
        }),
        request
      );
    }

    // Lista de tenants
    if (path === "/api/tenants") {
      const { results } = await env.DB.prepare(
        `SELECT id, name, sfmc_subdomain FROM tenants`
      ).all();
      return withCors(Response.json(results), request);
    }

    // Atualiza limites contratuais via PUT
    if (path === "/api/limits" && request.method === "PUT") {
      const body = await request.json();
      await env.DB.prepare(
        `UPDATE org_limits SET
          all_contacts_limit = ?,
          email_push_limit = ?,
          sms_limit = ?,
          whatsapp_limit = ?,
          cloudpages_limit = ?
         WHERE tenant_id = ?`
      )
        .bind(
          body.AllContacts,
          body.Email,
          body.SMS,
          body.WhatsApp,
          body.CloudPages,
          1
        )
        .run();
      return withCors(Response.json({ success: true }), request);
    }

    // Consulta limites + uso atual
    if (path === "/api/limits") {
      const { results } = await env.DB.prepare(
        `SELECT * FROM org_limits WHERE tenant_id = ?`
      )
        .bind(1)
        .all();

      const limitsRaw = results[0] || {};
      const limits = {
        AllContacts: Number(limitsRaw.all_contacts_limit) || 0,
        Email: Number(limitsRaw.email_push_limit) || 0,
        SMS: Number(limitsRaw.sms_limit) || 0,
        WhatsApp: Number(limitsRaw.whatsapp_limit) || 0,
        CloudPages: Number(limitsRaw.cloudpages_limit) || 0,
      };

      // Busca o registro mais recente de uso
      const { results: usageRows } = await env.DB.prepare(
        `SELECT 
          all_contacts as AllContacts,
          email_push_sent as Email,
          sms_sent as SMS,
          whatsapp_sent as WhatsApp,
          cloudpages_prints as CloudPages
         FROM daily_usage WHERE tenant_id = ? ORDER BY date DESC LIMIT 1`
      )
        .bind(1)
        .all();

      const usageRaw = usageRows[0] || {};
      const usage = {
        AllContacts: Number(usageRaw.AllContacts) || 0,
        Email: Number(usageRaw.Email) || 0,
        SMS: Number(usageRaw.SMS) || 0,
        WhatsApp: Number(usageRaw.WhatsApp) || 0,
        CloudPages: Number(usageRaw.CloudPages) || 0,
      };

      return withCors(Response.json({ limits, usage }), request);
    }

    // Histórico de uso para gráfico de evolução
    if (path === "/api/usage") {
      const { results } = await env.DB.prepare(
        `SELECT * FROM daily_usage WHERE tenant_id = ? ORDER BY date ASC LIMIT 30`
      )
        .bind(1)
        .all();
      return withCors(Response.json({ usage: results }), request);
    }

    return withCors(new Response("❌ Not found", { status: 404 }), request);
  },
};
