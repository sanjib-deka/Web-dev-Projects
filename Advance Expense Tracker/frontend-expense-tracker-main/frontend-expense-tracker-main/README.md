# 🧾 DhanPath – Expense Tracking Website

**Dhanbad** is a web-based expense tracker designed to help users monitor, categorize, and visualize their spending patterns with ease. Whether you're budgeting daily or reviewing past transactions, Dhanbad offers a clean and responsive interface for efficient financial tracking.

---

If You check my website = use this link "https://frontend-expense-tracker-tw0u.onrender.com/"

and if it won't login then open my backend link "https://backend-expense-tracker-re0m.onrender.com/" for while because its hosted in render , render sometimes deactivate the any hosted files , so activate entering the link use it .

## 📌 Features

- 🔐 User Authentication (Register/Login/Logout)
- 💸 Add & Categorize Expenses by Date, Amount, and Type
- 📊 Dashboard with Charts (Monthly Breakdown, Pie Charts, Spending Trends)
- 📁 Expense History – View, Filter, and Search Transactions
- 📤 Export Expenses to Excel (.xlsx format)
- 📱 Responsive Design for Desktop and Mobile

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT, bcrypt  
- **Visualization:** Chart.js  
- **Utilities:** xlsx (for exporting data to Excel)

---

### ⚠️ Note on Hosting

> This project uses the **free hosting versions of Render (for backend)** and **Vercel (for frontend)**. Due to cold start times and limited server resources:
>
> - During login, you may experience **delays or temporary failures** in loading the dashboard, even after entering the correct credentials.
> - If this happens, **please try logging in 2–3 times**—the server will eventually respond once it wakes up.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js
- npm or yarn
- MongoDB (local or Atlas)

### Installation
#Download the zip file , extract it 

# Install dependencies
npm install

# Set up environment variables in a .env file
# Example:
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# Start the server
npm run dev
