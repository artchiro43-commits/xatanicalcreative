const id = location.pathname.split("/").filter(Boolean).pop();
const $ = x => document.getElementById(x);
const size = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(1)} MB`;
(async () => {
  try {
    const response = await fetch(`/api/files/${encodeURIComponent(id)}`);
    const file = await response.json();
    if (!response.ok) throw new Error(file.error || "File not found.");
    $("loading").hidden = true; $("fileCard").hidden = false;
    $("title").textContent = file.title;
    $("description").textContent = file.description || "No description provided.";
    $("name").textContent = file.original_name;
    $("size").textContent = size(file.size_bytes);
    $("mime").textContent = file.mime_type;
    $("date").textContent = new Date(file.created_at).toLocaleDateString("id-ID", {day:"numeric",month:"long",year:"numeric"});
    $("fileType").textContent = (file.original_name.split(".").pop() || "FILE").toUpperCase();
    $("download").href = `/api/download/${encodeURIComponent(id)}`;
    document.title = `${file.title} — Xatanical Creative`;
  } catch (e) { $("loading").hidden = true; $("shareError").textContent = e.message; }
})();
