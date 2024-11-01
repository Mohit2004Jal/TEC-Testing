const password_input_box = document.getElementById("password");
const view_password_eye = document.getElementById("view-password");
view_password_eye.addEventListener('click', () => {
    password_input_box.type = password_input_box.type === 'password' ? 'text' : 'password';
    password_input_box.focus();
})