const $ = (id) => document.getElementById(id);
const input = $("fileInput"), drop = $("dropzone"), form = $("uploadForm");
let selectedFile = null, createdUrl = "";

$("year").textContent = new Date().getFullYear();

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
function chooseFile(file) {
  $("errorMessage").textContent = "";
  $("result").hidden = true;
  if (!file) return;
  if (file.size > 50 * 1024 * 1024) {
    selectedFile = null;
    $("fileStatus").textContent = "File exceeds 50 MB";
    $("dropTitle").textContent = "File too large";
    $("uploadButton").disabled = true;
    $("errorMessage").textContent = "This starter version supports files up to 50 MB.";
    return;
  }
  selectedFile = file;
  $("dropTitle").textContent = file.name;
  $("dropSubtitle").textContent = `${humanSize(file.size)} · ${file.type || "Unknown file type"}`;
  $("fileStatus").textContent = `${file.name} · ${humanSize(file.size)}`;
  $("fileTitle").value ||= file.name.replace(/\.[^.]+$/, "");
  $("uploadButton").disabled = false;
}
input.addEventListener("change", () => chooseFile(input.files?.[0]));
["dragenter","dragover"].forEach(type => drop.addEventListener(type, e => { e.preventDefault(); drop.classList.add("dragover"); }));
["dragleave","drop"].forEach(type => drop.addEventListener(type, e => { e.preventDefault(); drop.classList.remove("dragover"); }));
drop.addEventListener("drop", e => chooseFile(e.dataTransfer.files?.[0]));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedFile) return;
  $("errorMessage").textContent = "";
  $("uploadButton").disabled = true;
  $("progressWrap").hidden = false;
  $("progressBar").style.width = "8%";
  $("progressText").textContent = "Preparing secure upload…";
  try {
    const createRes = await fetch("/api/upload/create", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name: selectedFile.name, size: selectedFile.size, type: selectedFile.type || "application/octet-stream" })
    });
    const created = await createRes.json();
    if (!createRes.ok) throw new Error(created.error || "Could not start upload.");
    $("progressBar").style.width = "25%";
    $("progressText").textContent = "Uploading file…";

    const uploadRes = await fetch(created.signedUrl, {
      method: "PUT",
      headers: {"Content-Type": selectedFile.type || "application/octet-stream", "x-upsert":"false"},
      body: selectedFile
    });
    if (!uploadRes.ok) throw new Error("Storage upload failed. Check Supabase bucket settings.");
    $("progressBar").style.width = "85%";
    $("progressText").textContent = "Creating your share page…";

    const completeRes = await fetch("/api/upload/complete", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        id: created.id, path: created.path, originalName: selectedFile.name,
        title: $("fileTitle").value.trim() || selectedFile.name,
        description: $("fileDescription").value.trim(),
        size: selectedFile.size, mimeType: selectedFile.type || "application/octet-stream"
      })
    });
    const completed = await completeRes.json();
    if (!completeRes.ok) throw new Error(completed.error || "Could not finish upload.");
    createdUrl = `${location.origin}/v/${created.id}`;
    $("resultUrl").textContent = createdUrl;
    $("result").hidden = false;
    $("progressBar").style.width = "100%";
    $("progressText").textContent = "Upload complete.";
    $("fileStatus").textContent = "Upload complete";
  } catch (err) {
    $("errorMessage").textContent = err.message || "Something went wrong.";
    $("progressWrap").hidden = true;
  } finally {
    $("uploadButton").disabled = !selectedFile;
  }
});
$("copyButton").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(createdUrl); $("copyButton").textContent = "Copied!"; }
  catch { $("copyButton").textContent = "Copy unavailable"; }
});
