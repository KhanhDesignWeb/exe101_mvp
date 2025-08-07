// assets/js/group-detail.js

// Lấy id lớp và index group từ query string
const params = new URLSearchParams(window.location.search);
const classId = params.get("class_id");
const groupIndex = +params.get("group_index");

let countdownTimers = []; // Lưu các interval cho từng task để clear khi render lại
let classes = JSON.parse(localStorage.getItem("classes")) || [];
const cls = classes.find(c => c.class_id === classId);
if (!cls || !cls.groups || !cls.groups[groupIndex]) {
    document.body.innerHTML = '<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy group này!</div>';
    throw "Group not found";
}
const group = cls.groups[groupIndex];
document.getElementById("backToClass").href = `class-detail.html?id=${classId}`;
document.getElementById("groupName").innerText = `Group ${groupIndex + 1}`;

// Render thành viên nhóm
function renderMembers() {
    const groupMembers = document.getElementById("groupMembers");
    groupMembers.innerHTML = group.members.map(memberId => {
        const mem = cls.memberList.find(m => m.id === memberId);
        if (!mem) return "";
        const initials = mem.name.split(" ").map(w => w[0]).join("").toUpperCase();
        return `
      <div class="flex items-center gap-2 bg-blue-50 rounded p-2 px-4 shadow">
        <span class="bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full text-base font-bold">${initials}</span>
        <span class="font-medium">${mem.name}</span>
      </div>
    `;
    }).join("") || `<span class="text-gray-400">Chưa có thành viên nào.</span>`;
}
renderMembers();

// Quản lý Task
function saveToLocal() {
    localStorage.setItem("classes", JSON.stringify(classes));
}

// Hiển thị danh sách nhiệm vụ
function renderTasks() {
    // Dừng hết interval cũ
    countdownTimers.forEach(timer => clearInterval(timer));
    countdownTimers = [];
    const tasksList = document.getElementById("tasksList");
    group.tasks = group.tasks || [];
    if (group.tasks.length === 0) {
        tasksList.innerHTML = `<div class="text-gray-400">Chưa có nhiệm vụ nào.</div>`;
        return;
    }
    tasksList.innerHTML = group.tasks.map((task, idx) => {
        const mem = cls.memberList.find(m => m.id === task.assign_to);
        const assignedName = mem ? mem.name : "Chưa giao";
        const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleString() : "Không đặt";
        // Tính trạng thái để disable nút check nếu cần
        let isLate = false;
        if (task.deadline) {
            isLate = (new Date(task.deadline) < new Date());
        }
        // Nếu trễ deadline và đã hoàn thành => disable checkbox
        const checkboxDisabled = (isLate && task.completed) ? "disabled" : "";

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
          <button onclick="editTask(${idx})" class="text-blue-500 text-xs hover:underline">Sửa</button>
          <button onclick="deleteTask(${idx})" class="text-red-500 text-xs hover:underline">Xóa</button>
          <label class="flex items-center gap-1 mt-1 cursor-pointer">
            <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleDone(${idx})" ${checkboxDisabled}/>
            <span class="text-xs">Hoàn thành</span>
          </label>
        </div>
      </div>
    `;
    }).join("");
    // Gọi lại countdown cho từng task
    group.tasks.forEach((task, idx) => {
        setupTaskCountdown(idx, task);
    });
}


renderTasks();

window.deleteTask = function (idx) {
    if (!confirm("Xóa nhiệm vụ này?")) return;
    group.tasks.splice(idx, 1);
    saveToLocal();
    renderTasks();
};

window.toggleDone = function (idx) {
    const task = group.tasks[idx];
    const now = new Date();
    const deadline = new Date(task.deadline);
    // Nếu đã trễ deadline và đã hoàn thành thì không cho bỏ tick nữa
    if ((deadline < now) && task.completed) {
        alert("Không thể bỏ hoàn thành cho nhiệm vụ đã hoàn thành sau deadline!");
        renderTasks(); // Để checkbox về đúng trạng thái
        return;
    }
    group.tasks[idx].completed = !group.tasks[idx].completed;
    localStorage.setItem("classes", JSON.stringify(classes));
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
    document.getElementById("taskModalTitle").innerText = editIdx === null ? "Tạo nhiệm vụ" : "Chỉnh sửa nhiệm vụ";
    document.getElementById("taskTitle").value = task.title || "";
    document.getElementById("taskDesc").value = task.desc || "";
    document.getElementById("taskDeadline").value = task.deadline ? task.deadline.slice(0, 16) : "";
    const assignSelect = document.getElementById("assignTo");
    assignSelect.innerHTML = `<option value="">-- Giao cho thành viên --</option>` +
        group.members.map(mid => {
            const mem = cls.memberList.find(m => m.id === mid);
            if (!mem) return "";
            return `<option value="${mem.id}" ${task.assign_to === mem.id ? "selected" : ""}>${mem.name}</option>`;
        }).join("");
    // Đặt min cho deadline
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - tzoffset)).toISOString().slice(0, 16);
    document.getElementById('taskDeadline').setAttribute('min', localISOTime);

    taskModal.classList.remove("hidden");
}
document.getElementById("saveTaskBtn").onclick = function () {
    const title = document.getElementById("taskTitle").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    const deadline = document.getElementById("taskDeadline").value;
    const assign_to = document.getElementById("assignTo").value;
    if (!title) {
        alert("Nhập tiêu đề!");
        return;
    }
    if (!deadline) {
        alert("Chọn deadline!");
        return;
    }
    if (!assign_to) {
        alert("Chọn thành viên được giao!");
        return;
    }
    const newTask = { title, desc, deadline, assign_to, completed: false };
    if (editIdx === null) {
        group.tasks = group.tasks || [];
        group.tasks.unshift(newTask);
    } else {
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
        el.innerHTML = '';
        if (countdownTimers[idx]) clearInterval(countdownTimers[idx]);
        return;
    }
    function updateCountdown() {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const diff = deadline - now;
        let html = "";

        if (diff <= 0) {
            // Đã trễ deadline
            if (task.completed) {
                html = `<span class="text-red-600">Trễ deadline!</span> <span class="text-green-600 ml-2">Đã hoàn thành</span>`;
            } else {
                html = `<span class="text-red-600">Trễ deadline!</span>`;
            }
            // Khi hết hạn, luôn show trạng thái này, không cần đếm tiếp
            clearInterval(countdownTimers[idx]);
        } else {
            // Chưa trễ deadline
            if (task.completed) {
                html = `<span class="text-green-600">Đã hoàn thành</span>`;
                clearInterval(countdownTimers[idx]);
            } else {
                // Còn hạn và chưa hoàn thành => hiện đếm ngược
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / (1000 * 60)) % 60);
                const s = Math.floor((diff / 1000) % 60);
                html = `<span class="text-red-600">${d > 0 ? d + " ngày " : ""}${h}h ${m}m ${s}s</span>`;
            }
        }
        el.innerHTML = html;
    }
    updateCountdown();
    countdownTimers[idx] = setInterval(updateCountdown, 1000);
}

