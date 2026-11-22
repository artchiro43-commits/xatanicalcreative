import { supabaseAdmin, BUCKET } from "../../lib/supabase.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  try {
    const id = req.query.id;
    if (!/^[a-f0-9]{16}$/.test(id || "")) return res.status(400).send("Invalid file ID.");
    const supabase = supabaseAdmin();
    const { data: file, error } = await supabase.from("files").select("storage_path,original_name").eq("id", id).single();
    if (error || !file) return res.status(404).send("File not found.");
    const { data, error: signError } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 60, { download: file.original_name });
    if (signError) throw signError;
    return res.redirect(302, data.signedUrl);
  } catch { return res.status(500).send("Could not create download link."); }
}
