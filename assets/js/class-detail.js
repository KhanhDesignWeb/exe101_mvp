let classes = JSON.parse(localStorage.getItem("classes")) || [];
let countdownTimers = [];
const params = new URLSearchParams(window.location.search);
const classId = params.get("id");
// Thêm dòng này để lưu classId vào localStorage
if (classId) localStorage.setItem("currentClassId", classId);

const cls = classes.find((c) => c.class_id === classId);

if (!cls) {
  document.body.innerHTML =
    '<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy lớp này!</div>';
  throw "Class not found";
}

document.getElementById("className").innerText = cls.name;
document.getElementById("classId").innerText = cls.class_id;
document.getElementById("teacher").innerText = cls.teacher;
document.getElementById("members").innerText = cls.members;
document.getElementById("subjectCode").innerText = cls.subject_code;
document.getElementById("semester").innerText = cls.semester;
document.getElementById("status").innerText = cls.status;

function renderTopics() {
  // Xóa hết timer cũ trước khi render lại
  countdownTimers.forEach((id) => clearTimeout(id));
  countdownTimers = [];
  const topicsList = document.getElementById("topicsList");
  if (!cls.topics || cls.topics.length === 0) {
    topicsList.innerHTML =
      "<div class='text-gray-500'>There are no topics yet.</div>";
    return;
  }
  topicsList.innerHTML = cls.topics
    .map(
      (t, idx) => `
     <div class="p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-200 bg-white relative"
          onclick="goToTopic('${cls.class_id}','${t.topic_id}')">
          <button class="topic-delete-btn text-red-500 hover:text-red-700 font-bold text-lg"
                  title="Xóa chủ đề"
                  onclick="event.stopPropagation(); deleteTopic(${idx}); return false;">×</button>
          <div class="text-gray-900 font-semibold text-base">${t.title}</div>
          <div class="text-gray-500 text-sm">by ${t.created_by}</div>
          <div class="text-gray-500 text-sm">
            <b>Thời gian kết thúc:</b> <span id="topic-end-${idx}">${
        t.end_time ? new Date(t.end_time).toLocaleString() : "Không đặt"
      }</span>
            <span class="ml-2 text-red-600" id="countdown-${idx}"></span>
          </div>
          <div class="text-gray-500 text-sm flex justify-end space-x-4">
              <span>${t.answers ? t.answers.length : 0} replies</span>
              <span>${
                t.created_at ? new Date(t.created_at).toLocaleString() : ""
              }</span>
          </div>
      </div>
  `
    )
    .join("");

  // Countdown
  cls.topics.forEach((t, idx) => {
    if (t.end_time && t.created_at) {
      startCountdown(t.end_time, `countdown-${idx}`, t.created_at, idx);
    }
  });
}

window.deleteTopic = function (idx) {
  if (!confirm("Bạn có chắc muốn xóa chủ đề này không?")) return;
  cls.topics.splice(idx, 1);
  localStorage.setItem("classes", JSON.stringify(classes));
  renderTopics();
};

//Đặt min cho input datetime-local
const now = new Date();
const tzoffset = now.getTimezoneOffset() * 60000; // bù múi giờ
const localISOTime = new Date(now - tzoffset).toISOString().slice(0, 16);
document.getElementById("topicEndTime").setAttribute("min", localISOTime);

// Cập nhật thông tin số lượng thành viên và học viên
function updateMemberSection() {
  const memberCountEl = document.getElementById("memberCount");
  const studentCountEl = document.getElementById("studentCount");

  if (!cls.memberList || cls.memberList.length === 0) {
    memberCountEl.textContent = 0;
    studentCountEl.textContent = 0;
    return;
  }

  const totalMembers = cls.memberList.length;

  // Giả sử giáo viên là người có tên trùng với cls.teacher
  const studentCount = cls.memberList.filter(
    (m) => m.name !== cls.teacher
  ).length;

  memberCountEl.textContent = totalMembers;
  studentCountEl.textContent = studentCount;
}

function renderMemberList() {
  const container = document.getElementById("memberListContainer");
  container.innerHTML = "";

  if (!cls.memberList) cls.memberList = [];

  cls.memberList.forEach((member, index) => {
    const isTeacher = member.name === cls.teacher;

    const div = document.createElement("div");
    div.className =
      "p-4 bg-blue-50 rounded-lg flex items-center justify-between";

    div.innerHTML = `
      <div>
        <div class="flex items-center space-x-2">
          <span class="bg-gray-200 text-xs w-7 h-7 flex items-center justify-center rounded-full">
            ${member.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </span>
          <span class="font-medium">${member.name}</span>
          <span class="text-gray-500 text-sm">${
            isTeacher ? "Teacher" : "Student"
          }</span>
        </div>
        <div class="text-gray-500 text-sm">${
          isTeacher ? "Instructor" : ""
        }</div>
      </div>
      ${
        !isTeacher
          ? `<button class="text-red-600 text-sm hover:underline" onclick="removeMemberById('${member.id}')">❌ Remove</button>`
          : ""
      }
    `;

    container.appendChild(div);
  });

  updateMemberSection(); // cập nhật số lượng hiển thị
}
const addMemberModal = document.getElementById("addMemberModal");
const availableStudentsList = document.getElementById("availableStudentsList");
const cancelAddMember = document.getElementById("cancelAddMember");
const confirmAddMember = document.getElementById("confirmAddMember");

// Hiển thị modal khi bấm nút "Add Member"
document.getElementById("addMemberBtn").addEventListener("click", () => {
  const students = JSON.parse(localStorage.getItem("students") || "[]");
  const currentIds = cls.memberList.map((m) => m.id);
  const availableToAdd = students.filter((s) => !currentIds.includes(s.id));

  if (availableToAdd.length === 0) {
    alert("Không còn học viên nào để thêm.");
    return;
  }

  availableStudentsList.innerHTML = availableToAdd
    .map(
      (s, i) => `
    <label class="flex items-center space-x-2">
      <input type="checkbox" value="${s.id}" class="studentCheckbox" />
      <span>${s.name}</span>
    </label>`
    )
    .join("");

  addMemberModal.classList.remove("hidden");
});

// Hủy thêm
cancelAddMember.addEventListener("click", () => {
  addMemberModal.classList.add("hidden");
});

// Xác nhận thêm thành viên
confirmAddMember.addEventListener("click", () => {
  const checkedBoxes = document.querySelectorAll(".studentCheckbox:checked");
  const selectedIds = Array.from(checkedBoxes).map((cb) => cb.value);

  if (selectedIds.length === 0) {
    alert("Chưa chọn học viên nào.");
    return;
  }

  const students = JSON.parse(localStorage.getItem("students") || "[]");
  const toAdd = students.filter((s) => selectedIds.includes(s.id));

  cls.memberList.push(...toAdd);
  localStorage.setItem("classes", JSON.stringify(classes));
  renderMemberList();
  addMemberModal.classList.add("hidden");
});

// Tab switching

document.getElementById("discussionsTab").addEventListener("click", () => {
  document.getElementById("discussionsSection").classList.remove("hidden");
  document.getElementById("membersSection").classList.add("hidden");
  document.getElementById("resourcesSection").classList.add("hidden");
  document.getElementById("groupsSection").classList.add("hidden");

  // Active tab
  document
    .getElementById("discussionsTab")
    .classList.add("bg-white", "border", "text-gray-900");
  document
    .getElementById("discussionsTab")
    .classList.remove("bg-gray-200", "text-gray-600");

  // Inactive tabs
  document
    .getElementById("membersTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("membersTab")
    .classList.add("bg-gray-200", "text-gray-600");

  document
    .getElementById("resourcesTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("resourcesTab")
    .classList.add("bg-gray-200", "text-gray-600");
  document
    .getElementById("groupsTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("groupsTab")
    .classList.add("bg-gray-200", "text-gray-600");
});

document.getElementById("membersTab").addEventListener("click", () => {
  document.getElementById("discussionsSection").classList.add("hidden");
  document.getElementById("membersSection").classList.remove("hidden");
  document.getElementById("resourcesSection").classList.add("hidden");
  document.getElementById("groupsSection").classList.add("hidden");

  document
    .getElementById("membersTab")
    .classList.add("bg-white", "border", "text-gray-900");
  document
    .getElementById("membersTab")
    .classList.remove("bg-gray-200", "text-gray-600");

  document
    .getElementById("discussionsTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("discussionsTab")
    .classList.add("bg-gray-200", "text-gray-600");

  document
    .getElementById("resourcesTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("resourcesTab")
    .classList.add("bg-gray-200", "text-gray-600");
  document
    .getElementById("groupsTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("groupsTab")
    .classList.add("bg-gray-200", "text-gray-600");
});

document.getElementById("resourcesTab").addEventListener("click", () => {
  document.getElementById("discussionsSection").classList.add("hidden");
  document.getElementById("membersSection").classList.add("hidden");
  document.getElementById("resourcesSection").classList.remove("hidden");
  document.getElementById("groupsSection").classList.add("hidden");

  document
    .getElementById("resourcesTab")
    .classList.add("bg-white", "border", "text-gray-900");
  document
    .getElementById("resourcesTab")
    .classList.remove("bg-gray-200", "text-gray-600");

  document
    .getElementById("discussionsTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("discussionsTab")
    .classList.add("bg-gray-200", "text-gray-600");

  document
    .getElementById("membersTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("membersTab")
    .classList.add("bg-gray-200", "text-gray-600");
  document
    .getElementById("groupsTab")
    .classList.remove("bg-white", "border", "text-gray-900");
  document
    .getElementById("groupsTab")
    .classList.add("bg-gray-200", "text-gray-600");
});

document.getElementById("groupsTab").addEventListener("click", () => {
  document.getElementById("discussionsSection").classList.add("hidden");
  document.getElementById("membersSection").classList.add("hidden");
  document.getElementById("resourcesSection").classList.add("hidden");
  document.getElementById("groupsSection").classList.remove("hidden");

  // Active tab
  document
    .getElementById("groupsTab")
    .classList.add("bg-white", "border", "text-gray-900");
  document
    .getElementById("groupsTab")
    .classList.remove("bg-gray-200", "text-gray-600");

  // Inactive tabs
  ["discussionsTab", "membersTab", "resourcesTab"].forEach((id) => {
    document
      .getElementById(id)
      .classList.remove("bg-white", "border", "text-gray-900");
    document.getElementById(id).classList.add("bg-gray-200", "text-gray-600");
  });
});

// Đặt mặc định là Discussions sau khi gán xong sự kiện
document.getElementById("discussionsTab").click();

window.goToTopic = function (classId, topicId) {
  window.location.href = `topic-detail.html?class_id=${classId}&topic_id=${topicId}`;
};

renderTopics();
renderMemberList();
renderGroups();

// Thêm chủ đề mới
document.getElementById("addTopicBtn").onclick = () => {
  const title = document.getElementById("topicTitle").value.trim();
  const desc = document.getElementById("topicDesc").value.trim();
  const endTimeInput = document.getElementById("topicEndTime").value; // local time
  const endTimeISO = new Date(endTimeInput).toISOString(); // luôn ISO UTC

  if (!title) {
    alert("Nhập tiêu đề.");
    return;
  }
  if (!endTimeISO) {
    alert("Vui lòng chọn thời gian kết thúc cho chủ đề!");
    document.getElementById("topicEndTime").focus();
    return;
  }
  // Kiểm tra không cho phép ngày quá khứ
  if (new Date(endTimeISO) <= new Date()) {
    alert("Thời gian kết thúc phải lớn hơn thời gian hiện tại!");
    document.getElementById("topicEndTime").focus();
    return;
  }

  cls.topics = cls.topics || [];
  cls.topics.unshift({
    topic_id: "T" + (cls.topics.length + 1),
    title,
    description: desc,
    end_time: endTimeISO,
    created_by: "Nguyen Van A",
    created_at: new Date().toISOString(),
    answers: [],
  });

  localStorage.setItem("classes", JSON.stringify(classes));
  renderTopics();
  document.getElementById("topicTitle").value = "";
  document.getElementById("topicDesc").value = "";
  document.getElementById("topicEndTime").value = "";
};

// Xóa thành viên khỏi lớp
window.removeMemberById = function (id) {
  if (!confirm("Bạn có chắc muốn xóa thành viên này khỏi lớp không?")) return;
  console.log("Removing member with ID:", id);
  cls.memberList = cls.memberList.filter((member) => member.id !== id);
  localStorage.setItem("classes", JSON.stringify(classes));
  renderMemberList();
};

// ==== GROUP MANAGEMENT ====
function renderGroups() {
  if (!cls.groups) cls.groups = [];
  const groupList = document.getElementById("groupList");
  const groupCountEl = document.getElementById("groupCount");

  groupCountEl.textContent = cls.groups.length;
  groupList.innerHTML = "";

  cls.groups.forEach((group, index) => {
    const groupDiv = document.createElement("div");
    groupDiv.className =
      "border border-gray-300 p-4 rounded cursor-pointer hover:shadow transition";

    const membersHtml = group.members
      .map((id) => {
        const m = cls.memberList.find((mem) => mem.id === id);
        return m ? `<li>${m.name}</li>` : "";
      })
      .join("");

    const availableToAdd = cls.memberList.filter(
      (m) => !group.members.includes(m.id)
    );

    groupDiv.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold">Group ${index + 1}</h4>
        <!-- CHẶN NỔI BỌT Ở NÚT XÓA -->
        <button onclick="event.stopPropagation(); deleteGroup(${index})"
                class="text-red-500 hover:text-red-700 font-bold text-lg"
                title="Xóa nhóm">×</button>
      </div>

      <ul class="ml-4 text-sm text-gray-700">
        ${membersHtml || "<li><em>No members</em></li>"}
      </ul>

      ${
        availableToAdd.length > 0
          ? `
        <!-- CHẶN NỔI BỌT Ở SELECT -->
        <select id="addMemberSelect_${index}"
                class="mt-2 border p-1 rounded text-sm"
                onclick="event.stopPropagation()"
                onmousedown="event.stopPropagation()"
                onchange="event.stopPropagation()">
          <option value="">+ Add Member</option>
          ${availableToAdd
            .map((m) => `<option value="${m.id}">${m.name}</option>`)
            .join("")}
        </select>
        `
          : ""
      }
    `;

    // Gán change handler cho select (NHỚ stopPropagation trong handler)
    if (availableToAdd.length > 0) {
      const sel = groupDiv.querySelector(`#addMemberSelect_${index}`);
      sel.addEventListener("change", (e) => {
        e.stopPropagation(); // quan trọng!
        const selectedId = e.target.value;
        if (!selectedId) return;

        cls.groups[index].members.push(selectedId);
        localStorage.setItem("classes", JSON.stringify(classes));
        renderGroups();
      });
    }

    // Chỉ điều hướng khi click vào khoảng trống của thẻ group (không phải button/select)
    groupDiv.addEventListener("click", (e) => {
      // Nếu click vào phần tử tương tác thì bỏ qua
      if (e.target.closest("button, select, option, input, label, a")) return;
      window.location.href = `group-detail.html?class_id=${cls.class_id}&group_index=${index}`;
    });

    groupList.appendChild(groupDiv);
  });
}

document.getElementById("createGroupBtn").addEventListener("click", () => {
  if (!cls.groups) cls.groups = [];
  cls.groups.push({ members: [] });
  localStorage.setItem("classes", JSON.stringify(classes));
  renderGroups();
});

window.deleteGroup = function (index) {
  if (!confirm("Bạn có chắc muốn xoá nhóm này không?")) return;
  cls.groups.splice(index, 1);
  localStorage.setItem("classes", JSON.stringify(classes));
  renderGroups();
};

function startCountdown(endTimeStr, countdownElemId, createdAtStr, idx) {
  const endTime = Date.parse(endTimeStr);
  let startTime;
  if (createdAtStr) {
    let t = Date.parse(createdAtStr);
    if (isNaN(t)) t = new Date(createdAtStr).getTime();
    startTime = t;
  } else {
    startTime = Date.now();
  }
  const total = endTime - startTime;

  function updateCountdown() {
    const now = Date.now();
    const diff = endTime - now;
    const el = document.getElementById(countdownElemId);
    if (!el) return;
    el.classList.remove(
      "countdown-green",
      "countdown-yellow",
      "countdown-red",
      "countdown-expired"
    );
    if (diff <= 0) {
      el.textContent = "Đã hết thời gian!";
      el.classList.add("countdown-expired");
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    el.textContent = `Còn lại: ${d > 0 ? d + " ngày " : ""}${h}h ${m}m ${s}s`;
    // Lưu id timer vào mảng countdownTimers theo index
    countdownTimers[idx] = setTimeout(updateCountdown, 1000);
  }
  updateCountdown();
}

// ======= RANKING FEATURE =======

// Hiển thị popup bảng xếp hạng khi bấm nút
document.getElementById("rankButton").addEventListener("click", () => {
  renderRankModal();
  document.getElementById("rankModal").classList.remove("hidden");
});

// Ẩn popup khi bấm nút đóng
document.getElementById("closeRankModal").addEventListener("click", () => {
  document.getElementById("rankModal").classList.add("hidden");
});

// Hàm render nội dung bảng xếp hạng vào modal
function renderRankModal(page = 1) {
  const container = document.getElementById("rankModalContent");
  container.innerHTML = ""; // Xóa nội dung cũ

  const rankedMembers = [...cls.memberList].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0)
  );
  if (rankedMembers.length === 0) {
    container.innerHTML = `<div class="text-gray-500 text-center py-4">Chưa có thành viên nào.</div>`;
    return;
  }

  // Cài đặt phân trang
  const itemsPerPage = 8;
  const totalPages = Math.ceil(rankedMembers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = rankedMembers.slice(startIndex, endIndex);

  // SVG crown icon cho top 1
  const crown = `<svg class="rank-crown" width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 18H22L20.5 11L15 14L12 8L9 14L3.5 11L2 18Z" fill="#FFD700" stroke="#DAA520" stroke-width="1.5"/>
  </svg>`;

  // Tạo HTML cho bảng xếp hạng
  const tableHTML = `
    <div class="overflow-x-auto">
      <table class="rank-table w-full text-left">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-3 px-4 w-12 text-center font-semibold text-gray-700 border-b border-gray-200">Hạng</th>
            <th class="py-3 px-4 font-semibold text-gray-700 border-b border-gray-200">Thành viên</th>
            <th class="py-3 px-4 text-center font-semibold text-gray-700 border-b border-gray-200">Số sao</th>
          </tr>
        </thead>
        <tbody>
          ${currentMembers
            .map((m, i) => {
              const globalIndex = startIndex + i + 1;
              return `
              <tr class="${
                globalIndex === 1
                  ? "top-1"
                  : globalIndex === 2
                  ? "top-2"
                  : globalIndex === 3
                  ? "top-3"
                  : ""
              }">
                <td class="py-3 px-4 text-center font-medium text-gray-800 border-b border-gray-200">${globalIndex}</td>
                <td class="py-3 px-4 flex items-center gap-3 border-b border-gray-200">
                  ${globalIndex === 1 ? crown : ""}
                  <span class="font-medium ${
                    globalIndex <= 3 ? "text-gray-900" : "text-gray-700"
                  }">${m.name}</span>
                </td>
                <td class="py-3 px-4 text-center font-medium border-b border-gray-200">
                  ${m.rating || 0}
                  <span class="rank-star">★</span>
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  // Tạo HTML cho phân trang
  const paginationHTML = `
    <div class="flex justify-between items-center mt-4">
      <div class="text-sm text-gray-500">
        Hiển thị ${startIndex + 1}-${Math.min(
    endIndex,
    rankedMembers.length
  )} trong ${rankedMembers.length} thành viên
      </div>
      <div class="flex gap-2">
        <button class="pagination-btn px-3 py-1.5 rounded-md text-sm ${
          page === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }" 
                ${page === 1 ? "disabled" : ""} 
                onclick="renderRankModal(${page - 1})">Trước</button>
        <div class="flex gap-1">
          ${Array.from(
            { length: totalPages },
            (_, i) => `
            <button class="pagination-btn px-3 py-1.5 rounded-md text-sm ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }" 
                    onclick="renderRankModal(${i + 1})">${i + 1}</button>
          `
          ).join("")}
        </div>
        <button class="pagination-btn px-3 py-1.5 rounded-md text-sm ${
          page === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }" 
                ${page === totalPages ? "disabled" : ""} 
                onclick="renderRankModal(${page + 1})">Sau</button>
      </div>
    </div>
  `;

  container.innerHTML = `
    ${tableHTML}
    ${paginationHTML}
    <div class="text-xs text-gray-400 text-right mt-2">* Top 1, 2, 3 được làm nổi bật</div>
  `;
}
// ==== REPORT FEATURE ====
// Giả sử dữ liệu báo cáo lưu trong localStorage hoặc API trả về
// Ví dụ tạm: reportData = JSON.parse(localStorage.getItem("reportData")) || [];
let reportData =
  JSON.parse(localStorage.getItem("cognitiveEngagementHistory")) || [];

document.getElementById("reportButton").addEventListener("click", () => {
  renderReportModal();
  document.getElementById("reportModal").classList.remove("hidden");
});

document.getElementById("closeReportModal").addEventListener("click", () => {
  document.getElementById("reportModal").classList.add("hidden");
});
function renderReportModal() {
  const container = document.getElementById("reportModalContent");
  container.innerHTML = "";

  if (!reportData || reportData.length === 0) {
    container.innerHTML = `<div class="text-gray-500 text-center py-4">Chưa có dữ liệu báo cáo.</div>`;
    return;
  }

  // Đếm số lần Negative, Neutral, Positive cho mỗi học viên
  const summary = {};
  reportData.forEach((item) => {
    const name = item.senderName;
    if (!summary[name]) {
      summary[name] = { Negative: 0, Neutral: 0, Positive: 0 };
    }
    if (summary[name][item.engagement] !== undefined) {
      summary[name][item.engagement]++;
    }
  });
  // Hàm đánh giá chung dựa vào loại nhiều nhất
  //Negative nhiều nhất → "Chưa thực sự tham gia đóng góp vào bài học"
  // Neutral nhiều nhất → "Có tham gia nhưng cần cải thiện hơn"
  // Positive nhiều nhất → "Tích cực tham gia và đóng góp vào bài học"
  function getOverallAssessment(counts) {
    const maxType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    switch (maxType) {
      case "Negative":
        return "Has not actively contributed to the lesson";
      case "Neutral":
        return "Participated but needs improvement";
      case "Positive":
        return "Actively engaged and contributed to the lesson";
      default:
        return "No assessment available";
    }
  }
  // Tạo bảng
  const tableHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-4 border">Name</th>
            <th class="py-2 px-4 border text-center">Negative</th>
            <th class="py-2 px-4 border text-center">Neutral</th>
            <th class="py-2 px-4 border text-center">Positive</th>
            <th class="py-2 px-4 border text-center">Overall Assessment</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(summary)
            .map(
              ([name, counts]) => `
            <tr>
              <td class="py-2 px-4 border">${name}</td>
              <td class="py-2 px-4 border text-center">${counts.Negative}</td>
              <td class="py-2 px-4 border text-center">${counts.Neutral}</td>
              <td class="py-2 px-4 border text-center">${counts.Positive}</td>
              <td class="py-2 px-4 border text-center">${getOverallAssessment(
                counts
              )}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}
