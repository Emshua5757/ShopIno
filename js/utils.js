import { getDocs, where, storage, ref, getDownloadURL, doc, getDoc, updateDoc, setDoc, arrayUnion, db, collection, query } from './firebase-config.js';

export function getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
}

export async function getImageUrl(imageName) {
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

export function selectProduct(productId) {
    getProducts().then(products => {
        const product = products.find(p => p.id === productId);
        if (product) {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = 'product.html';
        }
    });
}

export async function getProducts() {
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
        if (cachedProducts) {
            console.log('Returning cached products due to error');
            return JSON.parse(cachedProducts);
        }
        return [];
    }
}

export async function initializeProductCache() {
    const cachedProducts = localStorage.getItem('cachedProducts');
    if (!cachedProducts) {
        console.log('Initializing product cache');
        const defaultProducts = [
            { id: '1', name: 'Arduino Uno', price: 20, description: 'Microcontroller board based on the ATmega328P', image: 'arduino_uno.jpg' },
            { id: '2', name: 'Raspberry Pi 4', price: 35, description: 'Single-board computer with wireless LAN and Bluetooth', image: 'raspberry_pi_4.jpg' },
            { id: '3', name: 'ESP32', price: 10, description: 'Low-cost, low-power system on a chip microcontrollers with Wi-Fi and Bluetooth', image: 'esp32.jpg' },
        ];
        localStorage.setItem('cachedProducts', JSON.stringify(defaultProducts));
        localStorage.setItem('productsCacheTimestamp', Date.now().toString());
    }
}

export function createProductItem(product) {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.setAttribute('data-product-id', product.id);

    productItem.innerHTML = `
        <img src="" alt="${product.name}">
        <p>From $${product.price}<br><strong>${product.name}</strong></p>
    `;

    getImageUrl(product.image).then(url => {
        if (url) {
            productItem.querySelector('img').src = url;
        }
    });

    productItem.addEventListener('click', () => selectProduct(product.id));
    return productItem;
}

export async function addToCartFirebase(product, quantity = 1) {
    const user = getCurrentUser();
    console.log("Product:", product);
    console.log("User:", user);
    if (!user) {
        console.log("User not logged in");
        alert("Please log in to add items to your cart.");
        window.location.href = 'cart.html';
        return;
    }

    try {
        console.log("User ID: ", user.uid);
        const cartRef = doc(db, "carts", user.uid);
        console.log("Cart reference:", cartRef);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            // Cart exists, update it
            const cartData = cartSnap.data();
            const existingItemIndex = cartData.items.findIndex(item => item.id === product.id);

            if (existingItemIndex !== -1) {
                // Product already in cart, update quantity
                cartData.items[existingItemIndex].quantity += quantity;
                await updateDoc(cartRef, { items: cartData.items });
            } else {
                // Product not in cart, add new item
                await updateDoc(cartRef, {
                    items: arrayUnion({ ...product, quantity })
                });
            }
        } else {
            // Cart doesn't exist, create a new one
            await setDoc(cartRef, {
                items: [{ ...product, quantity }]
            });
        }

        console.log("Product added to cart");
        updateCartCount();
        alert("Product added to cart successfully!");
    } catch (error) {
        console.error("Error adding product to cart:", error);
        alert("Error adding product to cart. Please try again.");
    }
}

export async function addToFavorites() {
    const user = getCurrentUser();
    if (!user) {
        alert("Please log in to add items to your favorites.");
        return;
    }

    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    if (!product) {
        alert("No product selected.");
        return;
    }

    const favoritesRef = doc(db, "favorites", user.uid);
    const favoritesSnap = await getDoc(favoritesRef);
    let favoritesItems = [];

    if (favoritesSnap.exists()) {
        favoritesItems = favoritesSnap.data().items || [];
    } else {
        console.log("Adding Favorites Document");
        favoritesItems = [];
        await setDoc(favoritesRef, { items: favoritesItems });
    }

    const existingIndex = favoritesItems.findIndex(item => item.id === product.id);
    if (existingIndex === -1) {
        favoritesItems.push(product);
        await updateDoc(favoritesRef, { items: favoritesItems });
        alert("Product added to favorites!");
    } else {
        alert("This product is already in your favorites.");
    }
}

export async function getCart() {
    const user = getCurrentUser();
    if (!user) {
        console.log("No user is signed in");
        return [];
    }

    const cartRef = doc(db, "carts", user.uid);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
        return cartSnap.data().items || [];
    } else {
        console.log("No cart found for this user");
        return [];
    }
}


export async function updateCartCount() {
    const cartItems = await getCart();
    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.textContent = `CART (${cartItems.length})`;
}

export async function findProduct(productName) {
    const productsCollection = collection(db, 'products'); // Reference to 'products' collection
    const q = query(productsCollection, where('name', '==', productName)); // Query to find product by name

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // If a product with the given name is found
            const productDoc = querySnapshot.docs[0]; // Assuming the product name is unique
            return productDoc.data(); // Return the product data and its ID
        } else {
            console.log(`No product found with name: ${productName}`);
            return null; // Return null if no product is found
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        return null; // Return null if there's an error
    }
}