let classes = JSON.parse(localStorage.getItem("classes")) || [];

const params = new URLSearchParams(window.location.search);
const classId = params.get("id");

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
  const topicsList = document.getElementById("topicsList");
  if (!cls.topics || cls.topics.length === 0) {
    topicsList.innerHTML =
      "<div class='text-gray-500'>There are no topics yet.</div>";
    return;
  }
  topicsList.innerHTML = cls.topics
    .map(
      (t) => `
       <div class="p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-200 bg-white"        
         onclick="goToTopic('${cls.class_id}','${t.topic_id}')">
            <div class="text-gray-900 font-semibold text-base">${t.title}</div>
            <div class="text-gray-500 text-sm">by ${t.created_by}</div>
            <div class="text-gray-500 text-sm flex justify-end space-x-4">
                <span>${t.answers ? t.answers.length : 0} replies</span>
                <span>${t.created_at}</span>
            </div>
        </div>
    `
    )
    .join("");
}
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

document.getElementById("addTopicBtn").onclick = () => {
  const title = document.getElementById("topicTitle").value.trim();
  const desc = document.getElementById("topicDesc").value.trim();
  if (!title) {
    alert("Nhập tiêu đề.");
    return;
  }
  cls.topics = cls.topics || [];
  cls.topics.unshift({
    topic_id: "T" + (cls.topics.length + 1),
    title,
    description: desc,
    created_by: "Nguyen Van A",
    created_at: new Date().toLocaleString(),
    answers: [],
  });
  localStorage.setItem("classes", JSON.stringify(classes));
  renderTopics();
  document.getElementById("topicTitle").value = "";
  document.getElementById("topicDesc").value = "";
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
    groupDiv.className = "border border-gray-300 p-4 rounded";

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
        <button onclick="deleteGroup(${index})" class="text-red-500 text-sm hover:underline">🗑 Delete</button>
      </div>
      <ul class="ml-4 text-sm text-gray-700">${
        membersHtml || "<li><em>No members</em></li>"
      }</ul>
      ${
        availableToAdd.length > 0
          ? `
        <select id="addMemberSelect_${index}" class="mt-2 border p-1 rounded text-sm">
          <option value="">+ Add Member</option>
          ${availableToAdd
            .map((m) => `<option value="${m.id}">${m.name}</option>`)
            .join("")}
        </select>`
          : ""
      }
    `;

    if (availableToAdd.length > 0) {
      groupDiv
        .querySelector(`#addMemberSelect_${index}`)
        .addEventListener("change", (e) => {
          const selectedId = e.target.value;
          if (!selectedId) return;

          cls.groups[index].members.push(selectedId);
          localStorage.setItem("classes", JSON.stringify(classes));
          renderGroups();
        });
    }

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
