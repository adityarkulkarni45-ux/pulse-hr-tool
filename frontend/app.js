// API URL - automatically uses deployed backend URL or local
const API = window.location.hostname === 'localhost' 
  ? "/api" 
  : "https://pulse-hr-backend.onrender.com/api";

let session = { role: null, employeeId: null, employeeName: null };
let allEmployees = [];
let allLeaves = [];
let currentPhotoData = null; // Store captured/uploaded photo as base64
let currentDepartmentFilter = null; // Store current department filter
let currentLeaveIdForRejection = null; // Store leave ID for rejection modal

/* ---------------------------- helpers ---------------------------- */

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2200);
}

function badgeClass(status) {
  return {
    Active: "badge-active",
    Approved: "badge-approved",
    Pending: "badge-pending",
    Rejected: "badge-rejected",
  }[status] || "";
}

/* ---------------------------- role gate ---------------------------- */

const ADMIN_PASSWORD = "admin123"; // Change this to set a new admin password

const roleGate = document.getElementById("role-gate");
const app = document.getElementById("app");

// Admin access link click
document.getElementById("admin-access-link").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("admin-password-modal").classList.remove("hidden");
  document.getElementById("admin-password-input").focus();
});

// Cancel admin password modal
document.getElementById("cancel-admin-btn").addEventListener("click", () => {
  document.getElementById("admin-password-modal").classList.add("hidden");
  document.getElementById("admin-password-form").reset();
  document.getElementById("admin-error").classList.add("hidden");
});

// Admin password form submission
document.getElementById("admin-password-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const password = document.getElementById("admin-password-input").value;
  
  if (password === ADMIN_PASSWORD) {
    // Password correct - login as admin
    session = { role: "admin", employeeId: null, employeeName: "HR Admin" };
    document.getElementById("admin-password-modal").classList.add("hidden");
    document.getElementById("admin-password-form").reset();
    document.getElementById("admin-error").classList.add("hidden");
    enterApp();
  } else {
    // Password incorrect - show error
    document.getElementById("admin-error").classList.remove("hidden");
    document.getElementById("admin-password-input").value = "";
    document.getElementById("admin-password-input").focus();
  }
});

// Employee role button click
document.querySelectorAll(".role-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const role = btn.dataset.role;
    if (role === "employee") {
      // Populate employee picker
      document.querySelectorAll(".role-btn").forEach((b) => b.classList.add("hidden"));
      const wrap = document.getElementById("employee-select-wrap");
      wrap.classList.remove("hidden");
      const select = document.getElementById("employee-select");
      const employees = await api("/employees");
      select.innerHTML = employees
        .map((e) => `<option value="${e.id}">${e.name} — ${e.designation}</option>`)
        .join("");
    }
  });
});

document.getElementById("employee-continue").addEventListener("click", () => {
  const select = document.getElementById("employee-select");
  const opt = select.options[select.selectedIndex];
  session = { role: "employee", employeeId: select.value, employeeName: opt.textContent.split(" — ")[0] };
  enterApp();
});

document.getElementById("switch-role").addEventListener("click", () => {
  session = { role: null, employeeId: null, employeeName: null };
  currentDepartmentFilter = null; // Clear any active department filter
  app.classList.add("hidden");
  roleGate.classList.remove("hidden");
  document.querySelectorAll(".role-btn").forEach((b) => b.classList.remove("hidden"));
  document.getElementById("employee-select-wrap").classList.add("hidden");
});

function enterApp() {
  roleGate.classList.add("hidden");
  app.classList.remove("hidden");
  document.getElementById("session-role").textContent = session.role === "admin" ? "HR Admin" : "Employee";
  document.getElementById("session-name").textContent = session.employeeName;

  // Show/hide switch role button (only for admin)
  const switchRoleBtn = document.getElementById("switch-role");
  switchRoleBtn.classList.toggle("hidden", session.role !== "admin");

  document.getElementById("add-employee-btn").classList.toggle("hidden", session.role !== "admin");
  document.getElementById("apply-leave-btn").classList.toggle("hidden", session.role !== "employee");
  document.getElementById("directory-sub").textContent =
    session.role === "admin" ? "Add, edit, and manage every employee record." : "Everyone at the company.";
  document.getElementById("leaves-sub").textContent =
    session.role === "admin" ? "Review and act on leave requests." : "Apply for leave and track your requests.";

  loadDashboard();
  loadEmployees();
  loadLeaves();
  
  // Show welcome toast
  setTimeout(() => {
    const greeting = session.role === 'admin' ? 'Welcome back, Admin!' : `Welcome back, ${session.employeeName}!`;
    showToast(greeting);
  }, 500);
}

/* ---------------------------- navigation ---------------------------- */

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    document.getElementById(`view-${btn.dataset.view}`).classList.remove("hidden");
  });
});

/* ---------------------------- dashboard ---------------------------- */

async function loadDashboard() {
  const stats = await api("/dashboard");
  const employees = await api("/employees");
  const leaves = await api("/leaves");
  
  // Render stat cards
  const grid = document.getElementById("stat-grid");
  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">👥</div>
      <div class="stat-value">${stats.totalEmployees}</div>
      <div class="stat-label">Total employees</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✅</div>
      <div class="stat-value">${stats.activeEmployees}</div>
      <div class="stat-label">Active</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⏳</div>
      <div class="stat-value">${stats.pendingLeaves}</div>
      <div class="stat-label">Pending leave requests</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🎉</div>
      <div class="stat-value">${stats.approvedLeavesThisMonth}</div>
      <div class="stat-label">Approved leaves</div>
    </div>
  `;
  
  // Render department chips with click handlers
  const deptChipsContainer = document.getElementById("dept-chips");
  const deptCount = document.getElementById("dept-count");
  deptCount.textContent = stats.departments.length;
  
  deptChipsContainer.innerHTML = stats.departments
    .map((d) => `<span class="chip dept-chip" data-department="${d}">${d}</span>`)
    .join("");
  
  // Add click event listeners to department chips (admin only)
  if (session.role === "admin") {
    deptChipsContainer.querySelectorAll(".dept-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const department = chip.dataset.department;
        filterByDepartment(department);
      });
    });
  }
  
  // Render recent activities
  renderRecentActivities(employees, leaves);
  
  // Render leave overview
  renderLeaveOverview(leaves);
  
  // Render quick actions
  renderQuickActions();
  
  // Render recent employees
  renderRecentEmployees(employees);
  
  // Render department chart
  renderDepartmentChart(employees);
  
  // Render leave status chart
  renderLeaveStatusChart(leaves);
  
  // Update system status
  updateSystemStatus();
}

function renderRecentActivities(employees, leaves) {
  const container = document.getElementById("recent-activities");
  
  // Combine and sort activities
  const activities = [];
  
  // Add recent employees
  employees
    .slice(-5)
    .reverse()
    .forEach(emp => {
      activities.push({
        icon: '👤',
        text: `<strong>${emp.name}</strong> joined as ${emp.designation}`,
        time: getRelativeTime(emp.joiningDate),
        timestamp: new Date(emp.joiningDate)
      });
    });
  
  // Add recent leaves
  leaves
    .slice(-5)
    .reverse()
    .forEach(leave => {
      let icon = '📅';
      let text = '';
      if (leave.status === 'Pending') {
        icon = '⏳';
        text = `<strong>${leave.employeeName}</strong> applied for ${leave.type}`;
      } else if (leave.status === 'Approved') {
        icon = '✅';
        text = `Leave approved for <strong>${leave.employeeName}</strong>`;
      } else if (leave.status === 'Rejected') {
        icon = '❌';
        text = `Leave rejected for <strong>${leave.employeeName}</strong>`;
      }
      activities.push({
        icon,
        text,
        time: getRelativeTime(leave.appliedOn),
        timestamp: new Date(leave.appliedOn)
      });
    });
  
  // Sort by timestamp and take top 10
  activities.sort((a, b) => b.timestamp - a.timestamp);
  const topActivities = activities.slice(0, 10);
  
  if (topActivities.length === 0) {
    container.innerHTML = '<p style="color: var(--ink-soft); font-size: 13px; text-align: center; padding: 20px;">No recent activities</p>';
    return;
  }
  
  container.innerHTML = topActivities.map(activity => `
    <div class="activity-item">
      <span class="activity-icon">${activity.icon}</span>
      <span class="activity-text">${activity.text}</span>
      <span class="activity-time">${activity.time}</span>
    </div>
  `).join('');
}

function renderLeaveOverview(leaves) {
  const container = document.getElementById("leave-overview");
  
  const pending = leaves.filter(l => l.status === 'Pending').length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;
  
  container.innerHTML = `
    <div class="leave-stat-item pending">
      <span class="leave-stat-label">Pending</span>
      <span class="leave-stat-value">${pending}</span>
    </div>
    <div class="leave-stat-item approved">
      <span class="leave-stat-label">Approved</span>
      <span class="leave-stat-value">${approved}</span>
    </div>
    <div class="leave-stat-item rejected">
      <span class="leave-stat-label">Rejected</span>
      <span class="leave-stat-value">${rejected}</span>
    </div>
  `;
}

function renderQuickActions() {
  const container = document.getElementById("quick-actions");
  
  const actions = session.role === 'admin' 
    ? [
        { icon: '👤', label: 'Add Employee', view: 'directory', action: () => document.getElementById('add-employee-btn').click() },
        { icon: '📊', label: 'View Reports', view: 'directory', action: () => switchView('directory') },
        { icon: '📋', label: 'Leave Requests', view: 'leaves', action: () => switchView('leaves') },
        { icon: '⚙️', label: 'Settings', view: 'dashboard', action: () => showToast('Settings coming soon!') }
      ]
    : [
        { icon: '🏖️', label: 'Apply Leave', view: 'leaves', action: () => document.getElementById('apply-leave-btn').click() },
        { icon: '👥', label: 'View Team', view: 'directory', action: () => switchView('directory') },
        { icon: '📅', label: 'My Leaves', view: 'leaves', action: () => switchView('leaves') },
        { icon: '📞', label: 'Contact HR', view: 'dashboard', action: () => showToast('Contact HR at hr@company.com') }
      ];
  
  container.innerHTML = actions.map(action => `
    <button class="quick-action-btn" data-action="${action.label}">
      <span class="quick-action-icon">${action.icon}</span>
      ${action.label}
    </button>
  `).join('');
  
  // Add click handlers
  container.querySelectorAll('.quick-action-btn').forEach((btn, index) => {
    btn.addEventListener('click', actions[index].action);
  });
}

function renderRecentEmployees(employees) {
  const container = document.getElementById("recent-employees");
  
  const recent = employees
    .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
    .slice(0, 5);
  
  if (recent.length === 0) {
    container.innerHTML = '<p style="color: var(--ink-soft); font-size: 13px; text-align: center; padding: 20px;">No employees yet</p>';
    return;
  }
  
  container.innerHTML = recent.map(emp => `
    <div class="recent-employee-item">
      <div class="recent-employee-photo">
        ${emp.photo 
          ? `<img src="/uploads/${emp.photo}" alt="${emp.name}" />` 
          : emp.name.charAt(0).toUpperCase()
        }
      </div>
      <div class="recent-employee-info">
        <div class="recent-employee-name">${emp.name}</div>
        <div class="recent-employee-role">${emp.designation} • ${emp.department}</div>
      </div>
    </div>
  `).join('');
}

function renderDepartmentChart(employees) {
  const container = document.getElementById("dept-chart");
  
  // Count employees by department
  const deptCounts = {};
  employees.forEach(emp => {
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });
  
  // Get top 5 departments
  const sorted = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (sorted.length === 0) {
    container.innerHTML = '<p style="color: var(--ink-soft); font-size: 13px; text-align: center;">No data</p>';
    return;
  }
  
  const maxCount = Math.max(...sorted.map(([_, count]) => count));
  
  container.innerHTML = sorted.map(([dept, count]) => {
    const height = (count / maxCount) * 180;
    return `
      <div class="chart-bar" style="height: ${height}px;">
        <span class="chart-bar-value">${count}</span>
        <span class="chart-bar-label">${dept}</span>
      </div>
    `;
  }).join('');
}

function renderLeaveStatusChart(leaves) {
  const container = document.getElementById("leave-status-chart");
  
  const statuses = {
    'Pending': leaves.filter(l => l.status === 'Pending').length,
    'Approved': leaves.filter(l => l.status === 'Approved').length,
    'Rejected': leaves.filter(l => l.status === 'Rejected').length
  };
  
  const maxCount = Math.max(...Object.values(statuses), 1);
  
  container.innerHTML = Object.entries(statuses).map(([status, count]) => {
    const height = (count / maxCount) * 180;
    return `
      <div class="chart-bar" style="height: ${height}px;">
        <span class="chart-bar-value">${count}</span>
        <span class="chart-bar-label">${status}</span>
      </div>
    `;
  }).join('');
}

function updateSystemStatus() {
  const timeElement = document.getElementById("last-sync-time");
  if (timeElement) {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString();
  }
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function switchView(viewName) {
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  document.querySelector(`.nav-item[data-view="${viewName}"]`).classList.add("active");
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById(`view-${viewName}`).classList.remove("hidden");
}

/* ---------------------------- department filter ---------------------------- */

function filterByDepartment(department) {
  currentDepartmentFilter = department;
  
  // Navigate to Employee Directory view
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  document.querySelector('.nav-item[data-view="directory"]').classList.add("active");
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById("view-directory").classList.remove("hidden");
  
  // Show back button
  const backBtn = document.getElementById("back-to-dashboard-btn");
  backBtn.classList.remove("hidden");
  document.querySelector("#view-directory .view-header").classList.add("has-back");
  
  // Update directory header to show filter
  const directorySub = document.getElementById("directory-sub");
  directorySub.innerHTML = `
    Showing employees in <strong>${department}</strong> department
    <button id="clear-filter-btn" class="clear-filter-btn">✕ Show all</button>
  `;
  
  // Render filtered employees
  renderEmployees();
  
  // Add clear filter button handler
  document.getElementById("clear-filter-btn").addEventListener("click", clearDepartmentFilter);
}

function clearDepartmentFilter() {
  currentDepartmentFilter = null;
  const directorySub = document.getElementById("directory-sub");
  directorySub.textContent = session.role === "admin" 
    ? "Add, edit, and manage every employee record." 
    : "Everyone at the company.";
  
  // Hide back button
  const backBtn = document.getElementById("back-to-dashboard-btn");
  backBtn.classList.add("hidden");
  document.querySelector("#view-directory .view-header").classList.remove("has-back");
  
  renderEmployees();
}

// Back button handlers
document.getElementById("back-to-dashboard-btn").addEventListener("click", () => {
  // Clear filter and go to dashboard
  clearDepartmentFilter();
  switchView("dashboard");
  
  // Update nav
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  document.querySelector('.nav-item[data-view="dashboard"]').classList.add("active");
});

document.getElementById("back-to-dashboard-leaves-btn").addEventListener("click", () => {
  switchView("dashboard");
  
  // Update nav
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  document.querySelector('.nav-item[data-view="dashboard"]').classList.add("active");
});

/* ---------------------------- employee directory ---------------------------- */

async function loadEmployees() {
  allEmployees = await api("/employees");
  renderEmployees();
}

function renderEmployees() {
  const tbody = document.getElementById("employee-tbody");
  
  // Filter employees by department if filter is active
  let employeesToShow = allEmployees;
  if (currentDepartmentFilter) {
    employeesToShow = allEmployees.filter(e => e.department === currentDepartmentFilter);
  }
  
  tbody.innerHTML = employeesToShow
    .map(
      (e) => `
    <tr>
      <td>
        <div class="employee-photo">
          ${e.photo 
            ? `<img src="/uploads/${e.photo}" alt="${e.name}" class="employee-photo-img" />` 
            : `<div class="employee-photo-placeholder">${e.name.charAt(0).toUpperCase()}</div>`
          }
        </div>
      </td>
      <td><span class="employee-id">${e.id}</span></td>
      <td>${e.name}</td>
      <td>${e.email}</td>
      <td>${e.department}</td>
      <td>${e.designation}</td>
      <td>${e.joiningDate}</td>
      <td><span class="badge ${badgeClass(e.status)}">${e.status}</span></td>
      <td>
        ${
          session.role === "admin"
            ? `<div class="row-actions">
                <button class="icon-btn approve" data-edit="${e.id}">Edit</button>
                <button class="icon-btn reject" data-remove="${e.id}">Remove</button>
               </div>`
            : ""
        }
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.edit));
  });

  tbody.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this employee?")) return;
      await api(`/employees/${btn.dataset.remove}`, { method: "DELETE" });
      showToast("Employee removed");
      loadEmployees();
      loadDashboard();
    });
  });
}

document.getElementById("add-employee-btn").addEventListener("click", () => {
  currentPhotoData = null; // Reset photo data
  document.getElementById("photo-preview").classList.add("hidden");
  document.getElementById("employee-modal").classList.remove("hidden");
});

/* ---------------------------- photo capture/upload ---------------------------- */

// Upload photo button
document.getElementById("upload-photo-btn").addEventListener("click", () => {
  document.getElementById("photo-upload-input").click();
});

// Handle file upload
document.getElementById("photo-upload-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentPhotoData = event.target.result;
      document.getElementById("photo-preview-img").src = currentPhotoData;
      document.getElementById("photo-preview").classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

// Capture photo button
document.getElementById("capture-photo-btn").addEventListener("click", () => {
  document.getElementById("webcam-modal").classList.remove("hidden");
  startWebcam(false); // false = adding mode
});

// Start webcam - Already defined in edit section above

// Stop webcam
function stopWebcam() {
  const video = document.getElementById("webcam-video");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// Cancel webcam
document.getElementById("cancel-webcam-btn").addEventListener("click", () => {
  stopWebcam();
  document.getElementById("webcam-modal").classList.add("hidden");
  isEditingEmployee = false;
});

// Capture from webcam - Already defined in edit section above

// Remove photo
document.getElementById("remove-photo-btn").addEventListener("click", () => {
  currentPhotoData = null;
  document.getElementById("photo-preview").classList.add("hidden");
  document.getElementById("photo-upload-input").value = "";
});

document.getElementById("employee-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());
  
  // Add photo data if available
  if (currentPhotoData) {
    payload.photo = currentPhotoData;
  }
  
  try {
    await api("/employees", { method: "POST", body: JSON.stringify(payload) });
    showToast("Employee added successfully");
    document.getElementById("employee-modal").classList.add("hidden");
    e.target.reset();
    currentPhotoData = null;
    document.getElementById("photo-preview").classList.add("hidden");
    loadEmployees();
    loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
});

/* ---------------------------- leave management ---------------------------- */

async function loadLeaves() {
  const query = session.role === "employee" ? `?employeeId=${session.employeeId}` : "";
  allLeaves = await api(`/leaves${query}`);
  renderLeaves();
}

function renderLeaves() {
  const tbody = document.getElementById("leave-tbody");
  tbody.innerHTML = allLeaves
    .map(
      (l) => `
    <tr>
      <td>${l.employeeName}</td>
      <td>${l.type}</td>
      <td>${l.fromDate}</td>
      <td>${l.toDate}</td>
      <td>
        ${l.reason || "—"}
        ${l.status === "Rejected" && l.rejectionReason 
          ? `<br><span class="rejection-reason">Rejected: ${l.rejectionReason}</span>` 
          : ""}
      </td>
      <td><span class="badge ${badgeClass(l.status)}">${l.status}</span></td>
      <td>
        ${
          session.role === "admin" && l.status === "Pending"
            ? `<div class="row-actions">
                <button class="icon-btn approve" data-approve="${l.id}">Approve</button>
                <button class="icon-btn reject" data-reject="${l.id}">Reject</button>
               </div>`
            : ""
        }
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => updateLeaveStatus(btn.dataset.approve, "Approved"));
  });
  tbody.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => openRejectionModal(btn.dataset.reject));
  });
}

function openRejectionModal(leaveId) {
  currentLeaveIdForRejection = leaveId;
  document.getElementById("rejection-modal").classList.remove("hidden");
  document.querySelector('#rejection-form textarea[name="rejectionReason"]').focus();
}

document.getElementById("cancel-rejection-btn").addEventListener("click", () => {
  document.getElementById("rejection-modal").classList.add("hidden");
  document.getElementById("rejection-form").reset();
  currentLeaveIdForRejection = null;
});

document.getElementById("rejection-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const rejectionReason = form.get("rejectionReason");
  
  try {
    await api(`/leaves/${currentLeaveIdForRejection}`, {
      method: "PUT",
      body: JSON.stringify({ status: "Rejected", rejectionReason })
    });
    showToast("Leave request rejected");
    document.getElementById("rejection-modal").classList.add("hidden");
    document.getElementById("rejection-form").reset();
    currentLeaveIdForRejection = null;
    loadLeaves();
    loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
});

async function updateLeaveStatus(id, status) {
  try {
    await api(`/leaves/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    showToast(`Leave request ${status.toLowerCase()}`);
    loadLeaves();
    loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

document.getElementById("apply-leave-btn").addEventListener("click", () => {
  document.getElementById("leave-modal").classList.remove("hidden");
});

document.getElementById("leave-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());
  payload.employeeId = session.employeeId;
  try {
    await api("/leaves", { method: "POST", body: JSON.stringify(payload) });
    showToast("Leave request submitted");
    document.getElementById("leave-modal").classList.add("hidden");
    e.target.reset();
    loadLeaves();
    loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
});

/* ---------------------------- edit employee ---------------------------- */

let currentEditPhotoData = null;

function openEditModal(employeeId) {
  const employee = allEmployees.find(e => e.id === employeeId);
  if (!employee) return;
  
  // Populate form with employee data
  document.getElementById("edit-employee-id").value = employee.id;
  document.getElementById("edit-name").value = employee.name;
  document.getElementById("edit-email").value = employee.email;
  document.getElementById("edit-department").value = employee.department;
  document.getElementById("edit-designation").value = employee.designation;
  document.getElementById("edit-joiningDate").value = employee.joiningDate;
  document.getElementById("edit-status").value = employee.status;
  
  // Show existing photo if available (now using filename)
  currentEditPhotoData = employee.photo;
  if (employee.photo) {
    document.getElementById("edit-photo-preview-img").src = `/uploads/${employee.photo}`;
    document.getElementById("edit-photo-preview").classList.remove("hidden");
  } else {
    document.getElementById("edit-photo-preview").classList.add("hidden");
  }
  
  document.getElementById("edit-employee-modal").classList.remove("hidden");
}

// Edit photo upload
document.getElementById("edit-upload-photo-btn").addEventListener("click", () => {
  document.getElementById("edit-photo-upload-input").click();
});

document.getElementById("edit-photo-upload-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentEditPhotoData = event.target.result;
      document.getElementById("edit-photo-preview-img").src = currentEditPhotoData;
      document.getElementById("edit-photo-preview").classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

// Edit photo capture
document.getElementById("edit-capture-photo-btn").addEventListener("click", () => {
  document.getElementById("webcam-modal").classList.remove("hidden");
  startWebcam(true); // true = editing mode
});

// Remove edit photo
document.getElementById("edit-remove-photo-btn").addEventListener("click", () => {
  currentEditPhotoData = null;
  document.getElementById("edit-photo-preview").classList.add("hidden");
  document.getElementById("edit-photo-upload-input").value = "";
});

// Update startWebcam to know if we're editing
let isEditingEmployee = false;
function startWebcam(editMode = false) {
  isEditingEmployee = editMode;
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const video = document.getElementById("webcam-video");
      video.srcObject = stream;
    })
    .catch(err => {
      showToast("Unable to access camera: " + err.message);
      document.getElementById("webcam-modal").classList.add("hidden");
    });
}

// Update capture button to handle both add and edit
document.getElementById("capture-webcam-btn").addEventListener("click", () => {
  const video = document.getElementById("webcam-video");
  const canvas = document.getElementById("webcam-canvas");
  const context = canvas.getContext("2d");
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  
  const photoData = canvas.toDataURL("image/jpeg", 0.8);
  
  if (isEditingEmployee) {
    currentEditPhotoData = photoData;
    document.getElementById("edit-photo-preview-img").src = photoData;
    document.getElementById("edit-photo-preview").classList.remove("hidden");
  } else {
    currentPhotoData = photoData;
    document.getElementById("photo-preview-img").src = photoData;
    document.getElementById("photo-preview").classList.remove("hidden");
  }
  
  stopWebcam();
  document.getElementById("webcam-modal").classList.add("hidden");
  isEditingEmployee = false;
});

// Edit employee form submission
document.getElementById("edit-employee-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = document.getElementById("edit-employee-id").value;
  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());
  
  // Handle photo data
  // If currentEditPhotoData is base64 (starts with data:image), send it
  // If it's a filename, send it as is
  // If it's null, send null to remove photo
  if (currentEditPhotoData) {
    payload.photo = currentEditPhotoData;
  } else {
    payload.photo = null;
  }
  
  try {
    await api(`/employees/${employeeId}`, { method: "PUT", body: JSON.stringify(payload) });
    showToast("Employee updated successfully");
    document.getElementById("edit-employee-modal").classList.add("hidden");
    e.target.reset();
    currentEditPhotoData = null;
    document.getElementById("edit-photo-preview").classList.add("hidden");
    loadEmployees();
    loadDashboard();
  } catch (err) {
    showToast(err.message);
  }
});

/* ---------------------------- modal close ---------------------------- */

document.querySelectorAll("[data-close-modal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".modal-backdrop").classList.add("hidden");
  });
});
