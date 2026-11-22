import { supabaseAdmin } from "../../lib/supabase.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  try {
    const id = req.query.id;
    if (!/^[a-f0-9]{16}$/.test(id || "")) return res.status(400).json({ error: "Invalid file ID." });
    const { data, error } = await supabaseAdmin().from("files")
      .select("id,title,description,original_name,size_bytes,mime_type,created_at")
      .eq("id", id).single();
    if (error || !data) return res.status(404).json({ error: "File not found." });
    return res.status(200).json(data);
  } catch (e) { return res.status(500).json({ error: "Could not load file." }); }
}
