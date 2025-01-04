import { getProducts, getImageUrl, initializeProductCache, createProductItem, addToCartFirebase, addToFavorites } from './utils.js';

async function populateProductCatalogue() {
    const catalogueGrid = document.querySelector('.catalogue-grid');
    if (catalogueGrid) {
        const products = await getProducts();

        // Group products by category
        const categorizedProducts = products.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = [];
            }
            acc[product.category].push(product);
            return acc;
        }, {});

        // Create sections for each category
        for (const [category, items] of Object.entries(categorizedProducts)) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category;
            categorySection.appendChild(categoryTitle);

            items.forEach(product => {
                const productItem = createProductItem(product);
                categorySection.appendChild(productItem);
            });

            catalogueGrid.appendChild(categorySection);
        }
    }
}

async function init() {
    console.log('Current page:', window.location.pathname);

    // Initialize product cache
    await initializeProductCache();
    await populateProductCatalogue();

    if (window.location.pathname.endsWith('product.html')) {
        console.log('Displaying selected product');
        await displaySelectedProduct();    
        
        const addToCartBtn = document.getElementById('add-to-cart');
        const quantityInput = document.querySelector('.quantity-input');
        const addToFavoritesBtn = document.getElementById('add-to-favorites');
        
        if (addToCartBtn && quantityInput && addToFavoritesBtn) {
            const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value, 10) || 1;
                if (selectedProduct) {
                    addToCartFirebase(selectedProduct, quantity);
                }
            });
            addToFavoritesBtn.addEventListener('click', () => {
                addToFavorites(selectedProduct);
            });
        } else {
            console.error('Add to cart button or quantity input not found');
        }
    } else if (window.location.pathname.endsWith('shop.html')) {
        console.log('Populating product catalogue');
    }
}

async function displaySelectedProduct() {
    const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
    if (selectedProduct && window.location.pathname.includes('product.html')) {
        const imageUrl = await getImageUrl(selectedProduct.image);
        if (imageUrl) {
            document.getElementById('main-product-image').src = imageUrl;
        } else {
            document.getElementById('main-product-image').src = getImageUrl('placeholder.png');
        }
        document.getElementById('main-product-name').textContent = selectedProduct.name;
        document.getElementById('main-product-price').textContent = `$${selectedProduct.price.toFixed(2)}`;
        document.getElementById('main-product-description').textContent = selectedProduct.description;
    }
}


document.addEventListener('DOMContentLoaded', init);
