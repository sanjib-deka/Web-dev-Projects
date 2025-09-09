# backend-SignKaro

# 📦 SignKaro – Backend

This is the **backend** of [SignKaro](https://signkaro-sanjib.vercel.app/), a MERN stack application that allows users to **digitally sign PDF documents** with support for audit trails, signature drawing, and secure user authentication.

---

## 🔧 Tech Stack

- **Node.js** + **Express.js** – Backend server
- **MongoDB** + **Mongoose** – Database & schema modeling
- **JWT** – Authentication
- **Bcrypt** – Password hashing
- **Cloudinary** – For storing uploaded signature images
- **Multer** – File uploads
- **Dotenv** – Environment variable management
- **CORS** & **Cookie-Parser** – Middleware support

---

## 📁 Project Structure

backend-SignKaro/
│
├── controllers/ # Route controllers
├── models/ # Mongoose schemas
├── middleware/ # Auth middleware
├── routes/ # Express routes
├── utils/ # Utility functions
├── uploads/ # Local temporary storage
├── .env # Environment variables
├── server.js # Entry point
└── package.json

yaml
Copy
Edit

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sanjib-deka/backend-SignKaro.git
cd backend-SignKaro
2. Install Dependencies
bash
Copy
Edit
npm install
3. Create .env File
Create a .env file in the root folder and add the following variables:

env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
4. Run the Server
bash
Copy
Edit
npm run dev

🔗 Live App: https://signkaro-sanjib.vercel.app
