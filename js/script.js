import { db, storage, ref, getDownloadURL } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Function to handle product selection
function selectProduct(productId) {
    getProducts().then(products => {
        const product = products.find(p => p.id === productId);
        if (product) {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = 'product.html';
        }
    });
}

// Function to create a product item element
function createProductItem(product) {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.setAttribute('data-product-id', product.id);
    
    // Use a placeholder image initially
    productItem.innerHTML = `
        <img src="placeholder.png" alt="${product.name}">
        <p>From $${product.price}<br><strong>${product.name}</strong></p>
    `;
    
    // Load the actual image
    getImageUrl(product.image).then(url => {
        if (url) {
            productItem.querySelector('img').src = url;
        }
    });

    productItem.addEventListener('click', () => selectProduct(product.id));
    return productItem;
}

// Function to populate a column with products
function populateColumn(columnId, products, scrollDirection) {
    const column = document.getElementById(columnId);
    const scrollContainer = column.querySelector(`.scroll${scrollDirection}`);
    
    // Clear existing content
    scrollContainer.innerHTML = '';
    
    // Add original products
    products.forEach(product => {
        scrollContainer.appendChild(createProductItem(product));
    });
    
    // Add duplicates for seamless scrolling
    products.forEach(product => {
        const duplicate = createProductItem(product);
        duplicate.classList.add('duplicate');
        scrollContainer.appendChild(duplicate);
    });
}

// Function to populate all columns on the main page
async function populateMainPage() {
    console.log('Populating main page');
    const products = await getProducts();
    const totalProducts = products.length;
    const productsPerColumn = Math.ceil(totalProducts / 3);
    
    // Populate column 1
    const column1Products = products.slice(0, productsPerColumn);
    populateColumn('column1', column1Products, 'up');
    
    // Populate column 2
    const column2Products = products.slice(productsPerColumn, productsPerColumn * 2);
    populateColumn('column2', column2Products, 'down');
    
    // Populate column 3
    const column3Products = products.slice(productsPerColumn * 2);
    populateColumn('column3', column3Products, 'up');
    
    console.log('Main page populated');
}

// Add click event listeners to product items on main page
function addProductListeners() {
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        const productId = parseInt(item.getAttribute('data-product-id'));
        item.addEventListener('click', () => {
            console.log('Clicked product ID:', productId); // Debugging line
            selectProduct(productId);
        });
    });
}

// Display selected product on shop page
async function displaySelectedProduct() {
    const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
    if (selectedProduct && window.location.pathname.includes('product.html')) {
        const imageUrl = await getImageUrl(selectedProduct.image);
        if (imageUrl) {
            document.getElementById('main-product-image').src = imageUrl;
        } else {
            document.getElementById('main-product-image').src = 'placeholder.png';
        }
        document.getElementById('main-product-name').textContent = selectedProduct.name;
        document.getElementById('main-product-price').textContent = `$${selectedProduct.price.toFixed(2)}`;
        document.getElementById('main-product-description').textContent = selectedProduct.description;
        
        // Add event listener for the "Add to Cart" button
        document.getElementById('add-to-cart').addEventListener('click', () => {
            addToCart(selectedProduct);
        });
    }
}

// Populate product catalogue on shop page
async function populateProductCatalogue() {
    const catalogueGrid = document.querySelector('.catalogue-grid');
    if (catalogueGrid) {
        const products = await getProducts();
        products.forEach(product => {
            const productItem = createProductItem(product);
            catalogueGrid.appendChild(productItem);
        });
    }
}

// Function to handle adding a product to the cart
function addToCart(product) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to cart.html if there's no current user
        window.location.href = 'cart.html';
        return;
    }

    // Get the current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the product is already in the cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
        // If the product is already in the cart, increase its quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // If it's a new product, add it to the cart
        cart.push({
            ...product,
            quantity: 1
        });
    }

    // Save the updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Optionally, you can show a confirmation message or update the cart icon
    alert('Product added to cart!');
}

// Function to get the current user (moved from auth.js)
function getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
}

// Function to register a new user
function registerUser(username, email, password) {
    const usersRef = ref(database, 'users');
    const newUserRef = push(usersRef);
    set(newUserRef, {
        username: username,
        email: email,
        password: password // Note: In a real app, you should hash passwords
    });
}

// Function to get all products with caching
async function getProducts() {
    const cachedProducts = localStorage.getItem('cachedProducts');
    const cacheTimestamp = localStorage.getItem('productsCacheTimestamp');
    const cacheExpirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (cachedProducts && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp) < cacheExpirationTime)) {
        console.log('Using cached products');
        return JSON.parse(cachedProducts);
    }

    console.log('Fetching products from Firestore');
    const productsCollection = collection(db, "products");
    try {
        const querySnapshot = await getDocs(productsCollection);
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        localStorage.setItem('cachedProducts', JSON.stringify(products));
        localStorage.setItem('productsCacheTimestamp', Date.now().toString());
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        // If there's an error (e.g., offline), return cached products if available
        if (cachedProducts) {
            console.log('Returning cached products due to error');
            return JSON.parse(cachedProducts);
        }
        return [];
    }
}

// Function to get the URL of an image
async function getImageUrl(imageName) {
    const cachedUrl = localStorage.getItem(`image_${imageName}`);
    if (cachedUrl) {
        return cachedUrl;
    }

    try {
        const imageRef = ref(storage, imageName);
        const url = await getDownloadURL(imageRef);
        localStorage.setItem(`image_${imageName}`, url);
        return url;
    } catch (error) {
        console.error("Error downloading image:", error);
        return null;
    }
}

// Function to initialize product cache
async function initializeProductCache() {
    const cachedProducts = localStorage.getItem('cachedProducts');
    if (!cachedProducts) {
        console.log('Initializing product cache');
        const defaultProducts = [
            { id: '1', name: 'Arduino Uno', price: 20, description: 'Microcontroller board based on the ATmega328P', image: 'arduino_uno.jpg' },
            { id: '2', name: 'Raspberry Pi 4', price: 35, description: 'Single-board computer with wireless LAN and Bluetooth', image: 'raspberry_pi_4.jpg' },
            { id: '3', name: 'ESP32', price: 10, description: 'Low-cost, low-power system on a chip microcontrollers with Wi-Fi and Bluetooth', image: 'esp32.jpg' },
            // Add more default products as needed
        ];
        localStorage.setItem('cachedProducts', JSON.stringify(defaultProducts));
        localStorage.setItem('productsCacheTimestamp', Date.now().toString());
    }
}

// Initialize the page
async function init() {
    console.log('Current page:', window.location.pathname);

    // Initialize product cache
    await initializeProductCache();

    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        console.log('Populating main page and adding product listeners');
        await populateMainPage();
        addProductListeners();
    } else if (window.location.pathname.endsWith('product.html')) {
        console.log('Displaying selected product');
        await displaySelectedProduct();
        await populateProductCatalogue();
        
        // Add event listener for the "Add to Cart" button
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
                if (selectedProduct) {
                    addToCart(selectedProduct);
                }
            });
        }
    } else if (window.location.pathname.endsWith('shop.html')) {
        console.log('Populating product catalogue');
        await populateProductCatalogue();
    }
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

function toggleMenu() {
    const mainNav = document.getElementById('main-nav');
    const sidebarFooter = document.querySelector('.sidebar-footer');
    mainNav.classList.toggle('show');
    sidebarFooter.classList.toggle('show');
}

// Make sure the function is available globally
window.toggleMenu = toggleMenu;