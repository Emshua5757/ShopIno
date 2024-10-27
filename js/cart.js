import { db, doc, getDoc, updateDoc, storage, ref, getDownloadURL, deleteDoc} from './firebase-config.js';
import { getCurrentUser } from './auth.js';

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

export async function updateCartDisplay() {
    const cartItems = await getCart();
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    cartItemsElement.innerHTML = '';
    let total = 0;

    if (cartItems && cartItems.length > 0) {
        for (const item of cartItems) {
            const itemElement = document.createElement('div');
            itemElement.className = 'product-item';
            
            let imageUrl = '';
            try {
                const storageRef = ref(storage, item.image);
                imageUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.error("Error fetching image:", error);
                imageUrl = './images/placeholder.jpg';
            }

            itemElement.innerHTML = `
                <img src="${imageUrl}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>Quantity: ${item.quantity}</p>
                <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-from-cart" data-id="${item.id}">Remove</button>
            `;
            cartItemsElement.appendChild(itemElement);
            total += item.price * item.quantity;
        }

        const removeButtons = document.querySelectorAll('.remove-from-cart');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                removeFromCart(itemId);
            });
        });
    } else {
        cartItemsElement.innerHTML = '<p>Your cart is empty.</p>';
    }

    cartTotalElement.textContent = total.toFixed(2);
}

async function removeFromCart(itemId) {
    const user = getCurrentUser();
    if (!user) {
        alert("Please log in to remove items from your cart.");
        return;
    }

    const cartRef = doc(db, "carts", user.uid);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
        const cartItems = cartSnap.data().items;
        console.log("Before removal:", cartItems);
        
        const itemIndex = cartItems.findIndex(item => item.id.toString() === itemId.toString());
        
        if (itemIndex !== -1) {
            cartItems.splice(itemIndex, 1);
            console.log("After removal:", cartItems);
            
            if (cartItems.length === 0) {
                // If the cart is empty after removing the item, delete the entire cart document
                await deleteDoc(cartRef);
                console.log("Cart deleted");
            } else {
                // Otherwise, update the cart with the remaining items
                await updateDoc(cartRef, { items: cartItems });
                console.log("Cart updated");
            }
            
            await updateCartDisplay();
        } else {
            console.log("Item not found in cart. ItemId:", itemId);
        }
    }
}

export function showCart() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('cart-content').classList.remove('hidden');
    updateCartDisplay();
}

export function hideCart() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('cart-content').classList.add('hidden');
}
