import { supabaseAdmin, BUCKET } from "../../lib/supabase.js";
import { randomUUID } from "node:crypto";

const MAX_SIZE = 50 * 1024 * 1024;
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  try {
    const { name, size, type } = req.body || {};
    if (!name || !Number.isFinite(size) || size <= 0 || size > MAX_SIZE)
      return res.status(400).json({ error: "Invalid file or file exceeds 50 MB." });
    const id = randomUUID().replaceAll("-", "").slice(0, 16);
    const safeName = String(name).replace(/[^\w.\-() ]/g, "_").slice(0, 120);
    const path = `${id}/${safeName}`;
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false });
    if (error) throw error;
    return res.status(200).json({ id, path, signedUrl: data.signedUrl, token: data.token });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Upload initialization failed." });
  }
}
