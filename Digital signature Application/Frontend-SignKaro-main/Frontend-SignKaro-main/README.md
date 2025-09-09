# 🖥️ SignKaro – Frontend

This is the **frontend** of [SignKaro](https://signkaro-sanjib.vercel.app/), a MERN stack web application that allows users to **digitally sign PDF documents** with features like drag-and-drop signatures, text editing, and audit trail support — all in a clean, responsive UI.

---

## 🚀 Live App

👉 [https://signkaro-sanjib.vercel.app](https://signkaro-sanjib.vercel.app)

---

## 🛠️ Tech Stack

- **React.js** – Frontend framework
- **React-PDF** – For rendering PDF files
- **PDF-lib** – For editing and injecting content into PDFs
- **React-Draggable** – Drag and position signature elements
- **React Signature Canvas** – Draw signature functionality
- **Framer Motion** – UI animation
- **Axios** – API calls
- **React Router DOM** – Routing

---

## 📁 Folder Structure

Frontend-SignKaro/
│
├── components/ # Reusable UI components
├── pages/ # All route-based pages
├── context/ # Global context (e.g., user data)
├── assets/ # Icons, images, etc.
├── App.js # Main application file
├── index.js # Entry point
└── package.json

yaml
Copy
Edit

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sanjib-deka/Frontend-SignKaro.git
cd Frontend-SignKaro
2. Install Dependencies
bash
Copy
Edit
npm install
3. Configure Backend URL
Update the backend server URL in the context or environment file (depending on how you’ve implemented it):

js
Copy
Edit
// Example inside context/UserContext.js or similar
const serverUrl = "http://localhost:5000"; // or your deployed backend URL
4. Run the App
bash
Copy
Edit
npm run dev
