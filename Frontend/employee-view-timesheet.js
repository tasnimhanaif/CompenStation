async function loadMyTimesheets() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/api/employee/timesheets", {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Load failed");
  return data;
}
