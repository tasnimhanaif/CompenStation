async function submitTimesheet(periodStart, periodEnd, hoursWorked, notes) {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/api/employee/timesheets/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ periodStart, periodEnd, hoursWorked, notes })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Submit failed");
  return data;
}
