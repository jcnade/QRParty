# QR Party 🎧🎉

> **Let the dancefloor decide the line-up!**  
> A real-time, QR-code-powered interactive voting system for events, parties, and DJs.

---

[![Security Status](https://img.shields.io/badge/security-fully_patched-success.svg)](https://github.com/jcnade/QRParty)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D_22.0.0-blue.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-Redis_/_Valkey-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/license-Beerware-orange.svg)](https://en.wikipedia.org/wiki/Beerware)

**QR Party** is a lightweight, high-performance web application designed to let event participants vote for their favorite tracks, sets, or DJs in real time using printed QR codes and any camera-enabled device (smartphone, laptop, or Raspberry Pi). 

Designed with simplicity and efficiency in mind, it works entirely in local network environments (no active internet connection required) and supports hosting multiple simultaneous parties on a single instance.

---

## 🚀 Key Features

* **Multi-Party Support**: Host and manage multiple parties concurrently with unique PartyTAGs.
* **100% Offline-Capable**: Runs perfectly on a local network without requiring an external internet connection.
* **Real-Time Data Visualization**: High-impact, responsive D3.js real-time charts designed for projector screens and VJ setups.
* **Ultra-Lightweight**: Fully optimized to run on low-spec and older hardware (e.g., Raspberry Pi, legacy laptops).
* **Responsive & Mobile-Friendly**: Clean, modern web interfaces for DJs, admins, and voters alike.
* **Secure & Solid**: Fully patched dependencies with zero security vulnerabilities.

---

## 🛠️ Modern Tech Stack

The system has been modernized to run on contemporary web standards:

* **Backend**: Node.js (v22+) & Express (v4+)
* **Database**: Redis / Valkey (v6+ / v8+)
* **Templating Engine**: Pug (v3+)
* **Frontend**: Bootstrap, jQuery, & D3.js (v5)
* **Real-time Scanning**: HTML5 Webcam scanner integrated via Instascan
* **QR Generation**: Modernized native Node-QRCode implementation

---

## 📦 Installation & Setup

### Prerequisites

* **Node.js** (v22 or higher recommended)
* **Redis** or **Valkey** database server

### 1. Database Setup

Install and start **Redis** (or its open-source compatible counterpart **Valkey**).

#### Using Docker (Recommended)
```bash
docker run -d --name valkey -p 6380:6380 valkey/valkey:8.1.3-alpine3.22 --port 6380
```

#### Native installation on Ubuntu
```bash
sudo apt update
sudo apt install redis-server
```

### 2. Project Installation

Clone the repository and install the production dependencies:

```bash
# Clone the repository
git clone https://github.com/jcnade/QRParty.git
cd QRParty

# Install fully-patched dependencies
npm install
```

### 3. Run the Server

Start the QR Party web server:

```bash
npm start
```
The server will start up on `http://localhost:3001` (configurable in `config/default.yaml`).

---

## 📖 How to Use

### 1. Create a Party
Access the admin portal to configure your party parameters and description:
```
http://localhost:3001/start/your-party-id
```

### 2. Print QR Codes
Generate and print unique voter cards from the Admin Dashboard. Cut them out and distribute them to your dancefloor participants. Each card contains high-quality, pre-encoded QR codes.

### 3. Vote via Webcam
Participants scan their QR codes using any terminal equipped with a camera or webcam:
```
http://localhost:3001/vote/your-party-id
```

### 4. VJ/Projector Screen Live Feed
Broadcast the gorgeous real-time chart feed on your event’s main screens or projectors:
```
http://localhost:3001/vjay/your-party-id
```

---

## 🍺 License

This project is released under the **Beerware License** (Revision 42):
> As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.
