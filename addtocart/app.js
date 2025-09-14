let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];

// Toggle cart
iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});
closeCart.addEventListener('click', () => {
    body.classList.remove('showCart');
});

// Add products to HTML
const addDataToHTML = () => {
    if (products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
                <img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">₹${product.price}</div>
                <button class="addCart">Add To Cart</button>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
};

// Click event to add to cart
listProductHTML.addEventListener('click', (event) => {
    if (event.target.classList.contains('addCart')) {
        let id_product = event.target.parentElement.dataset.id;
        addToCart(id_product);
    }
});

// Add to cart
const addToCart = (product_id) => {
    let position = cart.findIndex(item => item.product_id == product_id);
    if (position < 0) {
        cart.push({ product_id, quantity: 1 });
    } else {
        cart[position].quantity++;
    }
    addCartToHTML();
    saveCartToStorage();
};

// Save to localStorage
const saveCartToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

// Render cart
const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let grandTotal = 0;

    cart.forEach(item => {
        let product = products.find(p => p.id == item.product_id);
        let itemTotal = product.price * item.quantity;

        totalQuantity += item.quantity;
        grandTotal += itemTotal;

        let newItem = document.createElement('div');
        newItem.classList.add('item');
        newItem.dataset.id = item.product_id;
        newItem.innerHTML = `
            <div class="image"><img src="${product.image}" /></div>
            <div class="name">${product.name}</div>
            <div class="totalPrice">₹${itemTotal}</div>
            <div class="quantity">
                <span class="minus"><</span>
                <span>${item.quantity}</span>
                <span class="plus">></span>
            </div>
            <div class="remove">X</div>
        `;
        listCartHTML.appendChild(newItem);
    });

    iconCartSpan.innerText = totalQuantity;

    // 👉 Append grand total at the bottom
    if (cart.length > 0) {
        let totalDiv = document.createElement("div");
        totalDiv.classList.add("cart-total");
        totalDiv.innerHTML = `<strong>Total: ₹${grandTotal}</strong>`;
        listCartHTML.appendChild(totalDiv);
    }
};


// Cart interaction
listCartHTML.addEventListener('click', (event) => {
    let el = event.target;
    let id = el.closest('.item')?.dataset.id;

    if (el.classList.contains('plus') || el.classList.contains('minus')) {
        updateQuantity(id, el.classList.contains('plus') ? 'plus' : 'minus');
    }

    if (el.classList.contains('remove')) {
        cart = cart.filter(item => item.product_id !== id);
        addCartToHTML();
        saveCartToStorage();
    }

});

// Change quantity
const updateQuantity = (product_id, type) => {
    let index = cart.findIndex(item => item.product_id == product_id);
    if (index >= 0) {
        if (type === 'plus') {
            cart[index].quantity++;
        } else {
            cart[index].quantity--;
            if (cart[index].quantity <= 0) cart.splice(index, 1);
        }
    }
    addCartToHTML();
    saveCartToStorage();
};

// Init
const initApp = () => {
    fetch('products.json')
        .then(res => res.json())
        .then(data => {
            products = data;
            addDataToHTML();

            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
                addCartToHTML();
            }
        });
};

document.getElementById("proceedToCheckoutBtn").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert("🛒 Please add items to cart before checkout!");
    return;
  }

  window.location.href = "checkout.html";
});



initApp();
