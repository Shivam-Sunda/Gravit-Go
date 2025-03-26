# 🚀 Gravit & Go - Campus Restaurant Management System  

Gravit & Go is a **web-based Campus Restaurant Management System** that allows students and faculty to **place orders, track food availability, and file complaints**, while enabling restaurant admins to **manage inventory, process orders, and track analytics**.  

---

## 📌 Features  
✅ **User Module** (Students & Faculty)  
- View menu & availability.  
- Place takeaway orders & track status.  
- File complaints against service issues.  

✅ **Admin Module** (Restaurant Owners)  
- Manage inventory & update menu items.  
- Process incoming orders & mark completion.  
- View sales analytics & performance reports.  

✅ **Payments**  
- Integrated **Razorpay** for secure online transactions.  

✅ **Multi-Restaurant Support**  
- Supports 5 restaurants:  
  - **Darling Cafe (`dc_orders`)**  
  - **Darling KC (`fc_orders`)**  
  - **Madras Coffee House (`mch_orders`)**  
  - **GDN Canteen (`gdn_orders`)**  
  - **KC Foods (`kc_orders`)**  

---

## 🛠️ Installation & Setup  

### **Step 1: Clone the Repository**  
```sh
git clone https://github.com/your-username/gravit-go.git
cd gravit-go
```

### **Step 2: Install Dependencies**  
```sh
npm install
```

### **Step 3: Set Up MySQL Database**  
1. Open **MySQL Workbench / phpMyAdmin**.  
2. Create a **database** named `ecommerce`.  
3. Run the following SQL script to create restaurant tables:  

```sql
CREATE TABLE kc_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    quantity INT,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending'
);

CREATE TABLE fc_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    quantity INT,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending'
);

CREATE TABLE dc_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    quantity INT,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending'
);

CREATE TABLE gdn_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    quantity INT,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending'
);

CREATE TABLE mch_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    quantity INT,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending'
);
```

### **Step 4: Configure Environment Variables**  
Create a `.env` file and add:  

```
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=ecommerce
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### **Step 5: Start the Server**  
```sh
node server.js
```
The server will start on **http://localhost:8000**.  

---

## 📌 API Endpoints  

### **1️⃣ User APIs**  
- `POST /place-order` → Place a new order.  
- `GET /get-orders?restaurant=kc_orders` → Fetch orders for a specific restaurant.  
- `GET /get-all-orders` → Fetch all restaurant orders.  

### **2️⃣ Admin APIs**  
- `POST /update-order-status` → Mark order as completed.  

### **3️⃣ Payment APIs**  
- `POST /create-order` → Initiate Razorpay payment.  

---

## 📌 Database Schema  

| Table Name    | Column Name   | Data Type     | Description                      |
|--------------|--------------|--------------|----------------------------------|
| kc_orders    | id           | INT (AUTO_INCREMENT) | Unique Order ID             |
|              | product_name | VARCHAR(255)  | Name of the ordered item      |
|              | quantity     | INT           | Number of units ordered       |
|              | status       | ENUM('Pending', 'Completed') | Order status  |

(Similar schema applies to `fc_orders`, `dc_orders`, `gdn_orders`, and `mch_orders`.)

---

## 📌 Future Enhancements  
- 🔄 **Live Order Tracking** via WebSockets.  
- 📊 **Admin Dashboard** for analytics.  
- ⭐ **Customer Feedback System**.  
- 🔐 **User Authentication** for secure logins.  

---

## 📌 Contributors  
👨‍💻 **Shivam Sunda** - Developed as part of a university project at **VIT**.  

---

## 📌 License  
This project is open-source and available under the **MIT License**.  

🚀 **Enjoy using Gravit & Go!** 🚀
