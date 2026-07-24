function formatDate(date) {
  if (!date) return "-";
  return new Date(date + "T12:00:00").toLocaleDateString("de-DE");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
