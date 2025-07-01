const payBtn = document.querySelector(".btn-buy");

payBtn.addEventListener("click", async () => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems"));
    const restaurant = localStorage.getItem("selectedRestaurant");

    if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    if (!restaurant) {
        alert("Please select a restaurant before ordering!");
        return;
    }

    let totalAmount = cartItems.reduce((sum, item) => {
        let price = parseFloat(item.price.replace("₹", "").trim());
        return sum + price * item.quantity;
    }, 0);

    console.log("Total Cart Amount:", totalAmount);

    try {
        // 🔗 Clever Cloud backend URL
        const baseUrl = "https://app-2529ab11-7381-4515-98a6-85c25c363c41.cleverapps.io";

        // ✅ 1. Create Razorpay Order
        const orderResponse = await fetch(`${baseUrl}/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: totalAmount, currency: "INR" })
        });

        const orderData = await orderResponse.json();

        if (!orderData.success) {
            alert("Payment initiation failed!");
            return;
        }

        // ✅ 2. Open Razorpay Payment Window
        const options = {
            key: "rzp_test_qN051OkLcA22wd",
            amount: orderData.order.amount * 100,
            currency: orderData.order.currency,
            name: "Campus Restaurant",
            description: `Order from ${restaurant.toUpperCase()}`,
            order_id: orderData.order.id,
            handler: async function (response) {
                console.log("✅ Payment Successful:", response);

                // ✅ 3. Place Order in Database
                const placeOrderResponse = await fetch(`${baseUrl}/place-order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: cartItems,
                        restaurant,
                        razorpayPaymentId: response.razorpay_payment_id,
                    })
                });

                const placeOrderData = await placeOrderResponse.json();

                if (placeOrderData.success) {
                    alert("✅ Order Placed Successfully!");

                    localStorage.removeItem("cartItems");
                    localStorage.removeItem("cartTotal");

                    if (document.querySelector(".cart-content")) {
                        document.querySelector(".cart-content").innerHTML = "";
                    }

                    window.location.href = "cart.html";
                } else {
                    alert("❌ Failed to place order!");
                }
            },
            prefill: {
                name: "Customer",
                email: "customer@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#3399cc"
            }
        };

        const razorpay = new Razorpay(options);
        razorpay.open();

    } catch (error) {
        console.error("❌ Payment Error:", error);
        alert("Something went wrong. Please try again.");
    }
});
