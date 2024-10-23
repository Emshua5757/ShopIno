let currentUser = null;

function getCurrentUser() {
    return currentUser;
}

function login(email, password) {
    currentUser = { email: email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateCartView();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateCartView();
}

function register(name, email, password, phone, address) {
    currentUser = { name, email, phone, address };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateCartView();
}

function updateCartView() {
    const authContainer = document.getElementById('auth-container');
    const cartContent = document.getElementById('cart-content');
    const userEmail = document.getElementById('user-email');

    if (getCurrentUser()) {
        authContainer.classList.add('hidden');
        cartContent.classList.remove('hidden');
        userEmail.textContent = getCurrentUser().email;
        displayCartItems();
    } else {
        authContainer.classList.remove('hidden');
        cartContent.classList.add('hidden');
    }
}

function displayCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Clear existing items
    cartItems.innerHTML = '';
    
    // Get cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartItems.appendChild(cartItem);
        
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = total.toFixed(2);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    updateCartView();
    
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
        authContainer.classList.remove('show-register');
    });
    
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', logout);
});
