// Xử lý show/hide password
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggle-password');
const eyeIcon = document.getElementById('eye-icon');

toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  toggleBtn.title = isPassword ? 'Hide password' : 'Show password';
  toggleBtn.ariaLabel = toggleBtn.title;
  eyeIcon.textContent = isPassword ? 'visibility_off' : 'visibility';
});
function showAlert() {
  alert('Xin chào từ JavaScript!');
}

// Xử lý Google Sign-In nút mặc định
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "454832286617-jcd3l6ts4hp6ac0qrk5og36eag6glila.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });
  google.accounts.id.renderButton(
    document.getElementById("g_id_signin"),
    { theme: "outline", size: "large" }
  );
};

function handleCredentialResponse(response) {
  const user = parseJwt(response.credential);
  // Lưu thông tin user vào localStorage
  localStorage.setItem('user', JSON.stringify(user));
  window.location.href = "class-list.html";
}


function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}
