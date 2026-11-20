
const API_URL = "http://localhost:5000/api";

// Get Login Token
function getToken() {
    return sessionStorage.getItem("token");
}

// Check Admin
function isAdmin() {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    return user && user.role === "admin";
}

// LOGOUT
function logoutUser() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    document.getElementById("admin").style.display = "none";

    alert("Logged out successfully!");

    location.reload();
}

// Load Products
async function loadProducts() {
    const productList = document.getElementById("product-list");

    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        const products = await response.json();
        productList.innerHTML = "";

        products.forEach((product) => {
            const card = document.createElement("div");
            card.className = "product-card";

            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.name;

            const name = document.createElement("h3");
            name.textContent = product.name;

            const description = document.createElement("p");
            description.textContent = product.description;

            const price = document.createElement("p");
            price.textContent = "Price: ₹" + product.price;

            const button = document.createElement("button");
            button.textContent = "Add to Cart";
            button.onclick = () => addToCart(product._id);

            card.append(image, name, description, price, button);
            productList.appendChild(card);
        });

    } catch (error) {
        console.error("Product Error:", error);
        productList.textContent = "Unable to load products.";
    }
}

// Add to Cart
async function addToCart(productId) {
    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to add product");
        }

        alert("Product added to cart!");
        loadCart();

    } catch (error) {
        console.error("Cart Error:", error);
        alert(error.message);
    }
}

// Load Cart
async function loadCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    try {
        const response = await fetch(`${API_URL}/cart`);

        if (!response.ok) {
            throw new Error("Unable to load cart");
        }

        const items = await response.json();

        cartItems.innerHTML = "";
        let total = 0;

        if (items.length === 0) {
            cartItems.textContent = "Your cart is empty.";
            cartTotal.textContent = "0";
            return;
        }

        items.forEach((item) => {
            if (!item.product) return;

            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;

            const div = document.createElement("div");
            div.className = "cart-item";

            const name = document.createElement("h3");
            name.textContent = item.product.name;

            const quantity = document.createElement("p");
            quantity.textContent = "Quantity: " + item.quantity;

            const price = document.createElement("p");
            price.textContent = "Price: ₹" + itemTotal;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.onclick = () => removeFromCart(item._id);

            div.append(name, quantity, price, removeButton);
            cartItems.appendChild(div);
        });

        cartTotal.textContent = total;

    } catch (error) {
        console.error("Load Cart Error:", error);
        cartItems.textContent = "Unable to load cart.";
    }
}

// Remove from Cart
async function removeFromCart(cartId) {
    try {
        const response = await fetch(`${API_URL}/cart/${cartId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to remove product");
        }

        loadCart();

    } catch (error) {
        console.error("Remove Error:", error);
    }
}

// Place Order
document.getElementById("checkout-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const customerName = document.getElementById("customerName").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const message = document.getElementById("order-message");

    try {
        const response = await fetch(`${API_URL}/orders/place`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerName,
                email,
                address
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Order failed");
        }

        message.textContent =
            "Order placed successfully! Order ID: " + result.order._id;

        document.getElementById("checkout-form").reset();
        loadCart();

    } catch (error) {
        console.error("Order Error:", error);
        message.textContent = error.message;
    }
});

// Track Order
document.getElementById("tracking-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("tracking-email").value.trim();
    const results = document.getElementById("tracking-results");

    results.textContent = "Loading your orders...";

    try {
        const response = await fetch(
            `${API_URL}/orders/track/${encodeURIComponent(email)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to track orders");
        }

        results.innerHTML = "";

        result.orders.forEach((order) => {
            const card = document.createElement("div");
            card.className = "cart-item";

            const heading = document.createElement("h3");
            heading.textContent = "Order ID: " + order._id;

            const amount = document.createElement("p");
            amount.textContent = "Total Amount: ₹" + order.totalAmount;

            const status = document.createElement("p");
            status.textContent = "Order Status: " + order.status;

            const date = document.createElement("p");
            date.textContent = "Order Date: " +
                new Date(order.createdAt).toLocaleDateString("en-IN");

            card.append(heading, amount, status, date);

            if (order.products) {
                order.products.forEach((item) => {
                    if (!item.product) return;

                    const product = document.createElement("p");
                    product.textContent =
                        item.product.name + " - Quantity: " + item.quantity;

                    card.appendChild(product);
                });
            }

            results.appendChild(card);
        });

    } catch (error) {
        console.error("Tracking Error:", error);
        results.textContent = error.message;
    }
});

// User Registration
document.getElementById("register-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const message = document.getElementById("register-message");

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Registration failed");
        }

        message.textContent = result.message;
        document.getElementById("register-form").reset();

    } catch (error) {
        message.textContent = error.message;
    }
});

// User Login
document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed");
        }

        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", JSON.stringify(result.user));

        message.textContent =
            "Login successful! Welcome " + result.user.name;

        document.getElementById("login-form").reset();

        if (result.user.role === "admin") {
            document.getElementById("admin").style.display = "block";
            loadAdminProducts();

            document.getElementById("admin").scrollIntoView({
                behavior: "smooth"
            });
        } else {
            document.getElementById("admin").style.display = "none";
        }

    } catch (error) {
        message.textContent = error.message;
    }
});

// ADMIN: Add Product
document.getElementById("admin-product-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!isAdmin()) {
        alert("Please login as admin.");
        return;
    }

    const product = {
        name: document.getElementById("admin-product-name").value,
        description: document.getElementById("admin-product-description").value,
        price: Number(document.getElementById("admin-product-price").value),
        image: document.getElementById("admin-product-image").value,
        category: document.getElementById("admin-product-category").value,
        stock: Number(document.getElementById("admin-product-stock").value)
    };

    const message = document.getElementById("admin-message");

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify(product)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to add product");
        }

        message.textContent = "Product added successfully!";
        document.getElementById("admin-product-form").reset();

        loadProducts();
        loadAdminProducts();

    } catch (error) {
        message.textContent = error.message;
    }
});

// ADMIN: Load Products
async function loadAdminProducts() {
    const list = document.getElementById("admin-product-list");

    if (!isAdmin()) {
        list.textContent = "Please login with your admin account.";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        list.innerHTML = "";

        products.forEach((product) => {
            const div = document.createElement("div");
            div.className = "cart-item";

            const name = document.createElement("h3");
            name.textContent = product.name;

            const price = document.createElement("p");
            price.textContent = "Price: ₹" + product.price;

            const stock = document.createElement("p");
            stock.textContent = "Stock: " + product.stock;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = () => editProduct(product);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteProduct(product._id);

            div.append(name, price, stock, editButton, deleteButton);
            list.appendChild(div);
        });

    } catch (error) {
        list.textContent = error.message;
        console.error(error);
    }
}

// ADMIN: Edit Product
async function editProduct(product) {
    if (!isAdmin()) {
        alert("Admin access only");
        return;
    }

    const name = prompt("Enter product name:", product.name);
    if (name === null) return;

    const description = prompt("Enter description:", product.description);
    if (description === null) return;

    const price = prompt("Enter price:", product.price);
    if (price === null) return;

    const image = prompt("Enter image URL:", product.image);
    if (image === null) return;

    const category = prompt("Enter category:", product.category);
    if (category === null) return;

    const stock = prompt("Enter stock:", product.stock);
    if (stock === null) return;

    try {
        const response = await fetch(`${API_URL}/products/${product._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify({
                name,
                description,
                price: Number(price),
                image,
                category,
                stock: Number(stock)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to update product");
        }

        alert("Product updated successfully!");
        loadProducts();
        loadAdminProducts();

    } catch (error) {
        alert(error.message);
    }
}

// ADMIN: Delete Product
async function deleteProduct(productId) {
    if (!isAdmin()) {
        alert("Admin access only");
        return;
    }

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to delete product");
        }

        alert("Product deleted successfully!");
        loadProducts();
        loadAdminProducts();

    } catch (error) {
        alert(error.message);
    }
}

// Initial Website Load
loadProducts();
loadCart();

// Show Dashboard only for logged-in Admin
if (isAdmin()) {
    document.getElementById("admin").style.display = "block";
    loadAdminProducts();
} else {
    document.getElementById("admin").style.display = "none";
}
