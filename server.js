import express from "express";
import mysql from "mysql2/promise";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));  // Serve static assets

app.get("/", (req, res) => {
  res.redirect("/public/login/login.html");
});


// ✅ Razorpay Instance
const razorpay = new Razorpay({
    key_id: "rzp_test_qN051OkLcA22wd",  // Replace with your Key ID
    key_secret: "nge12hQbeZdXGg2wVeKljCoJ",  // Replace with your Key Secret
});


// ✅ Create MySQL Connection Pool
const pool = mysql.createPool({
    host: "be3dbwfukhdlvzyriqsl-mysql.services.clever-cloud.com",
    user: "u7hypwnm5gyqax46",   // Your Clever Cloud MySQL user
    password: "MbyMF0xVGe6MhTStDX7i",   // Your Clever Cloud MySQL password
    database: "be3dbwfukhdlvzyriqsl",  // Your Clever Cloud database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


// ✅ Check MySQL Connection
pool.getConnection()
    .then(connection => {
        console.log("✅ Connected to MySQL Database!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ MySQL Connection Error:", err);
    });

// ✅ Restaurant Tables Mapping
const restaurantTables = {
    "kc": "kc_orders",
    "fc": "fc_orders",
    "dc": "dc_orders",
    "gdn": "gdn_orders",
    "mch": "mch_orders"
};

// ✅ Create Razorpay Order
app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100,  // Razorpay requires amount in paise
            currency: currency,
            receipt: "order_receipt_" + new Date().getTime(),
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });

    } catch (error) {
        console.error("❌ Razorpay Order Creation Error:", error);
        res.status(500).json({ error: "Payment order creation failed", details: error.message });
    }
});

// ✅ Place Order for a Specific Restaurant
app.post("/place-order", async (req, res) => {
    try {
        const { items, restaurant } = req.body;

        if (!restaurant || !restaurantTables[restaurant]) {
            return res.status(400).json({ error: "Invalid restaurant specified" });
        }

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: "Invalid request format. 'items' must be an array." });
        }

        const connection = await pool.getConnection();
        const tableName = restaurantTables[restaurant];

        let orders = [];

        for (const item of items) {
            const query = `INSERT INTO ${tableName} (product_name, quantity, status) VALUES (?, ?, 'Pending')`;
            const binds = [item.title, Number(item.quantity)];
            const [result] = await connection.execute(query, binds);

            orders.push({
                orderId: result.insertId,
                productName: item.title,
                quantity: Number(item.quantity),
                status: "Pending"
            });
        }

        connection.release();
        res.json({ success: true, message: `Order placed successfully at ${restaurant}!`, orders });

    } catch (error) {
        console.error("❌ Order Placement Error:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
});

// ✅ Fetch Orders for a Specific Restaurant (For Admin & Users)
app.get("/get-orders", async (req, res) => {
    try {
        const { restaurant } = req.query;

        if (!restaurant || !restaurantTables[restaurant]) {
            return res.status(400).json({ error: "Invalid restaurant specified" });
        }

        const connection = await pool.getConnection();
        const tableName = restaurantTables[restaurant];

        const [orders] = await connection.query(`SELECT id AS orderId, product_name AS productName, quantity, status FROM ${tableName} ORDER BY id DESC`);
        connection.release();

        res.json({ success: true, orders });

    } catch (error) {
        console.error("❌ Error Fetching Orders:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
});

// ✅ Update Order Status (For Admin)
app.post("/update-order-status", async (req, res) => {
    try {
        const { orderId, restaurant } = req.body;

        if (!orderId || !restaurant) {
            return res.status(400).json({ error: "Order ID and restaurant are required" });
        }

        const connection = await pool.getConnection();
        const query = `UPDATE ${restaurant}_orders SET status = 'Completed' WHERE id = ?`; // ✅ Update correct table
        const [result] = await connection.execute(query, [orderId]);
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found or already completed" });
        }

        res.json({ success: true, message: "Order status updated to Completed!" });

    } catch (error) {
        console.error("❌ Order Update Error:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
});


// ✅ Fetch Only Completed Orders for a Specific Restaurant (For Admin)
app.get("/get-completed-orders", async (req, res) => {
    try {
        const { restaurant } = req.query;

        if (!restaurant || !restaurantTables[restaurant]) {
            return res.status(400).json({ error: "Invalid restaurant specified" });
        }

        const connection = await pool.getConnection();
        const tableName = restaurantTables[restaurant];

        const [orders] = await connection.query(`SELECT id AS orderId, product_name AS productName, quantity, status FROM ${tableName} WHERE status = 'Completed' ORDER BY id DESC`);
        connection.release();

        res.json({ success: true, orders });

    } catch (error) {
        console.error("❌ Error Fetching Completed Orders:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
});

app.get("/get-orders", async (req, res) => {
    try {
        const { restaurant } = req.query; // ✅ Get selected restaurant from request

        if (!restaurant) {
            return res.status(400).json({ error: "Restaurant is required" });
        }

        const connection = await pool.getConnection();
        const query = `SELECT id AS orderId, product_name AS productName, quantity, status FROM ${restaurant}_orders ORDER BY id DESC`; // ✅ Fetch from that restaurant's table
        const [orders] = await connection.query(query);
        connection.release();

        res.json({ success: true, orders });

    } catch (error) {
        console.error("❌ Error Fetching Orders:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
});

// ✅ Fetch Orders from All Restaurants
app.get("/get-all-orders", async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // ✅ Define restaurant tables & corresponding display names
        const restaurantTables = {
            "kc_orders": "KC Foods",
            "fc_orders": "Darling FC",
            "dc_orders": "Darling Cafe",
            "gdn_orders": "GDN Canteen",
            "mch_orders": "Madras Coffee House"
        };

        let allOrders = [];

        for (let table in restaurantTables) {
            try {
                const [orders] = await connection.query(
                    `SELECT id AS orderId, ? AS restaurant, product_name AS productName, quantity, status FROM ${table}`,
                    [restaurantTables[table]]  // ✅ This maps the correct name
                );
                allOrders = allOrders.concat(orders);
            } catch (err) {
                console.warn(`⚠️ Table ${table} not found or has no orders.`);
            }
        }

        connection.release();
        res.json({ success: true, orders: allOrders });

    } catch (error) {
        console.error("❌ Error Fetching All Orders:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
});







app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
