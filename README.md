# Anupama Agencies — FMCG Distribution Management System

An authorized FMCG distributor web portal built for **Anupama Agencies** — handling warehousing, godown workers, beat delivery dispatch, vehicle fleet fuel expenses, and advance payments for **Everest Spices** and **Colgate-Palmolive India Ltd.**

---

## 🎯 Tech Stack (~80% Python, ~20% Frontend)
- **Backend & Core Logic:** Python 3.14, Flask, Flask-SQLAlchemy (ORM), SQLite database (`anupama_agencies.db`).
- **Data Export:** Python standard `csv` library with UTF-8 BOM encoding for 100% Microsoft Excel compatibility.
- **Frontend & UI:** Server-rendered Jinja2 templates, TailwindCSS (via CDN), custom brand theme styles (Everest Warm Red `#C41E3A` and Colgate Trust Blue `#004B87`), Lucide Icons, and Chart.js for analytics. No heavy Node.js or npm build pipeline required.

---

## 📦 Key Modules & Capabilities

### 1. Godown Staff Management & Worker Profiles (`/workers`)
- Full directory of loaders, drivers, helpers, and supervisors.
- Tracks daily wage rate, contact numbers, emergency phone numbers, and join dates.
- One-click **WhatsApp** (`https://wa.me/91...`) and direct **Call** (`tel:...`) buttons.
- Profile page with monthly attendance history, advance khata transactions, and settlement history.

### 2. Daily & Monthly Attendance Register (`/attendance`)
- **Fast Daily Attendance:** Bulk attendance sheet with one-click **"Mark All Present"** shortcut.
- Statuses supported:
  - **Present (Full Day)** (1.0 day)
  - **Half Day** (0.5 day)
  - **Absent** (0.0 day)
  - **Paid Leave / Holiday** (1.0 day)
- **Monthly Muster Roll (`/attendance/monthly`):** Day-by-day matrix view (1–31) with color-coded status badges, total effective days worked, and attendance percentage.

### 3. Advance Payment & Staff Khata Ledger (`/advances`)
- Record cash, UPI (GPay/PhonePe), or bank advances given to godown staff.
- Real-time balances: Total Given, Outstanding Khata Balance, and Settled amounts.
- Filter by worker or approval status (`Approved`, `Pending`, `Settled`).

### 4. Delivery Vehicles & Monthly Fuel Expense Tracker (`/fuel`)
- Fleet management for mini-trucks, delivery vans, and autos (e.g. Tata Ace Gold, Mahindra Bolero, Piaggio Ape).
- Fuel logs with Liters, Amount Spent (₹), Odometer reading (KM), and **Fuel Receipt Slip photo upload** with click-to-preview modal.
- Monthly fuel analytics comparison (current month vs. previous month) and interactive 6-month trend chart via Chart.js.

### 5. Daily Delivery / Beat Dispatch Tracker (`/dispatches`)
- Track morning route dispatches by beat (e.g., Main Bazaar Wholesale Market, Station Road Kirana Stores).
- Records assigned vehicle, delivery driver, godown helper, and tallies of **Everest Spices Crates** and **Colgate-Palmolive Cartons**.
- Status updates from *Dispatched* to *Delivered & Reconciled*.

### 6. Damaged / Expiry Return Log (`/returns`)
- Log damaged cartons, leaking paste tubes, or expired spice packets returned from retailers.
- Tracks manufacturer brand (Everest vs. Colgate), batch numbers, expiry dates, claim amounts, and depot claim approval statuses (*Pending Inspection* $\rightarrow$ *Submitted to Depot* $\rightarrow$ *Credit Note Received* with Credit Note #).

### 7. Monthly Salary & Advance Settlement Calculator (`/settlements`)
- Automated formula:
  $$\text{Net Payout} = (\text{Effective Working Days} \times \text{Daily Wage}) - \text{Advance Deductions} + \text{Bonus}$$
- Interactive live calculation in browser.
- One-click settlement action that updates khata advance records to 'Settled'.
- **Printable Wage Payment Voucher:** Professional printable voucher (`/settlements/voucher/<id>`) formatted with signature blocks for both Worker and Authorized Godown Manager.

### 8. One-Click Excel / CSV Exports
- Attendance Register CSV (`/export/attendance`)
- Advance Khata Ledger CSV (`/export/advances`)
- Vehicle Fuel Expenses CSV (`/export/fuel`)
- Salary Settlements CSV (`/export/settlements`)
- Damaged & Expiry Returns CSV (`/export/returns`)

---

## 🚀 Installation & Running Locally

### 1. Prerequisites
- Python 3.10+ installed on your system.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Application
```bash
python app.py
```

### 4. Access the Portal
Open your web browser and navigate to:
```
http://127.0.0.1:5000
```
*Note: The SQLite database (`anupama_agencies.db`) automatically initializes on first run and populates realistic mock data for 5 godown workers, vehicles, attendance records, advances, fuel expenses, and beat dispatches.*

---

## 🧪 Running Automated Smoke Tests
To run the automated verification suite:
```bash
python smoke_test.py
```
This tests all database models, page rendering (HTTP 200), attendance saving, advance balance updating, salary settlement generation, and CSV download streams.

---

## 🌐 Cloud Deployment (Render.com)

The project includes pre-configured production files ([render.yaml](render.yaml) and [gunicorn.conf.py](gunicorn.conf.py)) for zero-friction cloud deployment on Render's Free tier:

### Method 1: Using Render Blueprint (Recommended - 1 Click)
1. Go to [dashboard.render.com](https://dashboard.render.com/) and log in with your GitHub account (`aaryank3007-svg`).
2. Click **New +** (top right) $\rightarrow$ **Blueprint**.
3. Grant access to your repository: `aaryank3007-svg/anupama-agencies`.
4. Render automatically reads `render.yaml`, configures Python 3.11, sets up Gunicorn on the assigned cloud `$PORT`, and generates a secure random `SECRET_KEY`.
5. Click **Apply**. Your web app will build and go live at `https://anupama-agencies.onrender.com` with a free SSL/HTTPS certificate!

### Method 2: Manual Web Service Setup
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect `aaryank3007-svg/anupama-agencies`.
3. Configure the following settings:
   - **Name:** `anupama-agencies`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** `Free`
4. Click **Create Web Service**.
