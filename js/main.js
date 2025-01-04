import { getProducts, selectProduct, createProductItem, initializeProductCache } from './utils.js';

function populateColumn(columnId, products, scrollDirection) {
    const column = document.getElementById(columnId);
    const scrollContainer = column.querySelector(`.scroll${scrollDirection}`);

    scrollContainer.innerHTML = '';

    products.forEach(product => {
        scrollContainer.appendChild(createProductItem(product));
    });

    products.forEach(product => {
        const duplicate = createProductItem(product);
        duplicate.classList.add('duplicate');
        scrollContainer.appendChild(duplicate);
    });
}

async function populateMainPage() {
    console.log('Populating main page');
    const products = await getProducts();
    const totalProducts = products.length;
    const productsPerColumn = Math.ceil(totalProducts / 3);

    const column1Products = products.slice(0, productsPerColumn);
    populateColumn('column1', column1Products, 'up');

    const column2Products = products.slice(productsPerColumn, productsPerColumn * 2);
    populateColumn('column2', column2Products, 'down');

    const column3Products = products.slice(productsPerColumn * 2);
    populateColumn('column3', column3Products, 'up');

    console.log('Main page populated');
}

function addProductListeners() {
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        const productId = parseInt(item.getAttribute('data-product-id'));
        item.addEventListener('click', () => {
            console.log('Clicked product ID:', productId); // Pang debug
            selectProduct(productId);
        });
    });
}

async function init() {
    console.log('Current page:', window.location.pathname);

    await initializeProductCache();

    console.log('Populating main page and adding product listeners');
    await populateMainPage();
    addProductListeners();
}

document.addEventListener('DOMContentLoaded', init);


