![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase) ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify)
# 🏥 SwasthSetu — Healthcare Administration Dashboard

A full-stack healthcare administration dashboard for managing patients, appointments, staff, and medical records — built with React.js and Firebase, featuring role-based access control and real-time data synchronization.

🔗 **Live Demo:** [swasthsetu-admin.netlify.app](https://swasthsetu-admin.netlify.app)

---

## 📋 Overview

SwasthSetu is a healthcare management system designed to streamline day-to-day hospital administration through a centralized dashboard. It enables secure, role-based management of patients, appointments, and staff records, with real-time data synced through Firebase Firestore.

---
## 📸 Screenshots

| Dashboard | Patient Management |
|---|---|
| ![Dashboard](./screenshots/dashboard.png) | ![Patients](./screenshots/patients.png) |

| Appointments | Analytics |
|---|---|
| ![Appointments](./screenshots/appointments.png) | ![Analytics](./screenshots/analytics.png) |

---

## ✨ Features

- 🔐 **Firebase Authentication** — secure admin login and session management
- 🛡️ **Role-Based Access Control (RBAC)** — different access levels for different admin roles
- 👥 **Patient Management** — add, view, update, and track patient records
- 📅 **Appointment Tracking** — schedule and manage patient appointments
- ☁️ **Real-Time CRUD** — instant data sync across the dashboard using Cloud Firestore
- 📊 **Interactive Analytics** — Chart.js visualizations for patient distribution, appointment trends, and daily hospital operations
- 📱 **Responsive UI** — built with Tailwind CSS for a clean, mobile-friendly interface

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend / Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Data Visualization | Chart.js |
| Deployment | Netlify |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A Firebase project with Authentication and Firestore enabled

### Installation

```bash
git clone https://github.com/aalokpoonia/swasthsetu-admin.git
cd swasthsetu-admin
npm install
```

### Environment Setup

Create a `.env` file in the root directory with your Firebase config:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```


### Run Locally

```bash
npm start
```

Visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
swasthsetu-admin/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── firebase/
│   ├── context/
│   └── App.js
├── package.json
└── README.md
```


---

## 🔮 Future Improvements

- Bed/ward availability tracking
- Doctor scheduling module
- Prescription and medical records management
- Notifications for upcoming appointments

---

## 👤 Author

**Aalok Poonia**
📧 aalokpoonia.work@gmail.com · 🌐 [GitHub](https://github.com/aalokpoonia) · 💼 [LinkedIn](https://linkedin.com/in/aalokpoonia)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
