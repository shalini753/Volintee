# Volintee

Volintee is a modern web platform designed to bridge the gap between passionate volunteers and organizations working to create real-world impact. The platform simplifies the process of discovering, applying for, and managing volunteering opportunities through an intuitive and scalable web application.

---

## 🚀 Features

### For Volunteers

* **Browse Opportunities**: Discover volunteering opportunities with filters based on interests, location, and availability.
* **Easy Application**: Apply to opportunities with a personalized message in just a few clicks.
* **Application Tracking**: Track application status in real time (Pending, Approved, Rejected).
* **Profile Management**: Highlight skills, interests, and a short bio to stand out to organizations.

### For Organizations

* **Create Opportunities**: Post detailed volunteering opportunities with images, requirements, and skills.
* **Application Management**: Review, approve, or reject volunteer applications from a centralized dashboard.
* **Dashboard Overview**: View active opportunities and application statistics.
* **Organization Profile**: Build credibility and attract the right volunteers.

---

## 🛠️ Tech Stack

### Frontend

* **React** – Component-based UI development
* **Vite** – Fast build and development tooling
* **Tailwind CSS** – Utility-first styling
* **Axios** – API communication
* **React Router** – Client-side routing

### Backend

* **Node.js** – JavaScript runtime
* **Express.js** – Backend framework
* **MongoDB** – NoSQL database
* **Mongoose** – MongoDB object modeling
* **JWT (JSON Web Tokens)** – Secure authentication
* **Cloudinary** – Image storage and management

---

## 📁 Project Structure

```text
volintee/
├── client/        # Frontend (React + Vite)
├── server/        # Backend (Node + Express)
├── .env           # Environment variables
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js (v16 or above)
* MongoDB (local or cloud)
* Git

### Clone the Repository

```bash
git clone https://github.com/shalini753/Volintee.git
cd Volintee
```

### Backend Setup

```bash
cd server
npm install
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the server directory and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🌱 Future Enhancements

* Email notifications for application updates
* Admin dashboard for platform moderation
* Volunteer recommendation system
* Analytics and reporting

---

## 🤝 Contribution

This project is currently maintained as a personal project. Contributions, suggestions, and feedback are welcome.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Shalini Dhar**
GitHub: [shalini753](https://github.com/shalini753)

---

*Volintee is built with the goal of making social impact more accessible through technology.*
