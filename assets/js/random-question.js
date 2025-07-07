const QUESTIONS = [
    "Trí tuệ nhân tạo có thể thay thế hoàn toàn giáo viên trong tương lai không?",
    "Internet có làm con người ngày càng cô lập không?",
    "Học online tốt hơn học truyền thống?",
    "Đánh giá cao hơn: kinh nghiệm thực tế hay lý thuyết sách vở?",
    "Có nên cấm hoàn toàn mạng xã hội cho học sinh cấp 2?"
];
let questionIndex = 0;

window.randomQuestion = function () {
    questionIndex = (questionIndex + 1) % QUESTIONS.length;
    document.getElementById('question-content').textContent = QUESTIONS[questionIndex];
}

window.addTeacherQuestion = function () {
    let val = document.getElementById('teacher-question').value.trim();
    if (val) {
        QUESTIONS.push(val);
        document.getElementById('question-content').textContent = val;
        document.getElementById('teacher-question').value = '';
        alert('Câu hỏi đã thêm!');
    }
}
