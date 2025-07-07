// ================= Q&A Topic Detail ================
let classes = JSON.parse(localStorage.getItem('classes') || '[]');
const params = new URLSearchParams(window.location.search);
const classId = params.get("class_id");
const topicId = params.get("topic_id");

const cls = classes.find(c => c.class_id === classId);
if (!cls) {
    document.body.innerHTML = '<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy lớp học!</div>';
    throw "Class not found";
}
const topic = (cls.topics || []).find(t => t.topic_id === topicId);
if (!topic) {
    document.body.innerHTML = '<div class="text-red-600 text-center text-xl mt-20">Không tìm thấy chủ đề!</div>';
    throw "Topic not found";
}

document.getElementById("topicInfo").innerHTML = `
  <div class="text-xl font-bold text-blue-800 mb-1">${topic.title}</div>
  <div class="text-gray-700 mb-2">${topic.description}</div>
  <div class="text-sm text-gray-500 mb-1">Tạo bởi: ${topic.created_by} | ${topic.created_at}</div>
`;

function renderAnswers() {
    const box = document.getElementById("answersList");
    if (!topic.answers || topic.answers.length === 0) {
        box.innerHTML = `<div class="text-gray-500">Chưa có câu trả lời nào.</div>`;
        return;
    }
    box.innerHTML = topic.answers.map(a => `
        <div class="bg-white p-3 rounded shadow mb-3">
          <div class="text-base">${a.content}</div>
          <div class="text-xs text-gray-500 mt-1">Bởi: ${a.created_by} | ${a.created_at}</div>
        </div>
    `).join('');
}
renderAnswers();

// Sự kiện gửi trả lời
document.getElementById('submitAnswer').onclick = sendAnswer;

function sendAnswer() {
    const textarea = document.getElementById('answerContent');
    const content = textarea.value.trim();
    if (!content) { alert('Nhập nội dung trả lời'); return; }
    topic.answers = topic.answers || [];
    topic.answers.unshift({
        answer_id: "A" + (topic.answers.length + 1),
        content,
        created_by: "Nguyen Van A",
        created_at: new Date().toLocaleString()
    });
    localStorage.setItem('classes', JSON.stringify(classes));
    textarea.value = '';
    textarea.style.height = 'auto';
    renderAnswers();
}

// Tự động giãn textarea trả lời
const answerContent = document.getElementById('answerContent');
answerContent.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
answerContent.addEventListener('keydown', function (e) {
    // Shift+Enter xuống dòng, Enter gửi
    if (e.key === "Enter" && !e.shiftKey) {
        sendAnswer();
        e.preventDefault();
    }
});

// =============== AI Chatbot Popup ================
document.getElementById('openChat').onclick = () => toggleChat(true);
document.getElementById('closeChat').onclick = () => toggleChat(false);
document.getElementById('sendBtn').onclick = () => sendMessage();

function toggleChat(show) {
    document.getElementById('chatPopup').classList.toggle('hidden', !show);
    if (show) setTimeout(() => document.getElementById('userInput').focus(), 100);
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const messages = document.getElementById('messages');
    if (!input.value.trim()) return;

    messages.innerHTML += `<div class="mb-2 text-right">
      <span class="bg-blue-500 rounded-lg px-3 py-2 inline-block text-white break-words max-w-[80%] whitespace-pre-line">
        ${escapeHtml(input.value)}
      </span>
    </div>`;

    messages.innerHTML += `<div id="loading" class="mb-2"><span class="bg-gray-700 rounded-lg px-3 py-2 inline-block text-gray-300">AI đang trả lời...</span></div>`;
    messages.scrollTop = messages.scrollHeight;

    try {
        const aiReply = await callGroqAPI(input.value);
        document.getElementById('loading').remove();
        messages.innerHTML += `
        <div class="mb-2 text-left">
        <span class="bg-gray-800 rounded-lg px-3 py-2 inline-block text-white break-words max-w-[80%] whitespace-pre-line">
        ${marked.parse(aiReply)}
        </span>
        </div>`;
        messages.scrollTop = messages.scrollHeight;
    } catch (err) {
        document.getElementById('loading').remove();
        messages.innerHTML += `<div class="mb-2 text-left"><span class="bg-red-700 rounded-lg px-3 py-2 inline-block text-white">Lỗi: ${escapeHtml(err.message)}</span></div>`;
        messages.scrollTop = messages.scrollHeight;
    }

    input.value = '';
    input.style.height = 'auto';
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        })[m];
    });
}

// Tự động giãn textarea chat AI
const userInput = document.getElementById('userInput');
userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
userInput.addEventListener('keydown', function (e) {
    // Shift+Enter xuống dòng, Enter gửi
    if (e.key === "Enter" && !e.shiftKey) {
        sendMessage();
        e.preventDefault();
    }
});

