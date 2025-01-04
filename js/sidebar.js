function createSidebar() {
    const sidebarContent = `
        <div class="sidebar-content">
            <div class="logo">
                <h1>ShopIno Electronics</h1>
            </div>
            <button class="menu-toggle" onclick="toggleMenu()">☰</button>
        </div>
        <nav id="main-nav">
            <ul>
                <li class="${isActivePage('index.html')}"><a href="index.html">Home</a></li>
                <li class="${isActivePage('shop.html')}"><a href="shop.html">Shop</a></li>
                <li class="${isActivePage('product.html')}"><a href="product.html">Product</a></li>
                <li class="${isActivePage('cart.html')}"><a href="cart.html">Cart</a></li>
                <li class="${isActivePage('checkout.html')}"><a href="#">Checkout</a></li>
            </ul>
        </nav>
        <div class="sidebar-footer">
            <button class="discount-btn">Discounts</button>
            <button class="coupons-btn">Coupons</button>
            <div class="cart-fav">
                <p>CART (0)</p>
                <p><a href="favorites.html" class="favorites-link">FAVORITES</a></p>
            </div>
        </div>
    `;

    // Insert the sidebar content into the dynamic-sidebar div
    document.getElementById('dynamic-sidebar').innerHTML = sidebarContent;
}

// Function to check if the current page is active
function isActivePage(page) {
    return window.location.pathname.includes(page) ? 'active' : '';
}

// Call the function to create the sidebar when the script loads
createSidebar();
