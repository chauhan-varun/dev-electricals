# Dev Electricals - Full Stack E-Commerce & Service Platform

## Introduction

Dev Electricals is a comprehensive web platform for an electrical products and services business. This full-stack application enables customers to purchase electrical products, request services, schedule repairs, and even sell their used electrical items. The platform includes both client-facing and admin interfaces to streamline business operations.

## Team Details

**Leader:** Varun Chauhan (Roll No: 2401010276)

**Team Members:**
- Prem (Roll No: 2401010243)
- Ashish (Roll No: 2401010284)
- Vicky (Roll No: 2401010248)

**Institution:** KR Mangalam University, BTech CSE Core, Section B

## Features

### Client Panel

- **Product Catalog:** Browse and shop from a wide range of electrical products
- **Shopping Cart:** Add products to cart and manage quantities
- **Sell-to-Us:** Upload used electrical products for potential purchase by Dev Electricals
- **Services & Repairs:** Schedule appointments for various electrical services:
  - Home Wiring
  - Appliance Installation
  - Solar Panel Installation
  - General Electrical Repairs
- **Contact Information:** Access business details including address, contact information, and live location

### Cart & Checkout

- Add/remove items from cart
- Update product quantities
- Cash on Delivery payment method

### Admin Panel

- **Product Management:** Create, view, edit, and update product details
- **Service Request Management:** View and manage all service and repair bookings
- **Sell-to-Us Management:** Review and approve submitted product listings
  - Approved items appear in the product catalog with a "Refurbished" tag
- **Dashboard:** Overview of business operations and pending actions

### Authentication

- Google Sign-In integration for secure customer authentication
- JWT (JSON Web Tokens) for maintaining secure sessions

## Tech Stack

### Frontend
- **React.js:** Frontend library for building the user interface
- **Tailwind CSS:** Utility-first CSS framework for styling
- **JavaScript:** Programming language for frontend functionality

### Backend
- **Node.js:** JavaScript runtime for server-side code
- **Express.js:** Web application framework for Node.js

### Database
- **MongoDB:** NoSQL database for storing application data

### Image Storage
- **Cloudinary:** Cloud-based image management solution

### Authentication
- **Google Authentication:** OAuth 2.0 for secure user authentication
- **JWT:** Token-based authentication mechanism

## Installation Instructions

### Prerequisites
- Node.js (v14.x or higher)
- npm (v6.x or higher)
- MongoDB (v4.x or higher)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/chauhan-varun/varun_chauhan_CSE_B_BussinessWebsite.git
   cd varun_chauhan_CSE_B_BussinessWebsite
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Navigate to frontend directory
   cd ../client
   npm install
   cd ../admin
   npm install
   ```

3. **Environment Variables**
   - Create `.env` file in all three directories refer to the `.env.example` files

4. **Start development servers**
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # In a separate terminal, start frontend
   cd ../client
   npm run dev
   
   # In another terminal, start admin
   cd ../admin
   npm run dev
   ```

5. **Access the application**
   - client: http://localhost:5173
   - admin: http://localhost:5174
   - Backend API: `http://localhost:${PORT}`

## Usage

### Customer Usage
1. Register/Login using Google authentication
2. Browse products in the catalog
3. Add desired items to cart
4. Schedule services or repairs as needed
5. Submit used electrical products for potential purchase
6. Complete checkout with Cash on Delivery

### Admin Usage
1. Access admin panel via admin panel
2. Manage product inventory (add, edit, remove products)
3. Review and manage service/repair requests
4. Review and approve/reject sell-to-us submissions

---

Developed with ❤️ by Team G11