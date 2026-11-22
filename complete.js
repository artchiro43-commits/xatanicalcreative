import { supabaseAdmin } from "../../lib/supabase.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  try {
    const { id, path, originalName, title, description, size, mimeType } = req.body || {};
    if (!/^[a-f0-9]{16}$/.test(id || "") || typeof path !== "string" || !path.startsWith(`${id}/`))
      return res.status(400).json({ error: "Invalid upload reference." });
    const supabase = supabaseAdmin();
    const { data: existing, error: checkError } = await supabase.storage.from(process.env.SUPABASE_BUCKET || "shared-files").list(id);
    if (checkError) throw checkError;
    if (!existing?.length) return res.status(400).json({ error: "Uploaded file was not found." });
    const { error } = await supabase.from("files").insert({
      id, storage_path: path, original_name: String(originalName || "file").slice(0, 180),
      title: String(title || originalName || "Shared file").slice(0, 90),
      description: String(description || "").slice(0, 240),
      size_bytes: Number(size) || 0, mime_type: String(mimeType || "application/octet-stream").slice(0, 120)
    });
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Could not save file details." });
  }
}
