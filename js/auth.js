import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { updateCartDisplay } from './cart.js';

let currentUser = null;

export function getCurrentUser() {
    return auth.currentUser;
}

function login(email, password) {   
    console.log('Login function triggered');
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            localStorage.setItem('currentUser', JSON.stringify({
                uid: currentUser.uid,
                email: currentUser.email
            }));    
            console.log(currentUser);
            showCartContent();
            console.log("Cart content shown");
            updateCartDisplay();
            console.log("Cart display updated");
            console.log("Login function completed");
            console.log(currentUser);
        })
        .catch((error) => {
            console.error("Login error:", error.code, error.message);
            alert("Login failed: " + error.message);
        });
        
}

function logout() {
    signOut(auth).then(() => {
        localStorage.removeItem('currentUser');
        console.log("User logged out successfully");
        console.log("Logout function completed");
        console.log(currentUser);
    }).catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed: " + error.message);
    });

}

function register(name, email, password, phone, address) {
    console.log('Register function triggered');
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            switchToLoginForm(email);
            alert("Registration successful! Please log in.");
        })
        .catch((error) => {
            console.error("Registration error:", error.code, error.message);
            alert("Registration failed: " + error.message);
        });
}

function showAuthForm() {
    document.getElementById('cart-content').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('user-topbar').classList.add('hidden');
}

function showCartContent() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('cart-content').classList.remove('hidden');
    document.getElementById('user-topbar').classList.remove('hidden');
    document.getElementById('user-email').textContent = currentUser.email;
}

function switchToLoginForm(email = '') {
    console.log('Switch to login form triggered');
    const authContainer = document.getElementById('auth-container');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    
    authContainer.classList.remove('show-register');
    loginEmail.value = email;
    loginPassword.value = ''; // Clear the password field for security
    loginPassword.focus(); // Set focus to the password field for user convenience
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            showCartContent();
            updateCartDisplay();
        } else {
            showAuthForm();
        }
    });

    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form-element');
    const registerForm = document.getElementById('register-form-element');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        login(email, password);
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const phone = document.getElementById('register-phone').value;
        const address = document.getElementById('register-address').value;
        register(name, email, password, phone, address);
    });
    
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        authContainer.classList.add('show-register');
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLoginForm();
    });
    
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', logout);
});
