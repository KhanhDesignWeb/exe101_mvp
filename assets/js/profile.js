window.savePassword = function () {
    let pw = document.getElementById('new-password').value;
    if (!pw) {
        alert('Vui lòng nhập mật khẩu mới!');
        return;
    }
    // Giả lập update mật khẩu thành công
    alert('Mật khẩu đã được đổi!');
    document.getElementById('new-password').value = '';
}

window.logoutAccount = function () {
    // Tùy thực tế sẽ redirect hoặc clear session, ở đây chỉ demo
    alert('Đã đăng xuất!');
    // location.href = 'login.html';
}
document.addEventListener('DOMContentLoaded', function () {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);

    // Avatar Google (nếu có)
    if (user.picture && document.getElementById('user-avatar')) {
        document.getElementById('user-avatar').src = user.picture;
    }
    // Username (nếu có)
    if (user.name && document.getElementById('username')) {
        document.getElementById('username').value = user.name;
    }
    // Email (nếu có)
    if (user.email && document.getElementById('email')) {
        document.getElementById('email').value = user.email;
    }
});
window.logoutAccount = function () {
    localStorage.removeItem('user');
    alert('Đã đăng xuất!');
    window.location.href = 'sign-in.html'; // hoặc 'sign-in.html'
}
