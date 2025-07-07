// Nav tab chuyển đổi view
document.querySelectorAll('.nav-item').forEach(item => {
    item.onclick = function () {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        let tab = item.getAttribute('data-tab');
        document.querySelectorAll('.main-section').forEach(s => s.style.display = 'none');
        document.getElementById(tab).style.display = 'block';
    };
});

// Vote 5 sao giữ nguyên như trước
let currentVote = 0;
window.voteStar = function (n) {
    currentVote = n;
    for (let i = 1; i <= 5; i++) {
        document.getElementById('star' + i).classList.toggle('active', i <= n);
    }
    document.getElementById('vote-result').textContent =
        "Bạn đã vote: " + n + " sao (" + (["Hoàn toàn không đồng ý", "Không đồng ý", "Trung lập", "Đồng ý", "Hoàn toàn đồng ý"][n - 1]) + ")";
};
