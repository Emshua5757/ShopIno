import { db, doc, getDoc, updateDoc, storage, ref, getDownloadURL, deleteDoc, setDoc } from './firebase-config.js';
import { getCurrentUser, getCart, updateCartCount } from './utils.js';

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
                <div class = "product-item">
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
                </div>
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
            await updateCartCount();
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

window.handleCheckout = async function () {
    const user = getCurrentUser();
    if (!user) {
        alert("Please log in to proceed to checkout.");
        return;
    }

    const cartItems = await getCart();
    if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty. Please add items to your cart before checking out.");
        return;
    }

    // Fetch user details from the 'users' collection
    const userRef = doc(db, 'users', user.uid); // Assuming user.uid is the document ID in the 'users' collection
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        alert("User details not found. Please check your account.");
        return;
    }

    const userData = userSnap.data();

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Generate a unique checkout ID in the format userID-timestamp
    const checkoutID = `${Date.now()}`;

    const checkoutData = {
        status: 'pending', // Initial status
        items: cartItems.map((item) => ({ [item.name]: item.quantity })), // Format items as required
        price: totalPrice,
        user: userData.name, // Get the user's name from the user data
        timestamp: new Date().toISOString(), // Current timestamp
        address: userData.address, // Get the user's address from the user data
        phone: userData.phone, // Get the user's phone number from the user data
    };

    try {
        // Reference to the user's unique document under 'checkouts/{user.uid}/{checkoutID}'
        const checkoutRef = doc(db, `checkouts/${user.uid}-${checkoutID}`);

        // Save the checkout data to Firestore
        await setDoc(checkoutRef, checkoutData);
        console.log('Checkout Document written with ID: ', checkoutID);

        // Delete the cart after successful checkout
        const cartRef = doc(db, 'carts', user.uid);
        await deleteDoc(cartRef); // Delete the entire cart document
        console.log('Cart deleted after checkout.');
        updateCartDisplay();
        alert('Checkout successful! Your order has been placed.');

        // Redirect to checkout.html with the checkoutId as a query parameter
        window.location.href = `checkout.html?checkoutId=${user.uid}-${checkoutID}`;
    } catch (error) {
        console.error('Error adding document: ', error);
        alert('There was an error processing your checkout. Please try again.');
    }
};
