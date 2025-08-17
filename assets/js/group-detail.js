// assets/js/group-detail.js

// Lấy id lớp và index group từ query string
const params = new URLSearchParams(window.location.search);
const classId = params.get("class_id");
const groupIndex = +params.get("group_index");

let countdownTimers = []; // Lưu các interval cho từng task để clear khi render lại
let classes = JSON.parse(localStorage.getItem("classes")) || [];
const cls = classes.find((c) => c.class_id === classId);
if (!cls || !cls.groups || !cls.groups[groupIndex]) {
  document.body.innerHTML =
    '<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy group này!</div>';
  throw "Group not found";
}
const group = cls.groups[groupIndex];
document.getElementById("backToClass").href = `class-detail.html?id=${classId}`;
document.getElementById("groupName").innerText = `Group ${groupIndex + 1}`;

// Render thành viên nhóm
function renderMembers() {
  const groupMembers = document.getElementById("groupMembers");
  groupMembers.innerHTML =
    group.members
      .map((memberId) => {
        const mem = cls.memberList.find((m) => m.id === memberId);
        if (!mem) return "";
        const initials = mem.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase();
        return `
      <div class="flex items-center gap-2 bg-blue-50 rounded p-2 px-4 shadow">
        <span class="bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full text-base font-bold">${initials}</span>
        <span class="font-medium">${mem.name}</span>
      </div>
    `;
      })
      .join("") || `<span class="text-gray-400">No members yet.</span>`;
}
renderMembers();

// Quản lý Task
function saveToLocal() {
  localStorage.setItem("classes", JSON.stringify(classes));
}

// Hiển thị danh sách nhiệm vụ
function renderTasks() {
  // Dừng hết interval cũ
  countdownTimers.forEach((timer) => clearInterval(timer));
  countdownTimers = [];
  const tasksList = document.getElementById("tasksList");
  group.tasks = group.tasks || [];
  if (group.tasks.length === 0) {
    tasksList.innerHTML = `<div class="text-gray-400">No tasks yet.</div>`;
    return;
  }
  tasksList.innerHTML = group.tasks
    .map((task, idx) => {
      const mem = cls.memberList.find((m) => m.id === task.assign_to);
      const assignedName = mem ? mem.name : "Chưa giao";
      const deadlineStr = task.deadline
        ? new Date(task.deadline).toLocaleString()
        : "Not set";
      // Tính trạng thái để disable nút check nếu cần
      let isLate = false;
      if (task.deadline) {
        isLate = new Date(task.deadline) < new Date();
      }
      // Nếu trễ deadline và đã hoàn thành => disable checkbox
      const checkboxDisabled = isLate && task.completed ? "disabled" : "";

      // Kiểm tra điều kiện để có thể chỉnh sửa
      const canEdit = !((isLate && !task.completed) || task.completed); // Ẩn nút Sửa khi trễ deadline và chưa hoàn thành, hoặc đã hoàn thành

      return `
      <div class="bg-gray-50 p-4 rounded shadow flex justify-between items-center border border-gray-200">
        <div>
          <div class="font-semibold text-gray-900">${task.title}</div>
          <div class="text-gray-500 text-sm mb-1">${task.desc || ""}</div>
          <div class="text-xs text-gray-500">
            Deadline: <span>${deadlineStr}</span>
            <span id="countdown-task-${idx}" class="ml-2 font-semibold"></span>
          </div>
          <div class="text-xs text-gray-500">Giao cho: <span class="text-gray-800 font-semibold">${assignedName}</span></div>
        </div>
        <div class="flex flex-col gap-1 items-end">
          <button onclick="editTask(${idx})" class="text-blue-500 text-xs hover:underline" ${
        canEdit ? "" : "hidden"
      }>Edit</button>
          <button onclick="deleteTask(${idx})" class="text-red-500 text-xs hover:underline" ${
        canDelete(idx) ? "" : "disabled"
      }>Delete</button>
          <label class="flex items-center gap-1 mt-1 cursor-pointer">
            <input type="checkbox" ${
              task.completed ? "checked" : ""
            } onchange="toggleDone(${idx})" ${checkboxDisabled}/>
            <span class="text-xs">Hoàn thành</span>
          </label>
        </div>
      </div>
    `;
    })
    .join("");
  // Gọi lại countdown cho từng task
  group.tasks.forEach((task, idx) => {
    setupTaskCountdown(idx, task);
  });
}

renderTasks();

// Hàm xóa nhiệm vụ
window.deleteTask = function (idx) {
  const task = group.tasks[idx];
  const isLate = task.deadline && new Date(task.deadline) < new Date();
  const isCompleted = task.completed;

  // Kiểm tra nếu nhiệm vụ đã hoàn thành hoặc trễ deadline mà chưa hoàn thành
  if (isCompleted) {
    alert("Cannot delete a completed task.");
    return;
  }

  if (isLate && !isCompleted) {
    alert("Cannot delete a task that is past its deadline.");
    return;
  }

  // Xóa nhiệm vụ nếu điều kiện cho phép
  if (confirm("Are you sure you want to delete this task?")) {
    group.tasks.splice(idx, 1);
    saveToLocal();
    renderTasks();
  }
};

// Kiểm tra có thể xóa nhiệm vụ hay không
function canDelete(idx) {
  const task = group.tasks[idx];
  const isLate = task.deadline && new Date(task.deadline) < new Date();
  const isCompleted = task.completed;

  // Nếu đã hoàn thành hoặc trễ deadline mà chưa hoàn thành, không cho xóa
  return !(isCompleted || (isLate && !isCompleted));
}

window.toggleDone = function (idx) {
  const task = group.tasks[idx];
  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;

  // Nếu đang bỏ tick (từ true sang false)
  if (task.completed) {
    // Không cho bỏ nếu trễ và đã hoàn thành
    if (deadline && deadline < now) {
      alert(
        "Cannot unmark as completed for a task that was finished after the deadline!"
      );
      renderTasks(); // Giữ nguyên checkbox
      return;
    }
    // Nếu cho phép bỏ, xóa completion_time
    delete task.completion_time;
  } else {
    // Khi tick hoàn thành (từ false sang true), lưu thời điểm
    task.completion_time = new Date().toISOString();
  }

  task.completed = !task.completed;
  saveToLocal();
  renderTasks();
};

let editIdx = null;
window.editTask = function (idx) {
  const task = group.tasks[idx];
  editIdx = idx;
  showTaskModal(task);
};

// Modal Tạo/Chỉnh sửa Task
const taskModal = document.getElementById("taskModal");
document.getElementById("openTaskModal").onclick = () => {
  editIdx = null;
  showTaskModal();
};
document.getElementById("closeTaskModal").onclick = () => {
  taskModal.classList.add("hidden");
};

// Hiển thị modal tạo/chỉnh sửa task
function showTaskModal(task = {}) {
  document.getElementById("taskModalTitle").innerText =
    editIdx === null ? "Create Task" : "Edit Task";
  document.getElementById("taskTitle").value = task.title || "";
  document.getElementById("taskDesc").value = task.desc || "";
  document.getElementById("taskDeadline").value = task.deadline
    ? task.deadline.slice(0, 16)
    : "";
  const assignSelect = document.getElementById("assignTo");
  assignSelect.innerHTML =
    `<option value="">-- Assign to member --</option>` +
    group.members
      .map((mid) => {
        const mem = cls.memberList.find((m) => m.id === mid);
        if (!mem) return "";
        return `<option value="${mem.id}" ${
          task.assign_to === mem.id ? "selected" : ""
        }>${mem.name}</option>`;
      })
      .join("");
  // Đặt min cho deadline
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now - tzoffset).toISOString().slice(0, 16);
  document.getElementById("taskDeadline").setAttribute("min", localISOTime);

  taskModal.classList.remove("hidden");
}
document.getElementById("saveTaskBtn").onclick = function () {
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const deadline = document.getElementById("taskDeadline").value;
  const assign_to = document.getElementById("assignTo").value;
  if (!title) {
    alert("Enter a title!");
    return;
  }
  if (!deadline) {
    alert("Select a deadline!");
    return;
  }
  if (!assign_to) {
    alert("Select an assignee!");
    return;
  }
  const newTask = { title, desc, deadline, assign_to, completed: false };
  if (editIdx === null) {
    group.tasks = group.tasks || [];
    group.tasks.unshift(newTask);
  } else {
    // Khi edit, giữ nguyên completion_time nếu đã có
    newTask.completed = group.tasks[editIdx].completed;
    newTask.completion_time = group.tasks[editIdx].completion_time;
    group.tasks[editIdx] = { ...group.tasks[editIdx], ...newTask };
  }
  saveToLocal();
  renderTasks();
  taskModal.classList.add("hidden");
};

// Thiết lập đếm ngược cho từng task
function setupTaskCountdown(idx, task) {
  const el = document.getElementById(`countdown-task-${idx}`);
  if (!el) return;
  if (!task.deadline) {
    el.innerHTML = task.completed
      ? `<span class="text-green-600">Completed</span>`
      : "";
    if (countdownTimers[idx]) clearInterval(countdownTimers[idx]);
    return;
  }
  function updateCountdown() {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diff = deadline - now;
    let html = "";

    let isOverForCompletion = false;
    if (task.completed && task.completion_time) {
      const completionTime = new Date(task.completion_time);
      isOverForCompletion = deadline < completionTime;
    }

    if (diff <= 0) {
      // Đã trễ deadline
      if (task.completed) {
        html = isOverForCompletion
          ? `<span class="text-red-600">Past deadline!</span> <span class="text-green-600 ml-2">Completed</span>`
          : `<span class="text-green-600">Completed (on time)</span>`;
      } else {
        html = `<span class="text-red-600">Past deadline!</span>`;
      }
      clearInterval(countdownTimers[idx]);
    } else {
      // Not past deadline yet
      if (task.completed) {
        html = `<span class="text-green-600">Completed</span>`;

        clearInterval(countdownTimers[idx]);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        html = `<span class="text-red-600">${
          d > 0 ? d + " ngày " : ""
        }${h}h ${m}m ${s}s</span>`;
      }
    }
    el.innerHTML = html;
  }
  updateCountdown();
  countdownTimers[idx] = setInterval(updateCountdown, 1000);
}

// Mở/đóng modal
function openStatsModal() {
  document.getElementById("statsModal").classList.remove("hidden");
}
function closeStatsModal() {
  document.getElementById("statsModal").classList.add("hidden");
}

// Gắn nút
const statsBtn = document.getElementById("btnStats");
if (statsBtn) statsBtn.addEventListener("click", showGroupStats);

// Hiển thị thống kê nhóm
function showGroupStats() {
  const body = document.getElementById("statsBody");
  body.innerHTML = ""; // reset

  // Empty state: no members
  if (!group.members || group.members.length === 0) {
    body.innerHTML = `
    <div class="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
      The group <b>has no members</b>. Please add members to start assigning tasks and viewing statistics.
    </div>`;
    openStatsModal();
    return;
  }

  // Gom dữ liệu thống kê
  const stats = {};
  group.members.forEach((mid) => {
    const mem = cls.memberList.find((m) => m.id === mid);
    stats[mid] = {
      name: mem ? mem.name : "Unknown",
      total: 0,
      done: 0,
      doing: 0,
      late: 0,
      lateDone: 0,
    };
  });

  const now = new Date();
  const tasks = group.tasks || [];

  tasks.forEach((t) => {
    if (!t.assign_to || !stats[t.assign_to]) return;

    const s = stats[t.assign_to];
    s.total++;

    const hasDeadline = !!t.deadline;
    const deadline = hasDeadline ? new Date(t.deadline) : null;

    let isOverForCompletion = false;
    if (t.completed && t.completion_time) {
      const completionTime = new Date(t.completion_time);
      isOverForCompletion = hasDeadline && deadline < completionTime;
    }

    if (t.completed) {
      // Hoàn thành: kiểm tra dựa trên completion_time
      if (isOverForCompletion) {
        s.lateDone++; // Hoàn thành sau deadline
      } else {
        s.done++; // Hoàn thành đúng hạn hoặc không deadline
      }
    } else {
      // Chưa hoàn thành: kiểm tra dựa trên now
      const isOver = hasDeadline && deadline < now;
      if (isOver) {
        s.late++; // Trễ deadline (chưa hoàn thành)
      } else {
        s.doing++; // Đang làm
      }
    }
  });

  // Empty state: có thành viên nhưng không có task
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    body.innerHTML = `
    <div class="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 mb-4">
      <b>No tasks yet</b> to display statistics. Please create tasks for the members.
    </div>
    ${renderStatsTable(stats)}
  `;
    openStatsModal();
    return;
  }

  // Có task → render bảng + tổng quan
  const totals = Object.values(stats).reduce(
    (acc, s) => {
      acc.total += s.total;
      acc.done += s.done;
      acc.doing += s.doing;
      acc.late += s.late;
      acc.lateDone += s.lateDone;
      return acc;
    },
    { total: 0, done: 0, doing: 0, late: 0, lateDone: 0 }
  );

  const pct = (num, den) => (den ? Math.round((num / den) * 100) : 0);

  body.innerHTML = `
  <div class="grid sm:grid-cols-5 gap-3 mb-4">
    <div class="p-3 rounded-lg bg-gray-50 border">
      <div class="text-xs text-gray-500">Total Tasks</div>
      <div class="text-xl font-semibold">${totals.total}</div>
    </div>
    <div class="p-3 rounded-lg bg-green-50 border border-green-200">
      <div class="text-xs text-green-700">Completed</div>
      <div class="text-xl font-semibold text-green-700">${totals.done}</div>
      <div class="text-xs text-green-700">${pct(
        totals.done,
        totals.total
      )}%</div>
    </div>
    <div class="p-3 rounded-lg bg-amber-50 border border-amber-200">
      <div class="text-xs text-amber-700">In Progress</div>
      <div class="text-xl font-semibold text-amber-700">${totals.doing}</div>
      <div class="text-xs text-amber-700">${pct(
        totals.doing,
        totals.total
      )}%</div>
    </div>
    <div class="p-3 rounded-lg bg-red-50 border border-red-200">
      <div class="text-xs text-red-700">Overdue</div>
      <div class="text-xl font-semibold text-red-700">${totals.late}</div>
      <div class="text-xs text-red-700">${pct(totals.late, totals.total)}%</div>
    </div>
    <div class="p-3 rounded-lg bg-fuchsia-50 border border-fuchsia-200">
      <div class="text-xs text-fuchsia-700">Overdue + Completed</div>
      <div class="text-xl font-semibold text-fuchsia-700">${
        totals.lateDone
      }</div>
      <div class="text-xs text-fuchsia-700">${pct(
        totals.lateDone,
        totals.total
      )}%</div>
    </div>
  </div>

    ${renderStatsTable(stats)}
  `;

  openStatsModal();
}

// Tạo bảng thống kê đẹp với Tailwind
function renderStatsTable(stats) {
  const rows = Object.values(stats)
    .map((s) => {
      const total = s.total;
      const bar = buildBar(total, s.done, s.doing, s.late + s.lateDone);
      return `
      <tr class="hover:bg-gray-50">
        <td class="border px-3 py-2 whitespace-nowrap">${s.name}</td>
        <td class="border px-3 py-2 text-center">${total}</td>
        <td class="border px-3 py-2 text-center">
          <span class="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">${s.done}</span>
        </td>
        <td class="border px-3 py-2 text-center">
          <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">${s.doing}</span>
        </td>
        <td class="border px-3 py-2 text-center">
          <span class="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">${s.late}</span>
        </td>
        <td class="border px-3 py-2 text-center">
          <span class="px-2 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 text-xs">${s.lateDone}</span>
        </td>

        <!-- Tỉ lệ: tăng độ rộng -->
        <td class="border px-3 py-2 align-middle min-w-[180px] w-[220px]">
          ${bar}
        </td>
      </tr>
    `;
    })
    .join("");

  return `
  <div class="overflow-x-auto rounded-lg border">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2 text-left">Member</th>
          <th class="border px-3 py-2 w-20 text-center">Total</th>
          <th class="border px-3 py-2 w-28 text-center text-green-700">Completed</th>
          <th class="border px-3 py-2 w-28 text-center text-amber-700">In Progress</th>
          <th class="border px-3 py-2 w-32 text-center text-red-700">Overdue</th>
          <th class="border px-3 py-2 w-40 text-center text-fuchsia-700">Overdue + Completed</th>

          <!-- Ratio: increase width -->
          <th class="border px-3 py-2 text-left min-w-[180px] w-[220px]">Ratio</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  `;
}

// Thanh tỷ lệ gộp (done / doing / late+lateDone)
function buildBar(total, done, doing, lateAll) {
  if (!total) {
    return `<div class="text-xs text-gray-400">Chưa có dữ liệu</div>`;
  }
  let pDone = Math.round((done / total) * 100);
  let pDoing = Math.round((doing / total) * 100);
  // Phần còn lại dồn cho lateAll để luôn = 100%
  let pLate = 100 - pDone - pDoing;
  if (pLate < 0) pLate = 0;

  return `
    <div class="w-full bg-gray-100 rounded h-2.5 overflow-hidden">
      <div class="h-2.5 bg-green-500 inline-block" style="width:${pDone}%"></div>
      <div class="h-2.5 bg-amber-500 inline-block" style="width:${pDoing}%"></div>
      <div class="h-2.5 bg-red-500 inline-block" style="width:${pLate}%"></div>
    </div>
    <div class="mt-1 text-[11px] text-gray-500">
      ${pDone}% completed • ${pDoing}% in progress • ${pLate}% overdue/other
    </div>
  `;
}