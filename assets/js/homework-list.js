/* ================= Utilities ================= */
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function nl2br(s = "") {
  return escapeHtml(s).replace(/\r\n|\r|\n/g, "<br>");
}
function showToast(msg, time = 3000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), time);
}

/* ================= Data & Init ================= */
let classes = JSON.parse(localStorage.getItem("classes") || "[]");
const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
const currentUser = {
  id: user.sub || "stu-demo",
  name: user.name || "Bạn",
  picture: user.picture || "https://via.placeholder.com/40",
};

const params = new URLSearchParams(location.search);
let classId = params.get("class_id");
let topicId = params.get("topic_id");

if (!classId) {
  document.body.innerHTML = `<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy class_id</div>`;
  throw new Error("class_id missing");
}

let clsIndex = classes.findIndex((c) => c.class_id === classId);
if (clsIndex === -1) {
  document.body.innerHTML = `<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy lớp này</div>`;
  throw new Error("class not found");
}
let cls = classes[clsIndex];

// tìm topic
let topic = cls.topics.find((t) => t.topic_id === topicId);
if (!topic) {
  document.body.innerHTML = `<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy topic</div>`;
  throw new Error("topic not found");
}

// đảm bảo homeworks tồn tại
if (!Array.isArray(topic.homeworks)) topic.homeworks = [];

// lưu text full để toggle
const SUB_FULL = {};
const SELECTED_FILES = {};

/* ================= Render ================= */
const homeworkListEl = document.getElementById("homeworkList");
document.getElementById(
  "discussionLink"
).href = `topic-detail.html?class_id=${encodeURIComponent(
  classId
)}&topic_id=${encodeURIComponent(topicId)}`;
document.getElementById(
  "thisHomeworkLink"
).href = `homework-list.html?class_id=${encodeURIComponent(
  classId
)}&topic_id=${encodeURIComponent(topicId)}`;
document.getElementById("infoStudents").innerText = (
  cls.memberList || []
).length;
document.getElementById("infoAssignments").innerText = (
  topic.homeworks || []
).length;
document.getElementById("infoDiscussions").innerText = (
  cls.topics || []
).length;

function saveClasses() {
  classes[clsIndex] = cls;
  localStorage.setItem("classes", JSON.stringify(classes));
  document.getElementById("infoAssignments").innerText = (
    topic.homeworks || []
  ).length;
}

function makeAttachmentHtml(hw) {
  if (!hw.attachments || !hw.attachments.length) return "";
  return (
    `<div class="mb-4"><strong>Attachments:</strong><div class="mt-2">` +
    hw.attachments
      .map((a) => {
        if (typeof a === "string")
          return `<a class="inline-block mr-3 text-sm text-blue-600 underline" href="${escapeHtml(
            a
          )}" target="_blank">📎 ${escapeHtml(a)}</a>`;
        if (a && a.name && a.url)
          return `<a class="inline-block mr-3 text-sm text-blue-600 underline" href="${escapeHtml(
            a.url
          )}" target="_blank">📎 ${escapeHtml(a.name)}</a>`;
        return "";
      })
      .join("") +
    `</div></div>`
  );
}

function truncatedText(txt, len = 150) {
  if (!txt) return "";
  return txt.length <= len ? txt : txt.slice(0, len) + "...";
}

function renderSubmissionHtml(hwId, idx, sub) {
  const key = `${hwId}|${idx}`;
  SUB_FULL[key] = sub.text || "";
  const shortEsc = nl2br(truncatedText(sub.text || "", 150));
  const needsToggle = (sub.text || "").length > 150;

  const filesHtml =
    sub.files && sub.files.length
      ? `<div class="mt-2 text-xs text-gray-500">Files: ${sub.files
          .map((f) => escapeHtml(f))
          .join(", ")}</div>`
      : "";

  const editBtn =
    sub.student_id === currentUser.id
      ? `<button data-action="edit-submission" data-hw="${hwId}" data-idx="${idx}" 
         class="text-blue-600 text-xs mt-2">✏️ Edit</button>`
      : "";

  return `
    <div class="border rounded-lg p-3 mt-3 bg-white">
      <div class="flex items-center gap-3 mb-2">
        <img src="${escapeHtml(
          sub.picture || "https://via.placeholder.com/40"
        )}" class="w-9 h-9 rounded-full object-cover"/>
        <div>
          <div class="font-semibold text-sm">${escapeHtml(
            sub.student_name || "Unknown"
          )}</div>
          <div class="text-xs text-gray-500">${escapeHtml(
            sub.submitted_at || ""
          )}</div>
        </div>
      </div>
      <div id="sub-text-${hwId}-${idx}" class="text-sm text-gray-700 whitespace-pre-line break-words">
        ${shortEsc}
      </div>
      ${
        needsToggle
          ? `<button data-action="toggle-text" data-hw="${hwId}" data-idx="${idx}" class="text-blue-600 text-xs mt-2">See more</button>`
          : ""
      }
      ${editBtn}
      ${filesHtml}
    </div>
  `;
}

function renderHomeworkCard(hw) {
  const submittedCount = (hw.submissions || []).length;
  const totalStudents = (cls.memberList || []).length || 0;
  const subs = hw.submissions || [];

  // kiểm tra xem người dùng đã nộp bài chưa
  const hasSubmitted = subs.some((s) => s.student_id === currentUser.id);
  console.log("hasSubmitted", hasSubmitted, subs, currentUser.id);
  let subsHtml = "";
  if (!subs.length) {
    subsHtml = `<p class="text-gray-500 text-sm">No submissions yet</p>`;
  } else {
    const visible = subs.slice(0, 2);
    const hidden = subs.slice(2);

    visible.forEach(
      (s, i) => (subsHtml += renderSubmissionHtml(hw.hw_id, i, s))
    );

    if (hidden.length > 0) {
      subsHtml += `<div id="more-${hw.hw_id}" class="hidden">`;
      hidden.forEach(
        (s, i) => (subsHtml += renderSubmissionHtml(hw.hw_id, 2 + i, s))
      );
      subsHtml += `<div class="mt-2"><button data-action="toggle-less" data-hw="${hw.hw_id}" class="text-blue-600 text-sm">Thu gọn</button></div></div>`;
      subsHtml += `<button data-action="toggle-more" data-hw="${hw.hw_id}" class="text-blue-600 text-sm mt-2">Xem thêm (${hidden.length})</button>`;
    }
  }

  const fileInputHtml = `<input type="file" multiple class="hidden hw-file-input" data-hw="${escapeHtml(
    hw.hw_id
  )}">`;

  // Form trả lời
  let responseHtml = "";
  if (!hasSubmitted) {
    responseHtml = `
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Your Response:</label>
        <textarea data-hw-text="${escapeHtml(
          hw.hw_id
        )}" rows="3" class="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-blue-400 text-base resize-none"></textarea>
      </div>
      <div class="flex items-center gap-3">
        <button data-action="open-file" data-hw="${escapeHtml(
          hw.hw_id
        )}" class="px-3 py-2 border rounded-lg text-sm flex items-center gap-2">📁 Upload File</button>
        <button data-action="submit" data-hw="${escapeHtml(hw.hw_id)}"
          class="ml-auto bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2">Submit</button>
      </div>
    `;
  } else {
    responseHtml = `
      <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        You have already submitted this homework. Use the Edit button below your submission to make changes.
      </div>
    `;
  }

  return `
    <div id="hw-${escapeHtml(
      hw.hw_id
    )}" class="hw-card bg-white rounded-lg shadow-sm border p-6">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-xl font-semibold">${escapeHtml(
            hw.title || "Untitled"
          )}</h2>
          <p class="text-gray-600 mt-1">${escapeHtml(hw.description || "")}</p>
          <p class="text-sm text-gray-500 mt-2">Due: ${
            hw.due_date
              ? escapeHtml(new Date(hw.due_date).toLocaleString())
              : "No due date"
          }</p>
          ${makeAttachmentHtml(hw)}
        </div>
        <div class="text-sm bg-gray-100 px-3 py-1 rounded-full">${submittedCount}/${totalStudents} submitted</div>
      </div>

      <div class="mt-4">
        ${responseHtml}
      </div>
      <div class="mt-6">
        <h3 class="text-sm font-semibold mb-2">Submissions:</h3>
        ${subsHtml}
      </div>

      ${fileInputHtml}
    </div>
  `;
}

function renderAll() {
  homeworkListEl.innerHTML = "";
  if (!topic.homeworks || !topic.homeworks.length) {
    homeworkListEl.innerHTML = `<div class="bg-white rounded-lg p-6 shadow-sm border text-gray-500">No homeworks</div>`;
    return;
  }
  topic.homeworks.forEach((hw) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderHomeworkCard(hw);
    homeworkListEl.appendChild(wrapper.firstElementChild);
  });

  document.querySelectorAll(".hw-file-input").forEach((inp) => {
    inp.addEventListener("change", () => {
      const hwId = inp.dataset.hw;
      SELECTED_FILES[hwId] = SELECTED_FILES[hwId] || [];
      for (const f of inp.files) SELECTED_FILES[hwId].push(f.name);
      inp.value = "";
      showToast(
        "File đã chọn: " + (SELECTED_FILES[hwId].join(", ") || "empty"),
        1500
      );
    });
  });
}

/* ================= Event Delegation ================= */
document.addEventListener("click", function (e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.action === "submit") {
    const hwId = btn.dataset.hw;
    const ta = document.querySelector(`textarea[data-hw-text="${hwId}"]`);
    if (!ta || !ta.value.trim()) {
      showToast("Nhập nội dung trước khi gửi!", 2000);
      return;
    }
    const hw = topic.homeworks.find((h) => h.hw_id === hwId);
    if (!hw) return;
    hw.submissions = hw.submissions || [];

    // Thêm mới submission
    hw.submissions.unshift({
      student_id: currentUser.id,
      student_name: currentUser.name,
      picture: currentUser.picture,
      text: ta.value.trim(),
      files: SELECTED_FILES[hwId] || [],
      submitted_at: new Date().toLocaleString(),
    });
    SELECTED_FILES[hwId] = [];
    saveClasses();
    renderAll();
    showToast("✅ Bài nộp đã được gửi!", 2000);
    return;
  }

  if (btn.dataset.action === "edit-submission") {
    const hwId = btn.dataset.hw;
    const idx = parseInt(btn.dataset.idx, 10);
    const hw = topic.homeworks.find((h) => h.hw_id === hwId);
    if (!hw) return;
    const sub = hw.submissions[idx];
    if (!sub) return;

    const hwCard = document.getElementById(`hw-${hwId}`);
    hwCard.querySelector(".mt-4").innerHTML = `
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Edit Response:</label>
        <textarea data-hw-text="${hwId}" rows="3" class="w-full border rounded-xl px-4 py-3 bg-white focus:outline-blue-400 text-base resize-none">${escapeHtml(
      sub.text
    )}</textarea>
      </div>
      <div class="flex items-center gap-3">
        <button data-action="open-file" data-hw="${hwId}" class="px-3 py-2 border rounded-lg text-sm flex items-center gap-2">📁 Upload File</button>
        <button data-action="update-submission" data-hw="${hwId}" data-idx="${idx}"
          class="ml-auto bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">Save Changes</button>
      </div>
    `;
    return;
  }

  if (btn.dataset.action === "update-submission") {
    const hwId = btn.dataset.hw;
    const idx = parseInt(btn.dataset.idx, 10);
    const ta = document.querySelector(`textarea[data-hw-text="${hwId}"]`);
    if (!ta || !ta.value.trim()) {
      showToast("Please enter your updated content!", 2000);
      return;
    }

    const hw = topic.homeworks.find((h) => h.hw_id === hwId);
    if (!hw) return;
    const sub = hw.submissions[idx];
    if (!sub) return;

    sub.text = ta.value.trim();
    sub.files = SELECTED_FILES[hwId] || [];
    sub.submitted_at = new Date().toLocaleString();

    saveClasses();
    renderAll();
    showToast("✅ Submission updated!", 2000);
    return;
  }

  if (btn.dataset.action === "open-file") {
    document
      .querySelector(`input.hw-file-input[data-hw="${btn.dataset.hw}"]`)
      ?.click();
    return;
  }

  if (btn.dataset.action === "toggle-more") {
    document
      .getElementById(`more-${btn.dataset.hw}`)
      ?.classList.remove("hidden");
    btn.classList.add("hidden");
    return;
  }
  if (btn.dataset.action === "toggle-less") {
    document.getElementById(`more-${btn.dataset.hw}`)?.classList.add("hidden");
    document
      .querySelector(
        `button[data-action="toggle-more"][data-hw="${btn.dataset.hw}"]`
      )
      ?.classList.remove("hidden");
    return;
  }

  if (btn.dataset.action === "toggle-text") {
    const key = `${btn.dataset.hw}|${btn.dataset.idx}`;
    const div = document.getElementById(
      `sub-text-${btn.dataset.hw}-${btn.dataset.idx}`
    );
    if (!div) return;
    if (btn.textContent.trim() === "Xem thêm") {
      div.innerHTML = nl2br(SUB_FULL[key] || "");
      btn.textContent = "Thu gọn";
    } else {
      div.innerHTML = nl2br(truncatedText(SUB_FULL[key] || "", 150));
      btn.textContent = "Xem thêm";
    }
    return;
  }
});

/* ================= Initial render ================= */
renderAll();

/* ===== Modal Create Homework ===== */
const modal = document.getElementById("createHomeworkModal");
const openBtn = document.getElementById("openCreateHomework");
const closeBtn = document.getElementById("closeCreateHomework");
const cancelBtn = document.getElementById("cancelCreateHomework");
const saveBtn = document.getElementById("saveCreateHomework");
document.getElementById(
  "backClassLink"
).href = `class-detail.html?id=${encodeURIComponent(classId)}`;

openBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.classList.remove("hidden");
});

[closeBtn, cancelBtn].forEach((btn) =>
  btn.addEventListener("click", () => {
    modal.classList.add("hidden");
  })
);

saveBtn.addEventListener("click", () => {
  const title = document.getElementById("hwTitle").value.trim();
  const desc = document.getElementById("hwDescription").value.trim();
  const due = document.getElementById("hwDueDate").value;

  if (!title || !desc || !due) {
    showToast("⚠️ Please fill all fields", 2000);
    return;
  }

  const newHw = {
    hw_id: "HW" + (topic.homeworks.length + 1),
    title,
    description: desc,
    attachments: [],
    due_date: due,
    created_by: cls.teacher || "Unknown",
    submissions: [],
  };

  topic.homeworks.push(newHw);
  saveClasses();
  renderAll();

  modal.classList.add("hidden");
  showToast("✅ Homework created!", 2000);

  document.getElementById("hwTitle").value = "";
  document.getElementById("hwDescription").value = "";
  document.getElementById("hwDueDate").value = "";
});
