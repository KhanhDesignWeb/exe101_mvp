window.aiSuggest = function () {
    const suggestions = [
        'Bạn nên dùng cấu trúc: Vấn đề - Lý lẽ - Dẫn chứng - Kết luận.',
        'Đưa thêm nguồn học thuật: Google Scholar, World Bank, UN Data…',
        'So sánh lập luận của hai phe để làm nổi bật ý chính.',
        'Kết hợp dẫn chứng thực tiễn và thống kê số liệu.',
        'Hỏi AI để lấy ví dụ, số liệu cập nhật.'
    ];
    const idx = Math.floor(Math.random() * suggestions.length);
    document.getElementById('ai-response').innerHTML =
        `<div><b>Cấu trúc lập luận:</b></div>
        <ul>
          <li><b>Mở bài</b>: Giới thiệu vấn đề</li>
          <li><b>Lý lẽ</b>: Đưa ra luận điểm chính</li>
          <li><b>Dẫn chứng</b>: Thêm ví dụ, số liệu</li>
          <li><b>Kết luận</b>: Tóm tắt, kêu gọi</li>
        </ul>
        <div><b>Gợi ý AI:</b> "${suggestions[idx]}"</div>`;
}
