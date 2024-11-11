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
                <p>Original Price: $${item.price.toFixed(2)}</p>
                <div class="quantity-container">
                    <p>Quantity: <input type="number" value="${item.quantity}" class="quantity-input" data-id="${item.id}" disabled></p>
                    <button class="edit-quantity" data-id="${item.id}">Edit</button>
                    <button class="save-quantity hidden" data-id="${item.id}">Save</button>
                </div>
                <p class="price">Current Price: $${(item.price * item.quantity).toFixed(2)}</p>
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

        const editButtons = document.querySelectorAll('.edit-quantity');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                const inputField = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
                inputField.disabled = false; 
                e.target.classList.add('hidden'); 
                const saveButton = document.querySelector(`.save-quantity[data-id="${itemId}"]`);
                saveButton.classList.remove('hidden');
            });
        });

        const saveButtons = document.querySelectorAll('.save-quantity');
        saveButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.getAttribute('data-id');
                const inputField = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
                const newQuantity = parseInt(inputField.value, 10);
                await updateItemQuantity(itemId, newQuantity - cartItems.find(item => item.id.toString() === itemId.toString()).quantity);
                inputField.disabled = true; 
                e.target.classList.add('hidden');
                const editButton = document.querySelector(`.edit-quantity[data-id="${itemId}"]`);
                editButton.classList.remove('hidden');
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

async function updateItemQuantity(itemId, change) {
    const user = getCurrentUser();
    if (!user) {
        alert("Please log in to update item quantity.");
        return;
    }

    const cartRef = doc(db, "carts", user.uid);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
        const cartItems = cartSnap.data().items;
        const itemIndex = cartItems.findIndex(item => item.id.toString() === itemId.toString());

        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity += change;
            if (cartItems[itemIndex].quantity <= 0) {
                cartItems.splice(itemIndex, 1);
            }
            await updateDoc(cartRef, { items: cartItems });
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
