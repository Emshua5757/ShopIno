import { db, getDoc, collection, getDocs, doc, updateDoc } from './firebase-config.js';
import { getCurrentUser, getImageUrl, findProduct, addToCartFirebase } from './utils.js';

async function fetchAndCategorizeCheckouts() {
    const user = getCurrentUser();
    if (!user) {
        throw new Error("User is not logged in.");
    }

    const checkoutsRef = collection(db, 'checkouts'); // Reference to the "checkouts" collection
    const checkoutsSnap = await getDocs(checkoutsRef); // Use getDocs to fetch all the documents (checkout IDs) in the "checkouts" collection

    if (checkoutsSnap.empty) {
        throw new Error("No checkouts found.");
    }

    const allCheckouts = [];

    // Fetch checkout details from each subcollection (by checkout ID)
    for (const docSnapshot of checkoutsSnap.docs) {
        const checkoutId = docSnapshot.id;
        const checkoutRef = doc(db, 'checkouts', checkoutId); // Reference to the individual checkout document

        const checkoutSnap = await getDoc(checkoutRef); // Get the checkout document

        if (checkoutSnap.exists()) {
            const checkoutData = checkoutSnap.data();

            // Fetch related fields (address, items, phone, price, etc.)
            const address = checkoutData.address;
            const items = checkoutData.items;
            const phone = checkoutData.phone;
            const price = checkoutData.price;
            const status = checkoutData.status;
            const timestamp = checkoutData.timestamp;
            const user = checkoutData.user;

            // Add checkout details to the allCheckouts array
            allCheckouts.push({
                checkoutId,
                address,
                items,
                phone,
                price,
                status,
                timestamp,
                user
            });
        }
    }

    console.log("All Checkouts:", allCheckouts); // Debugging line

    // Categorize checkouts based on status
    const pendingDeliveries = allCheckouts.filter(
        checkout => checkout.status === 'pending' || checkout.status === 'on delivery'
    );

    const orderHistory = allCheckouts.filter(
        checkout => checkout.status === 'delivered' || checkout.status === 'cancelled'
    );

    console.log("Pending Deliveries:", pendingDeliveries); // Debugging line
    console.log("Order History:", orderHistory); // Debugging line

    return { allCheckouts, pendingDeliveries, orderHistory };
}

function getCheckoutIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('checkoutId');
}

async function displayCheckoutDetails(checkoutId = null) {
    const user = getCurrentUser();
    if (!user) {
        alert("Please log in to view your checkout details.");
        return;
    }

    // Fetch the checkout data for the current user
    const { allCheckouts, pendingDeliveries, orderHistory } = await fetchAndCategorizeCheckouts();

    // Use the checkoutId from the URL if available
    const checkoutIdFromUrl = getCheckoutIdFromUrl();
    const checkoutToDisplay = checkoutIdFromUrl 
        ? allCheckouts.find(order => order.checkoutId === checkoutIdFromUrl) 
        : (checkoutId ? allCheckouts.find(order => order.checkoutId === checkoutId) : allCheckouts[0]);

    const checkoutDetailsElement = document.getElementById('checkout-details');
    
    if (checkoutToDisplay) {
        let itemsHtml = '';
        for (const item of checkoutToDisplay.items) {
            const itemName = Object.keys(item)[0]; // Get the product name (key)
            const quantity = item[itemName]; // Get the quantity (value)

            const product = await findProduct(itemName); // Get the product details

            if (product) {
                itemsHtml += `
                    <div class="checkout-item">
                        <img src="${await getImageUrl(product.image)}" alt="${itemName}" class="checkout-item-image">
                        <p><strong>${product.name}</strong></p>
                        <p>Category: ${product.category}</p>
                        <p>Price: $${product.price.toFixed(2)}</p>
                        <p>Quantity: ${quantity}</p>
                        <button class="add-to-cart" data-product='${JSON.stringify({...product, quantity})}'>Add to Cart</button>
                    </div>
                `;
            }
        }

        checkoutDetailsElement.innerHTML = `
            <p>Status: ${checkoutToDisplay.status}</p>
            <div class="checkout-items">
                ${itemsHtml}
            </div>
            <p>Total Price: $${checkoutToDisplay.price}</p>
            <p>User: ${checkoutToDisplay.user}</p>
            <p>Timestamp: ${checkoutToDisplay.timestamp}</p>
            <p>Address: ${checkoutToDisplay.address}</p>
            <p>Phone: ${checkoutToDisplay.phone}</p>
            ${checkoutToDisplay.status === 'pending' ? '<button class="cancel-order">Cancel</button>' : ''}
        `;

        // Add event listener for the cancel button
        const cancelButton = checkoutDetailsElement.querySelector('.cancel-order');
        if (cancelButton) {
            cancelButton.addEventListener('click', async () => {
                try {
                    const checkoutRef = doc(db, 'checkouts', checkoutToDisplay.checkoutId);
                    await updateDoc(checkoutRef, { status: 'cancelled' });
                    alert('Order has been cancelled successfully.');
                    displayCheckoutDetails(checkoutId); // Refresh the details
                } catch (error) {
                    console.error("Error cancelling order: ", error);
                    alert('Failed to cancel the order. Please try again.');
                }
            });
        }

        // Add event listeners for each "Add to Cart" button
        const addToCartButtons = checkoutDetailsElement.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const product = JSON.parse(button.getAttribute('data-product')); // Get product details from data attribute
                await addToCartFirebase(product, product.quantity); // Add the product to the cart with quantity
            });
        });
    } else {
        checkoutDetailsElement.innerHTML = `
        <p> Please select a checkout </p>
        `;   
    }

    displayPendingDeliveries(pendingDeliveries);
    displayOrderHistory(orderHistory);
}


function displayPendingDeliveries(pendingDeliveries) {
    const pendingDeliveriesElement = document.getElementById('pending-deliveries');
    pendingDeliveriesElement.innerHTML = pendingDeliveries.map(delivery => `
        <a href="?checkoutId=${delivery.checkoutId}" class="delivery-item">
            <p>Order ID: ${delivery.checkoutId} - Status: ${delivery.status}</p>
        </a>
    `).join('');
}

function displayOrderHistory(orderHistory) {
    const orderHistoryElement = document.getElementById('order-history');
    orderHistoryElement.innerHTML = orderHistory.map(order => `
        <a href="?checkoutId=${order.checkoutId}" class="history-item">
            <p>Order ID: ${order.checkoutId} - Status: ${order.status}</p>
        </a>
    `).join('');
}

// Call the function to display checkout details on page load
document.addEventListener('DOMContentLoaded', () => displayCheckoutDetails());
