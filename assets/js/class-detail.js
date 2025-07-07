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

// Tab switching
document.getElementById("discussionsTab").addEventListener("click", () => {
  document.getElementById("discussionsSection").classList.remove("hidden");
  document.getElementById("membersSection").classList.add("hidden");
  document.getElementById("resourcesSection").classList.add("hidden");

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
});

document.getElementById("membersTab").addEventListener("click", () => {
  document.getElementById("discussionsSection").classList.add("hidden");
  document.getElementById("membersSection").classList.remove("hidden");
  document.getElementById("resourcesSection").classList.add("hidden");

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
});

document.getElementById("resourcesTab").addEventListener("click", () => {
  document.getElementById("discussionsSection").classList.add("hidden");
  document.getElementById("membersSection").classList.add("hidden");
  document.getElementById("resourcesSection").classList.remove("hidden");

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
});

// Đặt mặc định là Discussions sau khi gán xong sự kiện
document.getElementById("discussionsTab").click();

window.goToTopic = function (classId, topicId) {
  window.location.href = `topic-detail.html?class_id=${classId}&topic_id=${topicId}`;
};

renderTopics();

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
