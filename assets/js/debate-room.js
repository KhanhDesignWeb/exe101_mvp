window.joinRoom = function () {
    let type = document.getElementById('room-type').value;
    let name = document.getElementById('room-name').value.trim();
    if (!name) {
        alert("Nhập tên hoặc mã phòng!");
        return;
    }
    alert(`Bạn vừa tạo/tham gia phòng "${name}" (${type})`);
}
