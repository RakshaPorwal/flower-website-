window.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const productData = JSON.parse(localStorage.getItem("products")) || [];

  // Redirect if not logged in
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // Show user info
  document.getElementById("profileName").innerText = currentUser.name;
  document.getElementById("profileEmail").innerText = currentUser.email;

  // Filter user-specific orders
  const userOrders = orders.filter(order => order.userEmail === currentUser.email);
  const orderList = document.getElementById("orderList");

  if (userOrders.length === 0) {
    orderList.innerHTML = "<li>No past orders found.</li>";
    return;
  }

  userOrders.reverse().forEach(order => {
    const orderBlock = document.createElement("li");

    const productDetails = order.cart.map(item => {
      const product = productData.find(p => p.id == item.product_id);
      const name = product?.name || "Unknown";
      const price = product?.price || 0;
      const subtotal = price * item.quantity;

      return `${name} x ${item.quantity} = ₹${subtotal}`;
    }).join("<br>");

    orderBlock.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>Date:</strong> ${order.date}<br>
        <strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}<br>
        <strong>Items:</strong><br> ${productDetails}<br>
        <strong>Total:</strong> ₹${order.total}
      </div>
    `;
    orderList.appendChild(orderBlock);
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
});
