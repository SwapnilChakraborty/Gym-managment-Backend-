## 📌 Endpoints

### 🏋️ Gym Management
- `GET /gyms` - Fetch all gyms
- `POST /gyms` - Add a new gym

### 📅 Booking
- `POST /booking` - Book a slot
- `GET /booking/:id` - Get booking details

### 💳 Payments
- `POST /payment/initiate` - Initiate a payment
- `GET /payment/status/:paymentId` - Check payment status

### 🔔 Notifications
- `GET /notifications` - Fetch user notifications
- `WebSocket: ws://yourserver/bookings-updates` - Real-time booking updates

## 🔗 How to Connect
Frontend developers can make API requests using:
- `fetch()` in JavaScript
- `Axios` for React/Next.js
- `Postman` for testing

## 📡 WebSocket Integration
For real-time updates, connect to:
