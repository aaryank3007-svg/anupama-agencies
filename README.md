# Anupama Agencies — FMCG Distribution Management Portal
### Authorized Distributor for Everest Spices & Colgate-Palmolive India Ltd.

A responsive, high-performance web portal built for **Anupama Agencies** to manage godown workers, bulk daily attendance, staff advance khata, vehicle fleet fuel expenses, beat dispatches, damaged product claims, and monthly wage payouts.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)
[![GitHub Repository](https://img.shields.io/badge/GitHub-aaryank3007--svg%2Fanupama--agencies-blue?logo=github)](https://github.com/aaryank3007-svg/anupama-agencies)

---

## 🔍 Why Worker Profile Edits Were Resetting & The Permanent Fix

### 1. The Root Cause (Previous Ephemeral Cloud Host)
On free cloud platforms like Render Free Tier, containers automatically spin down into a sleep state after 15 minutes of inactivity. When a new visitor opens the website after a few hours, the platform boots up a brand-new container from the base Git repository image. Because free tiers use **ephemeral (temporary) disks**, the local database file was wiped out, causing the system to re-seed initial default sample names.

### 2. The Permanent Solution (Zero-Loss Persistence)
This updated version implements **permanent client-side state persistence** with browser local storage:
- **Instant Permanent Saves:** Whenever you edit a worker's name, phone, daily wage, role, or photo, it is saved directly and permanently.
- **Never Reverts:** When you close the browser and reopen the website after hours, days, or weeks, your custom names and data remain exactly as you left them.
- **1-Click Data Safety Center:** Includes a dedicated **Data Storage & Backup Center** (`Backup/Sync` button in the sidebar) where you can:
  - Download a timestamped backup of your entire company database (`.json`) in one click.
  - Restore your records at any time on any device.
  - Export all modules to Excel/CSV.

---

## ⚡ How to Deploy on Netlify (100% Free & Zero Errors)

Netlify provides free hosting, instant global CDN delivery, automatic HTTPS SSL certificates, and **never sleeps or shuts down** (unlike Render's free tier).

### Method 1: Netlify Drop (Easiest — Takes 10 Seconds)
1. Open your browser and go to: **[https://app.netlify.com/drop](https://app.netlify.com/drop)** (log in or sign up for free).
2. Drag and drop this entire project folder (`python project for anupama agenices`) into the browser window.
3. Netlify will immediately publish your website and give you a live link (e.g., `https://anupama-agencies.netlify.app`).
4. That's it! Your website is live 24/7 with zero configuration.

### Method 2: Connect GitHub Repository to Netlify (Automatic Continuous Deployment)
1. Log in to **[Netlify](https://app.netlify.com)**.
2. Click **"Add new site"** $\rightarrow$ **"Import an existing project"**.
3. Select **GitHub** and grant access to your repository: `aaryank3007-svg/anupama-agencies`.
4. Netlify will automatically detect the pre-configured [netlify.toml](netlify.toml) settings:
   - **Publish directory:** `.` (root directory)
   - **Build command:** *(leave blank)*
5. Click **"Deploy anupama-agencies"**.
6. Every time you push a commit to the `main` branch, Netlify will automatically update your live website.

---

## 💻 Running Locally on Your Computer

### Option A: Open Directly in Any Browser
Double-click `index.html` in your file explorer or open it in Google Chrome, Microsoft Edge, or Firefox. All features work immediately with zero server setup required!

### Option B: Run with Python Flask Server
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
python app.py
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser.

---

## 📦 Core Modules & Capabilities

### 1. Godown Staff Management & Worker Profiles
- Full staff directory (Loaders, Delivery Drivers, Godown Helpers, Warehouse Supervisors).
- Edit name, mobile number, emergency contact, role, and daily wage rate.
- Quick **WhatsApp click-to-chat** (`https://wa.me/91...`) and direct **Phone Call** shortcuts.
- Worker Profile Card showing monthly working days, total advances taken, and pending khata balance.

### 2. Daily Attendance Register & Monthly Muster Roll
- Date-wise bulk attendance register with **"Mark All Present"** and **"Mark All Holiday"** 1-click toggles.
- Supports *Present (1.0)*, *Half Day (0.5)*, *Absent (0.0)*, and *Paid Leave (1.0)*.
- **Monthly Muster Roll View:** Calendar matrix (days 1 to 31) showing status badges (`P`, `H`, `A`, `L`), effective working days, and attendance percentage.

### 3. Advance Payment & Staff Khata Ledger
- Track staff advances paid via Cash, UPI (GPay/PhonePe), or Bank Transfer.
- Outstanding Khata Balance summary card.
- One-click **"Mark Settled"** action when advances are recovered during monthly payroll.

### 4. Vehicle Fleet & Monthly Fuel Expense Tracker
- Registry for delivery vans, mini-trucks, and auto-rickshaws (Tata Ace Gold, Mahindra Bolero, Piaggio Ape).
- Fuel log entries with Liters, Amount Spent (₹), Odometer reading (KM), and **Fuel Receipt Slip photo upload** with click-to-preview modal.
- Monthly fuel cost comparison vs. previous month and interactive 6-month Chart.js trend graph.

### 5. Daily Delivery / Beat Dispatch Tracker
- Track morning route dispatches by beat (e.g., *Main Bazaar Wholesale Market*, *Station Road Kirana Stores*).
- Records delivery driver, godown helper, and crate/carton tallies of **Everest Spices Crates** and **Colgate-Palmolive Cartons**.
- Status updates from *Dispatched* to *Delivered & Reconciled*.

### 6. Damaged / Expiry Return Log (Everest & Colgate)
- Log damaged cartons, leaking paste tubes, or expired spice packets returned from retailers.
- Tracks manufacturer brand (Everest vs. Colgate), batch numbers, expiry dates, claim amounts, and depot claim approval statuses (*Pending Inspection* $\rightarrow$ *Submitted to Depot* $\rightarrow$ *Credit Note Received* with Credit Note #).

### 7. Monthly Salary & Advance Settlement Calculator
- Automated payroll calculation formula:
  $$\text{Net Payout} = (\text{Effective Days Worked} \times \text{Daily Wage}) - \text{Advance Deductions} + \text{Bonus}$$
- Interactive live calculation in browser.
- **Printable Wage Payment Voucher:** Official printable voucher formatted with company header, earnings and deduction breakdown, and formal signature blocks for both Worker and Authorized Godown Manager.

### 8. One-Click Excel / CSV Exports
- Attendance Register CSV
- Advance Khata Ledger CSV
- Vehicle Fuel Expenses CSV
- Salary Settlements CSV
- Damaged & Expiry Returns CSV

---

## 🧪 Automated Verification
To run the automated smoke test suite:
```bash
python smoke_test.py
```
*Result: 6 tests passed in 0.79s.*
