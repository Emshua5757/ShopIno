import { getCurrentUser, updateCartCount } from './utils.js';

console.log(getCurrentUser());

function createSidebar() {
    const sidebarContent = `
        <div class="sidebar-content">
            <div class="logo">
                <h1>ShopIno Electronics</h1>
            </div>
            <!-- <button class="menu-toggle" onclick="toggleMenu()">☰</button> -->
        </div>
        <nav id="main-nav">
            <ul>
                <li class="${isActivePage('index.html')}"><a href="index.html">Home</a></li>
                <li class="${isActivePage('shop.html')}"><a href="shop.html">Shop</a></li>
                <li class="${isActivePage('product.html')}"><a href="product.html">Product</a></li>
                <li class="${isActivePage('cart.html')}"><a href="cart.html">Cart</a></li>
                <li class="${isActivePage('checkout.html')}"><a href="checkout.html">Checkout</a></li>
            </ul>
        </nav>
        <div class="sidebar-footer">
            <button class="discount-btn">Discounts</button>
            <button class="coupons-btn">Coupons</button>
            <div class="cart-fav">
                <p><a href="cart.html" class="sub-cart-link" id="cart-count">CART (0)</a></p>
                <p><a href="favorites.html" class="favorites-link">FAVORITES</a></p>
            </div>
        </div>
    `;

    document.getElementById('dynamic-sidebar').innerHTML = sidebarContent;

    updateCartCount();
}

function isActivePage(page) {
    return window.location.pathname.includes(page) ? 'active' : '';
}

createSidebar();
