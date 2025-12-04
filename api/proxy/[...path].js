// api/proxy/[...path].js
import fetch from "node-fetch";

const HOP_BY_HOP = new Set([
  "connection","keep-alive","proxy-authenticate","proxy-authorization","te",
  "trailer","transfer-encoding","upgrade"
]);

export default async function handler(req, res) {
  try {
    const TARGET = process.env.TARGET_URL || "https://api.sbs-brokerz.com";
    const { path } = req.query;
    const pathStr = Array.isArray(path) ? path.join("/") : (path || "");
    const qsObj = { ...req.query }; delete qsObj.path;
    const qs = new URLSearchParams(qsObj).toString();
    const targetUrl = TARGET.replace(/\/+$/,"") + "/" + pathStr + (qs ? `?${qs}` : "");

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });
    }

    const headers = { ...req.headers };
    delete headers.host;
    Object.keys(headers).forEach(h => HOP_BY_HOP.has(h.toLowerCase()) && delete headers[h]);

    const forward = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body && body.length ? body : undefined,
      redirect: "follow"
    });

    forward.headers.forEach((value, name) => {
      if (!HOP_BY_HOP.has(name.toLowerCase())) res.setHeader(name, value);
    });

    // Add CORS so browser accepts response
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.status(forward.status);
    const buf = Buffer.from(await forward.arrayBuffer());
    res.send(buf);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "proxy_error", message: String(err) });
  }
}
