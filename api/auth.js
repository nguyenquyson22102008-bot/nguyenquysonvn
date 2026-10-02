export default async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");

    if (request.method !== "POST") {
        return response.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    if (!appsScriptUrl) {
        return response.status(500).json({ ok: false, error: "Server chưa cấu hình Apps Script." });
    }

    const payload = request.body;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return response.status(400).json({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." });
    }
    if (payload.action !== "login" && payload.action !== "register") {
        return response.status(400).json({ ok: false, error: "Yêu cầu không hợp lệ." });
    }

    try {
        const upstream = await fetch(appsScriptUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
            redirect: "follow"
        });
        const result = await upstream.text();
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        return response.status(upstream.ok ? 200 : upstream.status).send(result);
    } catch (error) {
        return response.status(502).json({ ok: false, error: "Không kết nối được dịch vụ đăng ký." });
    }
}
