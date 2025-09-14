let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const cartList = document.getElementById("cartItemsList");
const totalDisplay = document.getElementById("cartTotal");
const msg = document.getElementById('msg');
let totalPrice = 0;

// ✅ Redirect if not logged in
window.addEventListener("DOMContentLoaded", () => {
  if (!currentUser) {
    localStorage.setItem("redirectTo", "checkout.html");
    window.location.href = "login.html";
    return;
  }

  // ✅ Autofill user info
  document.getElementById("fullName").value = currentUser.name;
  document.getElementById("email").value = currentUser.email;

  // ✅ Load products.json then show cart
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      products = data;
      displayCartItems();
    });
});

function displayCartItems() {
  cartList.innerHTML = "";
  totalPrice = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id == item.product_id);
    if (!product) return;

    const qty = item.quantity || 1;
    const subtotal = product.price * qty;
    totalPrice += subtotal;

    const li = document.createElement("li");
    li.textContent = `${product.name} x ${qty} = ₹${subtotal}`;
    cartList.appendChild(li);
  });

  totalDisplay.textContent = totalPrice;
}

// ✅ Payment method handling
const paymentMethodSelect = document.getElementById("paymentMethod");
const paymentDetailsDiv = document.getElementById("paymentDetails");

paymentMethodSelect.addEventListener("change", () => {
  const method = paymentMethodSelect.value;
  paymentDetailsDiv.innerHTML = "";

  if (method === "card") {
    paymentDetailsDiv.innerHTML = `
      <input type="text" id="cardNumber" placeholder="Card Number" required><br><br>
      <input type="text" id="expiry" placeholder="MM/YY" required><br><br>
      <input type="text" id="cvv" placeholder="CVV" required><br><br>
    `;
  } else if (method === "upi") {
    paymentDetailsDiv.innerHTML = `
      <input type="text" id="upiId" placeholder="Enter your UPI ID" required><br><br>
      <button type="button" onclick="generateUpi()">Generate UPI Payment</button><br><br>
      <a id="upiPaymentLink" href="#" target="_blank" style="display: none; color: green;"></a>
      <div id="qrContainer" style="margin-top: 20px; display: none;">
        <p>Or scan this QR in your UPI app:</p>
        <img id="upiQR" src="" alt="UPI QR Code" />
      </div>
    `;
  } else if (method === "cod") {
    paymentDetailsDiv.innerHTML = `<p><strong>Note:</strong> You will pay at the time of delivery.</p>`;
  }
});

// ✅ Form Submit
document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const method = paymentMethodSelect.value;

  if (!name || !email || !address || !method) {
    msg.innerText = "⚠️ Please fill all fields and select payment method.";
    msg.style.color = "red";
    return;
  }

  const order = {
    customer: { name, email, address },
    cart,
    paymentMethod: method,
    total: totalPrice,
    date: new Date().toLocaleString()
  };

  // Save order
  localStorage.setItem("lastOrder", JSON.stringify(order));
  let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  allOrders.push({ userEmail: email, ...order });
  localStorage.setItem("orders", JSON.stringify(allOrders));

  // Clear cart
  localStorage.removeItem("cart");

  msg.innerText = `🎉 Order placed successfully!\nThank you, ${name}!`;
  msg.style.color = "green";
  document.getElementById("backBtn").style.display = "inline-block";
});

// ✅ UPI QR Generator
function generateUpi() {
  const upiId = document.getElementById("upiId").value.trim();
  const amount = totalPrice || 0;

  if (!upiId || !upiId.includes("@")) {
    alert("⚠️ Please enter a valid UPI ID");
    return;
  }

  const payeeName = "Bloom Flowers";
  const note = "Order Payment";
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Show payment link
  const upiAnchor = document.getElementById("upiPaymentLink");
  upiAnchor.href = upiLink;
  upiAnchor.innerText = `Pay ₹${amount} via UPI App`;
  upiAnchor.style.display = "inline-block";

  // Show QR (using API)
  const qrImg = document.getElementById("upiQR");
  const qrContainer = document.getElementById("qrContainer");
  qrImg.src = "image/QR.jpg";
  qrContainer.style.display = "block";

  msg.innerHTML = '<div class="loader"></div> Waiting for payment...';

  // Auto-place order after 5s (simulate payment success)
  setTimeout(() => {
     if (!address) {
    alert("⚠️ Please enter your shipping address before placing order.");
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerText = "Place Order";
    msg.innerHTML = "";
    return;
  }
    msg.innerHTML = '<div class="success-checkmark">✅</div> Order placed successfully!';
    msg.style.color = "green";

    // Clear cart
    localStorage.removeItem("cart");
    document.getElementById("backBtn").style.display = "inline-block";
  }, 5000);
}
