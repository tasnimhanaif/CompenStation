async function approveTimesheet(timesheetId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:3000/api/admin/timesheets/${timesheetId}/approve`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Approve failed");
  return data;
}
