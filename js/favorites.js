import { db, doc, getDoc, updateDoc, storage, setDoc, auth, getDownloadURL, ref } from './firebase-config.js';

function getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
}

async function getFavorites() {
    const user = getCurrentUser();
    if (!user) {
        console.log("No user is signed in");
        return [];
    }
    
    const favoritesRef = doc(db, "favorites", user.uid);
    const favoritesSnap = await getDoc(favoritesRef);

    if (favoritesSnap.exists()) {
        return favoritesSnap.data().items || [];
    } else {
        console.log("No favorites found for this user");
        return [];
    }
}

async function displayFavorites() {
    const favorites = await getFavorites();
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = '';

    if (favorites.length > 0) {
        for (const item of favorites) {
            const itemElement = document.createElement('div');
            itemElement.className = 'product-item';
            
            let imageUrl = '';
            try {
                const storageRef = ref(storage, item.image); // Assuming item.image contains the path to the image in storage
                imageUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.error("Error fetching image:", error);
                imageUrl = './images/placeholder.jpg'; // Fallback image
            }

            itemElement.innerHTML = `
                <a href="product.html?id=${item.id}">
                    <img src="${imageUrl}" alt="${item.name}">
                </a>
                <h3>${item.name}</h3>
                <p>Price: $${item.price.toFixed(2)}</p>
                <button class="remove-from-favorites" data-id="${item.id}">Remove from Favorites</button>
            `;
            favoritesContainer.appendChild(itemElement);
        }

        // Add event listeners for remove buttons
        const removeButtons = document.querySelectorAll('.remove-from-favorites');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                removeFromFavorites(itemId);
            });
        });
    } else {
        favoritesContainer.innerHTML = '<p>Your favorites list is empty.</p>';
    }
}

async function addToFavorites() {
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

    // Check if the favorites document exists
    if (favoritesSnap.exists()) {
        favoritesItems = favoritesSnap.data().items || [];
    } else {
        // If it doesn't exist, create it with an empty items array
        console.log("Adding Favorites Document");
        favoritesItems = [];
        await setDoc(favoritesRef, { items: favoritesItems });
    }

    // Check if the product is already in favorites
    const existingIndex = favoritesItems.findIndex(item => item.id === product.id);
    if (existingIndex === -1) {
        favoritesItems.push(product); // Add product to favorites
        await updateDoc(favoritesRef, { items: favoritesItems });
        alert("Product added to favorites!");
    } else {
        alert("This product is already in your favorites.");
    }
}

// Attach the function to the window object to make it globally accessible
window.addToFavorites = addToFavorites;

async function removeFromFavorites(itemId) {
    const user = getCurrentUser();
    if (!user) {
        alert("Please log in to remove items from your favorites.");
        return;
    }

    const favoritesRef = doc(db, "favorites", user.uid);
    const favoritesSnap = await getDoc(favoritesRef);

    if (favoritesSnap.exists()) {
        const favoritesItems = favoritesSnap.data().items;
        const itemIndex = favoritesItems.findIndex(item => item.id.toString() === itemId.toString());

        if (itemIndex !== -1) {
            favoritesItems.splice(itemIndex, 1);
            await updateDoc(favoritesRef, { items: favoritesItems });
            displayFavorites(); // Refresh the favorites display
        }
    }
}

if (window.location.pathname.includes('favorites.html')) {
    document.addEventListener('DOMContentLoaded', displayFavorites);
} 