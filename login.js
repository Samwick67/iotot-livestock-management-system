// login.js

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const forgotBtn = document.getElementById('forgotBtn');
const closeForgot = document.getElementById('closeForgot');
const forgotModal = document.getElementById('forgotModal');
const registerContainer = document.getElementById('registerContainer');

// Hide registration by default
registerContainer.style.display = 'none';

// -------------------- LOGIN --------------------
loginBtn.addEventListener('click', async () => {
  const display_name = document.getElementById('name').value.trim(); // login input for display_name
  const password = document.getElementById('password').value.trim();
  const idNumber = document.getElementById('idNumber').value.trim();
  const errorMsg = document.getElementById('error-message');

  errorMsg.textContent = '';

  if (!display_name || !password || !idNumber) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name, password, idNumber })
    });
    const result = await res.json();

    if (result.success) {
      const user = result.user;
      if (user.role === 'admin') {
        // Show admin registration section
        registerContainer.style.display = 'block';
        alert("Welcome Admin! You can now register new users.");
      } else {
        // Normal user goes to dashboard
        window.location.href = 'dashboard.html';
      }
    } else {
      errorMsg.textContent = result.message;
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Server error, try again later";
  }
});

// -------------------- REGISTER (Admin Only) --------------------
registerBtn.addEventListener('click', async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const role = document.getElementById('role').value.trim();
  const farm = document.getElementById('farm').value.trim();
  const idNumber = document.getElementById('regIDNumber').value.trim();
  const adminDisplayName = document.getElementById('name').value.trim(); // currently logged-in admin
  const adminPassword = document.getElementById('password').value.trim(); // admin password
  const errorMsg = document.getElementById('register-error');

  errorMsg.textContent = '';

  if (!name || !email || !password || !role || !farm || !idNumber) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  if (!/^\d{13}$/.test(idNumber)) {
    errorMsg.textContent = "ID number must be 13 digits";
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminDisplayName,
        adminPassword,
        name,
        email,
        password,
        role,
        farm,
        idNumber
      })
    });

    const result = await res.json();
    if (result.success) {
      alert("User registered successfully!");
      // Optional: clear registration form
      document.getElementById('regName').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
      document.getElementById('role').value = '';
      document.getElementById('farm').value = '';
      document.getElementById('regIDNumber').value = '';
    } else {
      errorMsg.textContent = result.message;
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Server error, try again later";
  }
});

// -------------------- FORGOT PASSWORD --------------------
forgotBtn.addEventListener('click', () => {
  forgotModal.style.display = 'block';
});

closeForgot.addEventListener('click', () => {
  forgotModal.style.display = 'none';
});

document.getElementById('resetBtn').addEventListener('click', async () => {
  const email = document.getElementById('fpEmail').value.trim();
  const idNumber = document.getElementById('fpID').value.trim();
  const newPassword = document.getElementById('fpNewPassword').value.trim();
  const fpError = document.getElementById('fpError');

  fpError.textContent = '';

  if (!email || !idNumber || !newPassword) {
    fpError.textContent = "Please fill all fields";
    return;
  }

 if (!/^\d{13}$/.test(idNumber)) {
  fpError.textContent = "ID number must be 13 digits";
  return;
}

  try {
    const res = await fetch('http://localhost:3000/users/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, idNumber, newPassword })
    });

    const result = await res.json();
    if (result.success) {
      alert("Password reset successful! You can now login.");
      forgotModal.style.display = 'none';
    } else {
      fpError.textContent = result.message;
    }
  } catch (err) {
    console.error(err);
    fpError.textContent = "Server error, try again later";
  }
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === forgotModal) forgotModal.style.display = 'none';
});
