# BellNotedBackend

BellNotedBackend is the server-side application for the **BellNoted App**. It handles user authentication, attendance data fetching, and push notifications for PSIT students.

## Features

- **User Authentication**: Secure login using college ID and password.
- **Attendance Tracking**: Fetches and stores daily attendance records.
- **Notifications**: Sends push notifications for absences.
- **Data Encryption**: All passwords are encrypted using Node.js `crypto`.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: Firebase / Firestore
- **Authentication & Security**: Crypto for password encryption
- **Hosting**: Can be deployed on Render / any cloud provider

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YashvardhanShekhar/BellNotedBackend.git
   cd BellNotedBackend
   
2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**

   Create a `.env` file in the root folder:

   ```
   FIREBASE_API_KEY=<your_firebase_api_key>
   FIREBASE_AUTH_DOMAIN=<your_firebase_auth_domain>
   FIREBASE_PROJECT_ID=<your_firebase_project_id>
   FIREBASE_STORAGE_BUCKET=<your_firebase_storage_bucket>
   FIREBASE_MESSAGING_SENDER_ID=<your_firebase_messaging_sender_id>
   FIREBASE_APP_ID=<your_firebase_app_id>
   ```

4. **Run the server:**

   ```bash
   npm start
   ```

## API Endpoints

* `POST /register` - Register a new user with college ID & password.
* `GET /check/:ID` - Fetch today's attendance for the user.
* `GET /checkAllUsers` - Trigger notification for absences.

*(For full API documentation, see the `/docs` folder if available.)*

## Folder Structure

```
BellNotedBackend/
│
├─ utils/             # Crypto, notifications, helpers
├─ server.js           # Server entry point
└─ package.json
```

## Security

* Passwords are **encrypted** using Node.js `crypto` before storage.
* Sensitive data is stored securely in Firebase / Firestore.
* API endpoints require authentication to access.

## Contributing

Contributions are welcome! Feel free to improve APIs, add error handling, or optimize notifications.
