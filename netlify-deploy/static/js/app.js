/**
 * Anupama Agencies — FMCG Distributor Web Application (Everest & Colgate)
 * Core Client Controller & Persistent State Engine
 */

// -------------------------------------------------------------------
// 1. STORAGE & STATE MANAGEMENT (PERMANENT LOCALSTORAGE PERSISTENCE)
// -------------------------------------------------------------------
const DB_STORAGE_KEY = 'anupama_agencies_db_v1';

const StorageManager = {
    load() {
        const raw = localStorage.getItem(DB_STORAGE_KEY);
        if (!raw) {
            const initial = this.getInitialSeedData();
            this.save(initial);
            return initial;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse stored DB, resetting to seed data', e);
            const initial = this.getInitialSeedData();
            this.save(initial);
            return initial;
        }
    },

    save(data) {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
    },

    resetToSeed() {
        const initial = this.getInitialSeedData();
        this.save(initial);
        return initial;
    },

    getInitialSeedData() {
        const today = new Date();
        const curYear = today.getFullYear();
        const curMonth = today.getMonth() + 1;

        // 1. Workers
        const workers = [
            {
                id: 1,
                name: "Ramesh Kumar",
                phone: "9823145670",
                emergency_contact: "9823145671",
                role: "Senior Delivery Van Driver",
                daily_wage: 700.0,
                monthly_salary: 18200.0,
                status: "Active",
                join_date: `${curYear - 2}-03-15`,
                photo_path: ""
            },
            {
                id: 2,
                name: "Suresh Yadav",
                phone: "9834123450",
                emergency_contact: "9834123451",
                role: "Godown Loader & Dispatcher",
                daily_wage: 550.0,
                monthly_salary: 14300.0,
                status: "Active",
                join_date: `${curYear - 1}-06-10`,
                photo_path: ""
            },
            {
                id: 3,
                name: "Amit Sharma",
                phone: "9765432100",
                emergency_contact: "9765432101",
                role: "Beat Delivery Van Driver",
                daily_wage: 650.0,
                monthly_salary: 16900.0,
                status: "Active",
                join_date: `${curYear - 1}-09-01`,
                photo_path: ""
            },
            {
                id: 4,
                name: "Manoj Verma",
                phone: "9922334455",
                emergency_contact: "9922334456",
                role: "Godown Helper & Stock Stacker",
                daily_wage: 500.0,
                monthly_salary: 13000.0,
                status: "Active",
                join_date: `${curYear}-01-12`,
                photo_path: ""
            },
            {
                id: 5,
                name: "Rajesh Patel",
                phone: "9811223344",
                emergency_contact: "9811223345",
                role: "Warehouse Supervisor",
                daily_wage: 800.0,
                monthly_salary: 20800.0,
                status: "Active",
                join_date: `${curYear - 3}-02-01`,
                photo_path: ""
            }
        ];

        // 2. Vehicles
        const vehicles = [
            {
                id: 1,
                vehicle_number: "MH-14-GH-4921",
                vehicle_name: "Tata Ace Gold (Everest Spices Van)",
                vehicle_type: "Delivery Van",
                fuel_type: "Diesel",
                assigned_driver_id: 1,
                status: "Active"
            },
            {
                id: 2,
                vehicle_number: "MH-14-DT-1108",
                vehicle_name: "Mahindra Bolero Maxi Truck (Colgate Van)",
                vehicle_type: "Mini Truck",
                fuel_type: "Diesel",
                assigned_driver_id: 3,
                status: "Active"
            },
            {
                id: 3,
                vehicle_number: "MH-14-AB-7732",
                vehicle_name: "Piaggio Ape Auto (Wholesale City Beat)",
                vehicle_type: "Auto Rickshaw",
                fuel_type: "CNG",
                assigned_driver_id: null,
                status: "Active"
            }
        ];

        // 3. Attendance for current month up to today
        const attendances = [];
        let attId = 1;
        const currentDay = today.getDate();
        for (let d = 1; d <= currentDay; d++) {
            const dateStr = `${curYear}-${String(curMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayOfWeek = new Date(curYear, curMonth - 1, d).getDay(); // 0 is Sunday

            workers.forEach((w, idx) => {
                let status = "Present";
                if (dayOfWeek === 0) {
                    status = idx % 2 === 0 ? "Paid Leave" : "Present";
                } else if (d === 4 && idx === 1) {
                    status = "Half Day";
                } else if (d === 9 && idx === 3) {
                    status = "Absent";
                } else if (d === 11 && idx === 2) {
                    status = "Half Day";
                } else if (d === 14 && idx === 4) {
                    status = "Paid Leave";
                }

                attendances.push({
                    id: attId++,
                    worker_id: w.id,
                    date: dateStr,
                    status: status,
                    notes: status === "Present" ? "Regular godown shift" : `Marked as ${status}`
                });
            });
        }

        // 4. Advances
        const pad = (n) => String(n).padStart(2, '0');
        const dMinus = (days) => {
            const dt = new Date();
            dt.setDate(dt.getDate() - days);
            return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        };

        const advances = [
            {
                id: 1,
                worker_id: 2,
                request_date: dMinus(12),
                payment_date: dMinus(12),
                amount_requested: 2000,
                amount_paid: 2000,
                payment_mode: "Cash",
                reason: "Home repair & plumbing material",
                status: "Approved",
                settlement_id: null
            },
            {
                id: 2,
                worker_id: 2,
                request_date: dMinus(3),
                payment_date: dMinus(3),
                amount_requested: 1500,
                amount_paid: 1500,
                payment_mode: "UPI",
                reason: "Mother medical prescription",
                status: "Approved",
                settlement_id: null
            },
            {
                id: 3,
                worker_id: 3,
                request_date: dMinus(8),
                payment_date: dMinus(8),
                amount_requested: 3000,
                amount_paid: 3000,
                payment_mode: "Cash",
                reason: "Children school admission fee",
                status: "Approved",
                settlement_id: null
            },
            {
                id: 4,
                worker_id: 4,
                request_date: dMinus(5),
                payment_date: dMinus(5),
                amount_requested: 1000,
                amount_paid: 1000,
                payment_mode: "Cash",
                reason: "Festival grocery purchase",
                status: "Approved",
                settlement_id: null
            },
            {
                id: 5,
                worker_id: 1,
                request_date: dMinus(35),
                payment_date: dMinus(35),
                amount_requested: 2500,
                amount_paid: 2500,
                payment_mode: "Bank Transfer",
                reason: "Vehicle tyre puncture & family trip",
                status: "Settled",
                settlement_id: null
            }
        ];

        // 5. Fuel Expenses
        const fuel_expenses = [
            {
                id: 1,
                vehicle_id: 1,
                driver_id: 1,
                date: dMinus(14),
                fuel_type: "Diesel",
                amount_spent: 2850,
                liters: 31.6,
                odometer_reading: 41250,
                receipt_image: "",
                notes: "BPCL Highway Pump, Full Tank for Outstation Route"
            },
            {
                id: 2,
                vehicle_id: 2,
                driver_id: 3,
                date: dMinus(10),
                fuel_type: "Diesel",
                amount_spent: 3200,
                liters: 35.5,
                odometer_reading: 28900,
                receipt_image: "",
                notes: "Indian Oil Depot, Colgate Bulk Delivery to Supermarkets"
            },
            {
                id: 3,
                vehicle_id: 3,
                driver_id: 1,
                date: dMinus(6),
                fuel_type: "CNG",
                amount_spent: 850,
                liters: 10.5,
                odometer_reading: 15420,
                receipt_image: "",
                notes: "MGL Station Sector 12 - Daily City Delivery"
            },
            {
                id: 4,
                vehicle_id: 1,
                driver_id: 1,
                date: dMinus(2),
                fuel_type: "Diesel",
                amount_spent: 2500,
                liters: 27.7,
                odometer_reading: 41680,
                receipt_image: "",
                notes: "HP Petrol Pump - Everest Spices Beat Refill"
            }
        ];

        // 6. Beat Dispatches
        const dateTodayStr = `${curYear}-${pad(curMonth)}-${pad(currentDay)}`;
        const dispatch_beats = [
            {
                id: 1,
                dispatch_date: dateTodayStr,
                beat_name: "Main Bazaar & Wholesale Kirana Market",
                vehicle_id: 1,
                driver_id: 1,
                helper_id: 2,
                crates_everest: 45,
                cartons_colgate: 30,
                status: "Dispatched",
                notes: "Morning dispatch - 22 retail drop points"
            },
            {
                id: 2,
                dispatch_date: dateTodayStr,
                beat_name: "Station Road & Central Supermarkets",
                vehicle_id: 2,
                driver_id: 3,
                helper_id: 4,
                crates_everest: 35,
                cartons_colgate: 52,
                status: "Dispatched",
                notes: "High volume Colgate Toothpaste & Everest Masala blend"
            },
            {
                id: 3,
                dispatch_date: dMinus(1),
                beat_name: "Industrial Area & Factory Canteens",
                vehicle_id: 3,
                driver_id: 1,
                helper_id: 4,
                crates_everest: 28,
                cartons_colgate: 15,
                status: "Completed",
                notes: "All crates delivered and empty boxes returned"
            }
        ];

        // 7. Damaged Returns
        const damaged_returns = [
            {
                id: 1,
                return_date: dMinus(5),
                brand: "Everest Spices",
                product_name: "Everest Garam Masala 100g Carton",
                retailer_name: "Shree Ganesh Kirana Stores",
                batch_no: "EV-2026-GM88",
                expiry_date: "2027-04",
                quantity: 3,
                unit: "Cartons",
                reason: "Damaged in Transit",
                claim_status: "Submitted to Depot",
                credit_note_amount: 3600,
                credit_note_number: "",
                notes: "Outer cardboard crushed during truck transit from depot"
            },
            {
                id: 2,
                return_date: dMinus(3),
                brand: "Colgate-Palmolive",
                product_name: "Colgate MaxFresh Red Gel 150g",
                retailer_name: "Laxmi Supermarket",
                batch_no: "CG-0826-MF",
                expiry_date: "2027-08",
                quantity: 14,
                unit: "Tubes",
                reason: "Packaging Leakage",
                claim_status: "Pending Inspection",
                credit_note_amount: 1680,
                credit_note_number: "",
                notes: "Retailer reported crimp leakage inside case"
            },
            {
                id: 3,
                return_date: dMinus(12),
                brand: "Everest Spices",
                product_name: "Everest Pav Bhaji Masala 100g",
                retailer_name: "Sai Krupa Provisions",
                batch_no: "EV-0225-PB",
                expiry_date: "2026-08",
                quantity: 25,
                unit: "Packets",
                reason: "Expired",
                claim_status: "Credit Note Received",
                credit_note_amount: 2150,
                credit_note_number: "CN-EVEREST-94021",
                notes: "Credit note credited in distributor running ledger"
            },
            {
                id: 4,
                return_date: dMinus(1),
                brand: "Colgate-Palmolive",
                product_name: "Colgate Strong Teeth 200g Family Pack",
                retailer_name: "National Daily Mart",
                batch_no: "CG-0626-ST",
                expiry_date: "2027-06",
                quantity: 2,
                unit: "Cartons",
                reason: "Seal Broken",
                claim_status: "Pending Inspection",
                credit_note_amount: 4800,
                credit_note_number: "",
                notes: "Shrink wrap and tape seal torn on arrival"
            }
        ];

        // 8. Salary Settlements
        const salary_settlements = [];

        return {
            version: 1,
            workers,
            vehicles,
            attendances,
            advances,
            fuel_expenses,
            dispatch_beats,
            damaged_returns,
            salary_settlements
        };
    }
};

// Global App State
let APP_DATA = StorageManager.load();
let currentView = 'dashboard';
let currentFuelChart = null;

// -------------------------------------------------------------------
// 2. HELPER UTILITIES
// -------------------------------------------------------------------
function formatINR(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
    const val = Number(amount);
    const isNegative = val < 0;
    const absVal = Math.abs(val);

    const parts = absVal.toFixed(2).split('.');
    const whole = parts[0];
    const decimal = parts[1];

    let res = whole;
    if (whole.length > 3) {
        const last3 = whole.slice(-3);
        let rest = whole.slice(0, -3);
        const chunks = [];
        while (rest.length > 2) {
            chunks.unshift(rest.slice(-2));
            rest = rest.slice(0, -2);
        }
        if (rest) chunks.unshift(rest);
        chunks.push(last3);
        res = chunks.join(',');
    }

    const prefix = isNegative ? '-₹' : '₹';
    return `${prefix}${res}.${decimal}`;
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl border shadow-lg flex items-center justify-between text-xs font-semibold pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 ${
        type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : type === 'error'
            ? 'bg-rose-50 text-rose-900 border-rose-200'
            : 'bg-blue-50 text-blue-900 border-blue-200'
    }`;

    toast.innerHTML = `
        <div class="flex items-center gap-2.5">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-octagon' : 'info'}" class="w-4 h-4 flex-shrink-0"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 p-1">✕</button>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 50);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function previewImage(src, caption = 'Receipt Preview') {
    const modal = document.getElementById('image-preview-modal');
    const img = document.getElementById('modal-preview-img');
    const cap = document.getElementById('modal-preview-caption');
    if (modal && img) {
        img.src = src;
        if (cap) cap.textContent = caption;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// -------------------------------------------------------------------
// 3. STATS & WORKER COMPUTATIONS
// -------------------------------------------------------------------
function getWorkerPendingAdvances(workerId) {
    return APP_DATA.advances
        .filter(a => a.worker_id === workerId && a.status === 'Approved')
        .reduce((sum, a) => sum + (Number(a.amount_paid) || 0), 0);
}

function getWorkerTotalAdvances(workerId) {
    return APP_DATA.advances
        .filter(a => a.worker_id === workerId && (a.status === 'Approved' || a.status === 'Settled'))
        .reduce((sum, a) => sum + (Number(a.amount_paid) || 0), 0);
}

function getWorkerAttendanceSummary(workerId, year, month) {
    const recs = APP_DATA.attendances.filter(a => {
        if (a.worker_id !== workerId) return false;
        const [y, m] = a.date.split('-').map(Number);
        return y === year && m === month;
    });

    let present = 0, half_day = 0, absent = 0, paid_leave = 0;
    recs.forEach(r => {
        if (r.status === 'Present') present++;
        else if (r.status === 'Half Day') half_day++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Paid Leave') paid_leave++;
    });

    const effective_days = present + paid_leave + (half_day * 0.5);
    const total_marked = recs.length;
    const attendance_pct = total_marked > 0 ? ((effective_days / total_marked) * 100).toFixed(1) : '0.0';

    return {
        present,
        half_day,
        absent,
        paid_leave,
        effective_days,
        total_marked,
        attendance_pct: Number(attendance_pct),
        records: recs
    };
}

// -------------------------------------------------------------------
// 4. VIEW ROUTING & NAVIGATION
// -------------------------------------------------------------------
function switchView(viewName) {
    currentView = viewName;
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));

    // Highlight nav button
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('bg-colgate', 'text-white', 'font-semibold', 'shadow-sm');
        btn.classList.add('text-slate-300');
    });

    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
        activeNav.classList.add('bg-colgate', 'text-white', 'font-semibold', 'shadow-sm');
        activeNav.classList.remove('text-slate-300');
    }

    const titleMap = {
        'dashboard': 'Warehouse & Distribution Dashboard',
        'workers': 'Godown Staff & Worker Profiles',
        'attendance': 'Daily Worker Attendance Register',
        'monthly-attendance': 'Monthly Muster Roll & Attendance Grid',
        'advances': 'Advance Payment & Staff Khata Ledger',
        'fuel': 'Delivery Vehicles & Monthly Fuel Expenses',
        'dispatches': 'Daily Delivery & Beat Dispatch Tracker',
        'returns': 'Damaged & Expiry Return Log (Everest & Colgate)',
        'settlements': 'Monthly Salary & Advance Settlement Calculator',
        'voucher': 'Printable Wage Payment Voucher'
    };

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titleMap[viewName] || 'Dashboard';

    // Close mobile drawer if open
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');

    const viewTarget = document.getElementById(`view-${viewName}`);
    if (viewTarget) {
        viewTarget.classList.remove('hidden');
        renderView(viewName);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderView(viewName) {
    switch (viewName) {
        case 'dashboard': renderDashboard(); break;
        case 'workers': renderWorkers(); break;
        case 'attendance': renderAttendance(); break;
        case 'monthly-attendance': renderMonthlyAttendance(); break;
        case 'advances': renderAdvances(); break;
        case 'fuel': renderFuel(); break;
        case 'dispatches': renderDispatches(); break;
        case 'returns': renderReturns(); break;
        case 'settlements': renderSettlements(); break;
    }
    lucide.createIcons();
}

// -------------------------------------------------------------------
// 5. VIEW: DASHBOARD
// -------------------------------------------------------------------
function renderDashboard() {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;
    const curDay = today.getDate();
    const dateTodayStr = `${curYear}-${String(curMonth).padStart(2, '0')}-${String(curDay).padStart(2, '0')}`;

    const activeWorkers = APP_DATA.workers.filter(w => w.status === 'Active');
    const todayAttendances = APP_DATA.attendances.filter(a => a.date === dateTodayStr);

    const presentToday = todayAttendances.filter(a => a.status === 'Present' || a.status === 'Paid Leave').length;
    const halfDayToday = todayAttendances.filter(a => a.status === 'Half Day').length;
    const absentToday = todayAttendances.filter(a => a.status === 'Absent').length;

    const totalPendingAdv = activeWorkers.reduce((sum, w) => sum + getWorkerPendingAdvances(w.id), 0);

    // Fuel metrics
    const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
    const prevYear = curMonth === 1 ? curYear - 1 : curYear;

    const curMonthFuel = APP_DATA.fuel_expenses
        .filter(f => {
            const [y, m] = f.date.split('-').map(Number);
            return y === curYear && m === curMonth;
        })
        .reduce((sum, f) => sum + (Number(f.amount_spent) || 0), 0);

    const prevMonthFuel = APP_DATA.fuel_expenses
        .filter(f => {
            const [y, m] = f.date.split('-').map(Number);
            return y === prevYear && m === prevMonth;
        })
        .reduce((sum, f) => sum + (Number(f.amount_spent) || 0), 0);

    let fuelDiffPct = 0;
    if (prevMonthFuel > 0) {
        fuelDiffPct = (((curMonthFuel - prevMonthFuel) / prevMonthFuel) * 100).toFixed(1);
    }

    const todayDispatches = APP_DATA.dispatch_beats.filter(b => b.dispatch_date === dateTodayStr);
    const activeBeats = todayDispatches.filter(b => b.status === 'Dispatched').length;

    const pendingClaims = APP_DATA.damaged_returns.filter(r => r.claim_status === 'Pending Inspection' || r.claim_status === 'Submitted to Depot');
    const pendingClaimsVal = pendingClaims.reduce((sum, r) => sum + (Number(r.credit_note_amount) || 0), 0);

    const recentDispatches = [...APP_DATA.dispatch_beats].reverse().slice(0, 4);
    const recentAdvances = [...APP_DATA.advances].reverse().slice(0, 4);

    const html = `
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold mb-2">
                        <span class="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                        Live Distribution Depot Operations
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black tracking-tight">Anupama Agencies</h2>
                    <p class="text-slate-300 text-sm mt-1 max-w-2xl">
                        Authorized FMCG Consignee & Distributor for <strong>Everest Spices</strong> & <strong>Colgate-Palmolive</strong>. Godown staff attendance, delivery vans, fuel expenses, and khata ledger.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <button onclick="switchView('attendance')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all shadow-md">
                        <i data-lucide="clipboard-check" class="w-4 h-4 text-emerald-600"></i>
                        Mark Attendance
                    </button>
                    <button onclick="openModal('add-advance-modal')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-md">
                        <i data-lucide="wallet" class="w-4 h-4 text-amber-400"></i>
                        Issue Advance
                    </button>
                </div>
            </div>
        </div>

        <!-- 4 KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs card-hover">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Staff Attendance Today</span>
                    <span class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i data-lucide="user-check" class="w-5 h-5"></i>
                    </span>
                </div>
                <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-slate-900">${presentToday}</span>
                    <span class="text-sm font-semibold text-slate-400">/ ${activeWorkers.length} Active</span>
                </div>
                <div class="mt-3">
                    <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div class="bg-emerald-500 h-2" style="width: ${activeWorkers.length ? (presentToday / activeWorkers.length) * 100 : 0}%"></div>
                    </div>
                    <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Absent: <strong class="text-rose-600">${absentToday}</strong></span>
                        <span>Half Day: <strong class="text-amber-600">${halfDayToday}</strong></span>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs card-hover">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Advance Pending Khata</span>
                    <span class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <i data-lucide="wallet-cards" class="w-5 h-5"></i>
                    </span>
                </div>
                <div class="mt-3">
                    <span class="text-3xl font-extrabold text-amber-600">${formatINR(totalPendingAdv)}</span>
                </div>
                <div class="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                    <i data-lucide="shield-alert" class="w-4 h-4 text-amber-500"></i>
                    <span>Recoverable from monthly payroll</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs card-hover">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Fuel Cost This Month</span>
                    <span class="w-9 h-9 rounded-xl bg-blue-50 text-colgate flex items-center justify-center">
                        <i data-lucide="fuel" class="w-5 h-5"></i>
                    </span>
                </div>
                <div class="mt-3">
                    <span class="text-3xl font-extrabold text-slate-900">${formatINR(curMonthFuel)}</span>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Last month: <strong>${formatINR(prevMonthFuel)}</strong></span>
                    ${Number(fuelDiffPct) > 0 ? `<span class="text-rose-600 font-bold">+${fuelDiffPct}%</span>` : `<span class="text-emerald-600 font-bold">${fuelDiffPct}%</span>`}
                </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs card-hover">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Active Delivery Beats</span>
                    <span class="w-9 h-9 rounded-xl bg-red-50 text-everest flex items-center justify-center">
                        <i data-lucide="truck" class="w-5 h-5"></i>
                    </span>
                </div>
                <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-slate-900">${activeBeats}</span>
                    <span class="text-xs font-semibold text-slate-400">Routes on Field</span>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Pending Claims: <strong class="text-everest">${pendingClaims.length}</strong></span>
                    <span>Val: <strong>${formatINR(pendingClaimsVal)}</strong></span>
                </div>
            </div>
        </div>

        <!-- Quick Operation Shortcuts Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button onclick="switchView('attendance')" class="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex flex-col items-center text-center gap-2 group">
                <span class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="check-square" class="w-5 h-5"></i>
                </span>
                <span class="text-xs font-bold text-slate-800">Daily Attendance</span>
            </button>
            <button onclick="switchView('advances')" class="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all flex flex-col items-center text-center gap-2 group">
                <span class="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="banknote" class="w-5 h-5"></i>
                </span>
                <span class="text-xs font-bold text-slate-800">Khata Ledger</span>
            </button>
            <button onclick="switchView('fuel')" class="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center text-center gap-2 group">
                <span class="w-10 h-10 rounded-lg bg-blue-100 text-colgate flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="fuel" class="w-5 h-5"></i>
                </span>
                <span class="text-xs font-bold text-slate-800">Log Fuel Fill</span>
            </button>
            <button onclick="switchView('dispatches')" class="p-4 bg-white rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/40 transition-all flex flex-col items-center text-center gap-2 group">
                <span class="w-10 h-10 rounded-lg bg-red-100 text-everest flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="truck" class="w-5 h-5"></i>
                </span>
                <span class="text-xs font-bold text-slate-800">Dispatch Beat</span>
            </button>
            <button onclick="switchView('returns')" class="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex flex-col items-center text-center gap-2 group">
                <span class="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="package-x" class="w-5 h-5"></i>
                </span>
                <span class="text-xs font-bold text-slate-800">Damage Returns</span>
            </button>
            <button onclick="switchView('settlements')" class="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex flex-col items-center text-center gap-2 group">
                <span class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="calculator" class="w-5 h-5"></i>
                </span>
                <span class="text-xs font-bold text-slate-800">Monthly Payout</span>
            </button>
        </div>

        <!-- Charts & Activity Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-sm font-bold text-slate-900">Vehicle Fleet Fuel Expense Trend</h3>
                        <p class="text-xs text-slate-500">Monthly diesel, petrol, and CNG consumption (₹)</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-colgate">Last 6 Months</span>
                </div>
                <div class="h-64 relative">
                    <canvas id="fuelTrendChartCanvas"></canvas>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900">Today's Attendance</h3>
                            <p class="text-xs text-slate-500">${formatDateDisplay(dateTodayStr)}</p>
                        </div>
                        <button onclick="switchView('attendance')" class="text-xs font-semibold text-colgate hover:underline">Update</button>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                            <span class="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-emerald-500"></span> Present (Full)
                            </span>
                            <span class="text-sm font-bold text-emerald-700">${presentToday}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                            <span class="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-amber-500"></span> Half Day (0.5)
                            </span>
                            <span class="text-sm font-bold text-amber-700">${halfDayToday}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                            <span class="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-rose-500"></span> Absent
                            </span>
                            <span class="text-sm font-bold text-rose-700">${absentToday}</span>
                        </div>
                    </div>
                </div>

                <div class="pt-4 mt-2">
                    <button onclick="switchView('attendance')" class="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                        Open Bulk Attendance Sheet
                    </button>
                </div>
            </div>
        </div>

        <!-- Recent Dispatches & Advances -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-everest"></span>
                        <h3 class="text-sm font-bold text-slate-900">Recent Beat Dispatches</h3>
                    </div>
                    <button onclick="switchView('dispatches')" class="text-xs font-semibold text-colgate hover:underline">View All</button>
                </div>
                <div class="divide-y divide-slate-100">
                    ${recentDispatches.length ? recentDispatches.map(beat => {
                        const veh = APP_DATA.vehicles.find(v => v.id === beat.vehicle_id) || { vehicle_number: 'N/A' };
                        const drv = APP_DATA.workers.find(w => w.id === beat.driver_id) || { name: 'Unassigned' };
                        return `
                            <div class="py-3 flex items-center justify-between gap-3">
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center gap-2">
                                        <h4 class="text-xs font-bold text-slate-900 truncate">${beat.beat_name}</h4>
                                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${beat.status === 'Dispatched' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                                            ${beat.status}
                                        </span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 mt-0.5">${formatDateDisplay(beat.dispatch_date)} • Driver: ${drv.name} • ${veh.vehicle_number}</p>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <span class="inline-block px-2 py-1 rounded bg-red-50 text-everest text-xs font-bold">${beat.crates_everest} Crates</span>
                                    <span class="inline-block px-2 py-1 rounded bg-blue-50 text-colgate text-xs font-bold ml-1">${beat.cartons_colgate} Cts</span>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p class="text-xs text-slate-400 py-4 text-center">No dispatches logged</p>'}
                </div>
            </div>

            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <h3 class="text-sm font-bold text-slate-900">Recent Advances Issued</h3>
                    </div>
                    <button onclick="switchView('advances')" class="text-xs font-semibold text-colgate hover:underline">Khata Register</button>
                </div>
                <div class="divide-y divide-slate-100">
                    ${recentAdvances.length ? recentAdvances.map(adv => {
                        const wrk = APP_DATA.workers.find(w => w.id === adv.worker_id) || { name: 'Unknown' };
                        return `
                            <div class="py-3 flex items-center justify-between gap-3">
                                <div class="min-w-0 flex-1">
                                    <h4 class="text-xs font-bold text-slate-900">${wrk.name}</h4>
                                    <p class="text-[11px] text-slate-500">${formatDateDisplay(adv.payment_date)} • ${adv.payment_mode} • ${adv.reason || 'Personal'}</p>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <span class="text-xs font-black text-slate-900 block">${formatINR(adv.amount_paid)}</span>
                                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${adv.status === 'Approved' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${adv.status}</span>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p class="text-xs text-slate-400 py-4 text-center">No advances logged</p>'}
                </div>
            </div>
        </div>
    `;

    document.getElementById('view-dashboard').innerHTML = html;

    // Render Fuel Trend Chart
    setTimeout(() => {
        const canvas = document.getElementById('fuelTrendChartCanvas');
        if (canvas) {
            if (currentFuelChart) currentFuelChart.destroy();

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const labels = [];
            const dataVals = [];

            for (let i = 5; i >= 0; i--) {
                const d = new Date(curYear, curMonth - 1 - i, 1);
                const y = d.getFullYear();
                const m = d.getMonth() + 1;
                labels.push(`${monthNames[m - 1]} ${y}`);

                const spent = APP_DATA.fuel_expenses
                    .filter(f => {
                        const [fy, fm] = f.date.split('-').map(Number);
                        return fy === y && fm === m;
                    })
                    .reduce((sum, f) => sum + (Number(f.amount_spent) || 0), 0);

                dataVals.push(spent);
            }

            currentFuelChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Fuel Expense (₹)',
                        data: dataVals,
                        borderColor: '#004B87',
                        backgroundColor: 'rgba(0, 75, 135, 0.08)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#C41E3A',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: val => '₹' + val.toLocaleString('en-IN'),
                                font: { size: 10 }
                            },
                            grid: { color: '#F1F5F9' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 10 } }
                        }
                    }
                }
            });
        }
    }, 100);
}

// -------------------------------------------------------------------
// 6. VIEW: WORKERS MANAGEMENT & PROFILES
// -------------------------------------------------------------------
let workerSearchQuery = '';
let workerRoleFilter = '';
let workerStatusFilter = 'Active';

function renderWorkers() {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;

    let filtered = APP_DATA.workers.filter(w => {
        if (workerStatusFilter !== 'All' && w.status !== workerStatusFilter) return false;
        if (workerRoleFilter && w.role !== workerRoleFilter) return false;
        if (workerSearchQuery) {
            const q = workerSearchQuery.toLowerCase();
            return w.name.toLowerCase().includes(q) || w.phone.includes(q) || w.role.toLowerCase().includes(q);
        }
        return true;
    });

    const roles = Array.from(new Set(APP_DATA.workers.map(w => w.role)));

    const html = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Godown Workers & Staff Directory</h2>
                <p class="text-xs text-slate-500">Manage loaders, delivery van drivers, godown helpers, and supervisors</p>
            </div>
            <button onclick="openAddWorkerModal()" class="inline-flex items-center gap-2 px-4 py-2.5 bg-colgate hover:bg-colgate-dark text-white text-xs font-bold rounded-xl shadow-sm transition-colors self-start">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                <span>Add New Godown Worker</span>
            </button>
        </div>

        <!-- Filter Bar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-5 relative">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"></i>
                    <input type="text" value="${workerSearchQuery}" oninput="workerSearchQuery = this.value; renderWorkers();" placeholder="Search by name, phone, or role..." class="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                </div>
                <div class="sm:col-span-4">
                    <select onchange="workerRoleFilter = this.value; renderWorkers();" class="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        <option value="">All Staff Roles</option>
                        ${roles.map(r => `<option value="${r}" ${workerRoleFilter === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div class="sm:col-span-3">
                    <select onchange="workerStatusFilter = this.value; renderWorkers();" class="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        <option value="Active" ${workerStatusFilter === 'Active' ? 'selected' : ''}>Active Staff Only</option>
                        <option value="Inactive" ${workerStatusFilter === 'Inactive' ? 'selected' : ''}>Inactive Staff</option>
                        <option value="All" ${workerStatusFilter === 'All' ? 'selected' : ''}>All Workers</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Worker Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${filtered.length ? filtered.map(w => {
                const attSum = getWorkerAttendanceSummary(w.id, curYear, curMonth);
                const pendingAdv = getWorkerPendingAdvances(w.id);

                return `
                    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 card-hover flex flex-col justify-between">
                        <div>
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    ${w.photo_path 
                                        ? `<img src="${w.photo_path}" alt="${w.name}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 cursor-pointer shadow-xs" onclick="previewImage('${w.photo_path}', '${w.name}')">`
                                        : `<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">${w.name.slice(0, 2).toUpperCase()}</div>`
                                    }
                                    <div>
                                        <h3 class="text-sm font-bold text-slate-900 leading-tight">
                                            <button onclick="openWorkerProfileModal(${w.id})" class="hover:text-colgate text-left font-bold">${w.name}</button>
                                        </h3>
                                        <span class="inline-block mt-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                            ${w.role}
                                        </span>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${w.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                                    ${w.status}
                                </span>
                            </div>

                            <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-400">Mobile:</span>
                                    <span class="font-medium text-slate-800">${w.phone}</span>
                                </div>
                                ${w.emergency_contact ? `
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-400">Emergency:</span>
                                        <span class="font-medium text-slate-800">${w.emergency_contact}</span>
                                    </div>
                                ` : ''}
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-400">Daily Wage:</span>
                                    <span class="font-bold text-slate-900">${formatINR(w.daily_wage)} / day</span>
                                </div>
                            </div>

                            <div class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <span class="text-[10px] uppercase font-bold text-slate-400 block">Days This Month</span>
                                    <span class="text-base font-extrabold text-slate-900">${attSum.effective_days} days</span>
                                </div>
                                <div>
                                    <span class="text-[10px] uppercase font-bold text-slate-400 block">Pending Advance</span>
                                    <span class="text-base font-extrabold ${pendingAdv > 0 ? 'text-amber-600' : 'text-emerald-600'}">
                                        ${formatINR(pendingAdv)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5">
                                <a href="tel:${w.phone}" class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors" title="Call Worker">
                                    <i data-lucide="phone" class="w-4 h-4"></i>
                                </a>
                                <a href="https://wa.me/91${w.phone.replace(/[^0-9]/g, '')}" target="_blank" class="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors" title="WhatsApp Chat">
                                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                                </a>
                            </div>

                            <button onclick="openWorkerProfileModal(${w.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-colgate text-white text-xs font-bold rounded-lg transition-colors">
                                <span>Profile & Khata</span>
                                <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('') : `
                <div class="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center">
                    <i data-lucide="users" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                    <h3 class="text-sm font-bold text-slate-800">No Workers Found</h3>
                    <p class="text-xs text-slate-500 mt-1">Try changing your search keywords or add a new worker.</p>
                </div>
            `}
        </div>

        <!-- Add Worker Modal Container -->
        <div id="add-worker-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-lg bg-colgate/10 text-colgate flex items-center justify-center">
                            <i data-lucide="user-plus" class="w-4 h-4"></i>
                        </span>
                        <h3 class="text-sm font-bold text-slate-900">Add New Godown Worker</h3>
                    </div>
                    <button onclick="closeModal('add-worker-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <form onsubmit="handleSaveWorker(event, null)" class="p-5 space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                        <input type="text" id="add-w-name" required placeholder="e.g., Rameshwar Kumar" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                            <input type="tel" id="add-w-phone" required placeholder="10-digit mobile" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Emergency Phone</label>
                            <input type="tel" id="add-w-emergency" placeholder="Family contact" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Role / Designation *</label>
                            <input type="text" id="add-w-role" required placeholder="e.g., Delivery Van Driver" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Daily Wage (₹) *</label>
                            <input type="number" id="add-w-wage" step="10" value="550" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Date of Joining</label>
                            <input type="date" id="add-w-join" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Profile Photo</label>
                            <input type="file" id="add-w-photo" accept="image/*" class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200">
                        </div>
                    </div>

                    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button type="button" onclick="closeModal('add-worker-modal')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" class="px-5 py-2 bg-colgate hover:bg-colgate-dark text-white text-xs font-bold rounded-xl shadow-sm">Save Worker</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Worker Profile Modal Container -->
        <div id="worker-profile-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div id="worker-profile-modal-content" class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100"></div>
        </div>

        <!-- Edit Worker Modal Container -->
        <div id="edit-worker-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div id="edit-worker-modal-content" class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100"></div>
        </div>
    `;

    document.getElementById('view-workers').innerHTML = html;
}

function openAddWorkerModal() {
    openModal('add-worker-modal');
}

function handleSaveWorker(e, workerId) {
    e.preventDefault();

    if (workerId) {
        // Edit existing worker
        const w = APP_DATA.workers.find(item => item.id === workerId);
        if (!w) return;

        w.name = document.getElementById('edit-w-name').value.trim();
        w.phone = document.getElementById('edit-w-phone').value.trim();
        w.emergency_contact = document.getElementById('edit-w-emergency').value.trim();
        w.role = document.getElementById('edit-w-role').value.trim();
        w.daily_wage = Number(document.getElementById('edit-w-wage').value) || 500;
        w.monthly_salary = w.daily_wage * 26;
        w.status = document.getElementById('edit-w-status').value;

        const photoInput = document.getElementById('edit-w-photo');
        if (photoInput && photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                w.photo_path = evt.target.result;
                StorageManager.save(APP_DATA);
                closeModal('edit-worker-modal');
                renderWorkers();
                openWorkerProfileModal(w.id);
                showToast(`Profile for '${w.name}' permanently saved!`);
            };
            reader.readAsDataURL(photoInput.files[0]);
            return;
        }

        StorageManager.save(APP_DATA);
        closeModal('edit-worker-modal');
        renderWorkers();
        openWorkerProfileModal(w.id);
        showToast(`Profile for '${w.name}' permanently saved!`);
    } else {
        // New worker
        const name = document.getElementById('add-w-name').value.trim();
        const phone = document.getElementById('add-w-phone').value.trim();
        const emergency = document.getElementById('add-w-emergency').value.trim();
        const role = document.getElementById('add-w-role').value.trim();
        const daily_wage = Number(document.getElementById('add-w-wage').value) || 500;
        const join_date = document.getElementById('add-w-join').value || new Date().toISOString().split('T')[0];

        const newId = APP_DATA.workers.length ? Math.max(...APP_DATA.workers.map(w => w.id)) + 1 : 1;

        const newWorker = {
            id: newId,
            name,
            phone,
            emergency_contact: emergency,
            role,
            daily_wage,
            monthly_salary: daily_wage * 26,
            status: "Active",
            join_date,
            photo_path: ""
        };

        const photoInput = document.getElementById('add-w-photo');
        if (photoInput && photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                newWorker.photo_path = evt.target.result;
                APP_DATA.workers.push(newWorker);
                StorageManager.save(APP_DATA);
                closeModal('add-worker-modal');
                renderWorkers();
                showToast(`New worker '${name}' added permanently!`);
            };
            reader.readAsDataURL(photoInput.files[0]);
            return;
        }

        APP_DATA.workers.push(newWorker);
        StorageManager.save(APP_DATA);
        closeModal('add-worker-modal');
        renderWorkers();
        showToast(`New worker '${name}' added permanently!`);
    }
}

function openWorkerProfileModal(workerId) {
    const w = APP_DATA.workers.find(item => item.id === workerId);
    if (!w) return;

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;

    const attSum = getWorkerAttendanceSummary(w.id, curYear, curMonth);
    const pendingAdv = getWorkerPendingAdvances(w.id);
    const earnedGross = attSum.effective_days * w.daily_wage;
    const estNet = Math.max(0, earnedGross - pendingAdv);

    const workerAdvances = APP_DATA.advances.filter(a => a.worker_id === w.id);

    const modalContent = document.getElementById('worker-profile-modal-content');
    modalContent.innerHTML = `
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-4">
                ${w.photo_path 
                    ? `<img src="${w.photo_path}" alt="${w.name}" class="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md">`
                    : `<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">${w.name.slice(0, 2).toUpperCase()}</div>`
                }
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-lg font-bold text-slate-900">${w.name}</h3>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${w.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">${w.status}</span>
                    </div>
                    <p class="text-xs text-colgate font-semibold mt-0.5">${w.role} • Joined ${formatDateDisplay(w.join_date)}</p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <button onclick="openEditWorkerModal(${w.id})" class="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold" title="Edit Profile">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                </button>
                <button onclick="closeModal('worker-profile-modal')" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
        </div>

        <div class="p-6 space-y-6 text-xs">
            <!-- Monthly Metric Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block">Days This Month</span>
                    <span class="text-lg font-extrabold text-slate-900 mt-0.5 block">${attSum.effective_days} days</span>
                    <span class="text-[10px] text-slate-500">P: ${attSum.present} | H: ${attSum.half_day}</span>
                </div>
                <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                    <span class="text-[10px] uppercase font-bold text-emerald-700 block">Gross Earned</span>
                    <span class="text-lg font-extrabold text-emerald-800 mt-0.5 block">${formatINR(earnedGross)}</span>
                    <span class="text-[10px] text-emerald-600">${attSum.effective_days} × ${formatINR(w.daily_wage)}</span>
                </div>
                <div class="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                    <span class="text-[10px] uppercase font-bold text-amber-700 block">Pending Advance</span>
                    <span class="text-lg font-extrabold text-amber-800 mt-0.5 block">${formatINR(pendingAdv)}</span>
                    <span class="text-[10px] text-amber-600">Pending recovery</span>
                </div>
                <div class="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                    <span class="text-[10px] uppercase font-bold text-colgate block">Estimated Net Payout</span>
                    <span class="text-lg font-extrabold text-colgate mt-0.5 block">${formatINR(estNet)}</span>
                    <span class="text-[10px] text-blue-600">Gross - Advances</span>
                </div>
            </div>

            <!-- Khata Ledger Table -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
                <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span class="font-bold text-slate-800">Khata Advance Ledger (${workerAdvances.length})</span>
                    <button onclick="closeModal('worker-profile-modal'); openModal('add-advance-modal');" class="text-colgate font-bold hover:underline">+ New Advance</button>
                </div>
                <div class="max-h-48 overflow-y-auto">
                    ${workerAdvances.length ? `
                        <table class="w-full text-left text-[11px]">
                            <thead class="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                                <tr>
                                    <th class="p-2.5">Date</th>
                                    <th class="p-2.5">Amount</th>
                                    <th class="p-2.5">Mode</th>
                                    <th class="p-2.5">Reason</th>
                                    <th class="p-2.5">Status</th>
                                    <th class="p-2.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${workerAdvances.map(a => `
                                    <tr>
                                        <td class="p-2.5">${formatDateDisplay(a.payment_date)}</td>
                                        <td class="p-2.5 font-bold text-slate-900">${formatINR(a.amount_paid)}</td>
                                        <td class="p-2.5">${a.payment_mode}</td>
                                        <td class="p-2.5 max-w-[120px] truncate">${a.reason || 'Personal'}</td>
                                        <td class="p-2.5">
                                            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${a.status === 'Approved' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${a.status}</span>
                                        </td>
                                        <td class="p-2.5 text-right">
                                            ${a.status === 'Approved' ? `
                                                <button onclick="toggleAdvanceStatus(${a.id}, 'Settled')" class="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px]">Settle</button>
                                            ` : `<span class="text-slate-400">Settled</span>`}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p class="text-center py-6 text-slate-400 text-xs">No advances issued to this worker</p>'}
                </div>
            </div>

            <div class="pt-2 flex items-center justify-between border-t border-slate-100">
                <button onclick="confirmDeleteWorker(${w.id})" class="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                    <span>Delete Worker</span>
                </button>
                <button onclick="closeModal('worker-profile-modal')" class="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">Close</button>
            </div>
        </div>
    `;

    openModal('worker-profile-modal');
}

function openEditWorkerModal(workerId) {
    const w = APP_DATA.workers.find(item => item.id === workerId);
    if (!w) return;

    closeModal('worker-profile-modal');

    const modalContent = document.getElementById('edit-worker-modal-content');
    modalContent.innerHTML = `
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="text-sm font-bold text-slate-900">Edit Worker Profile: ${w.name}</h3>
            <button onclick="closeModal('edit-worker-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>

        <form onsubmit="handleSaveWorker(event, ${w.id})" class="p-5 space-y-4 text-xs">
            <div>
                <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input type="text" id="edit-w-name" value="${w.name}" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                    <input type="tel" id="edit-w-phone" value="${w.phone}" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Emergency Phone</label>
                    <input type="tel" id="edit-w-emergency" value="${w.emergency_contact || ''}" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                    <input type="text" id="edit-w-role" value="${w.role}" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Daily Wage (₹) *</label>
                    <input type="number" id="edit-w-wage" step="10" value="${w.daily_wage}" required class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Status *</label>
                    <select id="edit-w-status" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        <option value="Active" ${w.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${w.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Update Photo</label>
                    <input type="file" id="edit-w-photo" accept="image/*" class="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200">
                </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onclick="closeModal('edit-worker-modal')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" class="px-5 py-2 bg-colgate hover:bg-colgate-dark text-white text-xs font-bold rounded-xl shadow-sm">Save Permanent Changes</button>
            </div>
        </form>
    `;

    openModal('edit-worker-modal');
}

function confirmDeleteWorker(workerId) {
    const w = APP_DATA.workers.find(item => item.id === workerId);
    if (!w) return;

    if (confirm(`Are you sure you want to delete worker '${w.name}'? This will permanently remove their records.`)) {
        APP_DATA.workers = APP_DATA.workers.filter(item => item.id !== workerId);
        APP_DATA.attendances = APP_DATA.attendances.filter(a => a.worker_id !== workerId);
        APP_DATA.advances = APP_DATA.advances.filter(a => a.worker_id !== workerId);
        StorageManager.save(APP_DATA);
        closeModal('worker-profile-modal');
        renderWorkers();
        showToast(`Worker '${w.name}' deleted.`);
    }
}

// -------------------------------------------------------------------
// 7. VIEW: DAILY ATTENDANCE REGISTER
// -------------------------------------------------------------------
let attendanceTargetDate = new Date().toISOString().split('T')[0];

function renderAttendance() {
    const activeWorkers = APP_DATA.workers.filter(w => w.status === 'Active');
    const existingRecs = APP_DATA.attendances.filter(a => a.date === attendanceTargetDate);
    const attMap = {};
    existingRecs.forEach(r => attMap[r.worker_id] = r);

    const html = `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-3">
                <label class="text-xs font-bold text-slate-700">Attendance Date:</label>
                <input type="date" value="${attendanceTargetDate}" onchange="attendanceTargetDate = this.value; renderAttendance();" class="text-xs font-bold py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                <button onclick="attendanceTargetDate = new Date().toISOString().split('T')[0]; renderAttendance();" class="text-xs font-semibold text-colgate px-2.5 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100">
                    Today
                </button>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="setBulkAttendance('Present')" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs">
                    <i data-lucide="check-check" class="w-4 h-4"></i>
                    <span>Mark All Present</span>
                </button>
                <button type="button" onclick="setBulkAttendance('Paid Leave')" class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
                    <i data-lucide="sun" class="w-4 h-4 text-blue-600"></i>
                    <span>Mark All Holiday</span>
                </button>
                <button type="button" onclick="switchView('monthly-attendance')" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs">
                    <i data-lucide="calendar" class="w-4 h-4"></i>
                    <span>Monthly View</span>
                </button>
            </div>
        </div>

        <form onsubmit="handleSaveAttendance(event)" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>ACTIVE GODOWN WORKERS (${activeWorkers.length})</span>
                <span class="text-slate-700 font-bold">${formatDateDisplay(attendanceTargetDate)}</span>
            </div>

            <div class="divide-y divide-slate-100">
                ${activeWorkers.map(w => {
                    const rec = attMap[w.id] || { status: 'Present', notes: '' };
                    return `
                        <div class="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                            <div class="flex items-center gap-3.5 min-w-[240px]">
                                ${w.photo_path 
                                    ? `<img src="${w.photo_path}" alt="${w.name}" class="w-11 h-11 rounded-xl object-cover border border-slate-200">`
                                    : `<div class="w-11 h-11 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm">${w.name.slice(0, 2).toUpperCase()}</div>`
                                }
                                <div>
                                    <h4 class="text-sm font-bold text-slate-900">${w.name}</h4>
                                    <p class="text-xs text-slate-500">${w.role} • <span class="font-semibold text-slate-700">${formatINR(w.daily_wage)}/day</span></p>
                                </div>
                            </div>

                            <div class="flex flex-wrap items-center gap-2">
                                <label class="cursor-pointer">
                                    <input type="radio" name="att_status_${w.id}" value="Present" class="peer sr-only" ${rec.status === 'Present' ? 'checked' : ''}>
                                    <div class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600 transition-all flex items-center gap-1.5 shadow-xs">
                                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                                        <span>Present (Full)</span>
                                    </div>
                                </label>
                                <label class="cursor-pointer">
                                    <input type="radio" name="att_status_${w.id}" value="Half Day" class="peer sr-only" ${rec.status === 'Half Day' ? 'checked' : ''}>
                                    <div class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500 transition-all flex items-center gap-1.5 shadow-xs">
                                        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                                        <span>Half Day (0.5)</span>
                                    </div>
                                </label>
                                <label class="cursor-pointer">
                                    <input type="radio" name="att_status_${w.id}" value="Absent" class="peer sr-only" ${rec.status === 'Absent' ? 'checked' : ''}>
                                    <div class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 peer-checked:bg-rose-600 peer-checked:text-white peer-checked:border-rose-600 transition-all flex items-center gap-1.5 shadow-xs">
                                        <i data-lucide="x" class="w-3.5 h-3.5"></i>
                                        <span>Absent</span>
                                    </div>
                                </label>
                                <label class="cursor-pointer">
                                    <input type="radio" name="att_status_${w.id}" value="Paid Leave" class="peer sr-only" ${rec.status === 'Paid Leave' ? 'checked' : ''}>
                                    <div class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all flex items-center gap-1.5 shadow-xs">
                                        <i data-lucide="sun" class="w-3.5 h-3.5"></i>
                                        <span>Paid Leave</span>
                                    </div>
                                </label>
                            </div>

                            <div class="lg:w-48">
                                <input type="text" id="att_notes_${w.id}" value="${rec.notes || ''}" placeholder="Notes (overtime, late...)" class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-colgate outline-none">
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="text-xs text-slate-500">
                    <i data-lucide="info" class="w-4 h-4 inline mr-1 text-slate-400"></i>
                    Changes persist automatically and feed into the monthly wage settlement calculator.
                </div>
                <button type="submit" class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-everest hover:bg-everest-dark text-white text-xs font-extrabold rounded-xl shadow-md transition-all">
                    <i data-lucide="save" class="w-4 h-4"></i>
                    <span>Save Daily Attendance Sheet</span>
                </button>
            </div>
        </form>
    `;

    document.getElementById('view-attendance').innerHTML = html;
}

function setBulkAttendance(status) {
    const radios = document.querySelectorAll(`input[type="radio"][value="${status}"]`);
    radios.forEach(r => r.checked = true);
    showToast(`All workers selected as '${status}'`);
}

function handleSaveAttendance(e) {
    e.preventDefault();
    const activeWorkers = APP_DATA.workers.filter(w => w.status === 'Active');

    activeWorkers.forEach(w => {
        const checked = document.querySelector(`input[name="att_status_${w.id}"]:checked`);
        const status = checked ? checked.value : 'Present';
        const notesInput = document.getElementById(`att_notes_${w.id}`);
        const notes = notesInput ? notesInput.value.trim() : '';

        // Check if existing attendance record exists for worker on this date
        const existingIdx = APP_DATA.attendances.findIndex(a => a.worker_id === w.id && a.date === attendanceTargetDate);
        if (existingIdx !== -1) {
            APP_DATA.attendances[existingIdx].status = status;
            APP_DATA.attendances[existingIdx].notes = notes;
        } else {
            const newId = APP_DATA.attendances.length ? Math.max(...APP_DATA.attendances.map(a => a.id)) + 1 : 1;
            APP_DATA.attendances.push({
                id: newId,
                worker_id: w.id,
                date: attendanceTargetDate,
                status,
                notes
            });
        }
    });

    StorageManager.save(APP_DATA);
    showToast(`Attendance for ${formatDateDisplay(attendanceTargetDate)} saved permanently!`);
}

// -------------------------------------------------------------------
// 8. VIEW: MONTHLY ATTENDANCE REGISTER (MUSTER ROLL)
// -------------------------------------------------------------------
let monthlyAttYear = new Date().getFullYear();
let monthlyAttMonth = new Date().getMonth() + 1;

function renderMonthlyAttendance() {
    const activeWorkers = APP_DATA.workers.filter(w => w.status === 'Active');
    const daysInMonth = new Date(monthlyAttYear, monthlyAttMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const html = `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 class="text-base font-bold text-slate-900">Monthly Muster Roll & Attendance Grid</h2>
                <p class="text-xs text-slate-500">Day-wise attendance tracking for calculating working days and monthly wages</p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
                <select onchange="monthlyAttMonth = Number(this.value); renderMonthlyAttendance();" class="text-xs font-bold py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    ${monthNames.map((name, idx) => `<option value="${idx + 1}" ${monthlyAttMonth === idx + 1 ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
                <select onchange="monthlyAttYear = Number(this.value); renderMonthlyAttendance();" class="text-xs font-bold py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    ${[monthlyAttYear - 1, monthlyAttYear, monthlyAttYear + 1].map(y => `<option value="${y}" ${monthlyAttYear === y ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
                <button onclick="exportAttendanceCSV()" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    <span>Export CSV</span>
                </button>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span class="inline-flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">P</span>
                <span>Present (1.0)</span>
            </span>
            <span class="inline-flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">H</span>
                <span>Half Day (0.5)</span>
            </span>
            <span class="inline-flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[10px]">A</span>
                <span>Absent (0.0)</span>
            </span>
            <span class="inline-flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">L</span>
                <span>Paid Leave (1.0)</span>
            </span>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-900 text-white">
                        <tr>
                            <th class="py-3 px-3 font-bold sticky left-0 bg-slate-900 z-10 min-w-[160px]">Worker Name</th>
                            <th class="py-3 px-2 font-bold min-w-[120px]">Role</th>
                            ${days.map(d => {
                                const dt = new Date(monthlyAttYear, monthlyAttMonth - 1, d);
                                const isSun = dt.getDay() === 0;
                                return `<th class="py-2 px-1 text-center font-bold text-[11px] min-w-[28px] ${isSun ? 'bg-slate-800 text-amber-400' : ''}">${d}</th>`;
                            }).join('')}
                            <th class="py-3 px-3 text-center font-bold bg-slate-800 text-white min-w-[80px]">Total Eff.</th>
                            <th class="py-3 px-3 text-center font-bold bg-slate-800 text-white min-w-[70px]">%</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${activeWorkers.map(w => {
                            const sum = getWorkerAttendanceSummary(w.id, monthlyAttYear, monthlyAttMonth);
                            const recMap = {};
                            sum.records.forEach(r => {
                                const dayNum = Number(r.date.split('-')[2]);
                                recMap[dayNum] = r.status;
                            });

                            return `
                                <tr class="hover:bg-slate-50/70">
                                    <td class="py-3 px-3 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-xs">
                                        <button onclick="openWorkerProfileModal(${w.id})" class="hover:text-colgate font-bold text-left">${w.name}</button>
                                    </td>
                                    <td class="py-3 px-2 text-slate-500 font-medium text-[11px] truncate max-w-[130px]">${w.role}</td>
                                    ${days.map(d => {
                                        const st = recMap[d];
                                        if (st === 'Present') return `<td class="py-2 px-1 text-center"><span class="inline-block w-6 h-6 rounded leading-6 text-center font-bold text-[10px] bg-emerald-100 text-emerald-800">P</span></td>`;
                                        if (st === 'Half Day') return `<td class="py-2 px-1 text-center"><span class="inline-block w-6 h-6 rounded leading-6 text-center font-bold text-[10px] bg-amber-100 text-amber-800">H</span></td>`;
                                        if (st === 'Absent') return `<td class="py-2 px-1 text-center"><span class="inline-block w-6 h-6 rounded leading-6 text-center font-bold text-[10px] bg-rose-100 text-rose-800">A</span></td>`;
                                        if (st === 'Paid Leave') return `<td class="py-2 px-1 text-center"><span class="inline-block w-6 h-6 rounded leading-6 text-center font-bold text-[10px] bg-blue-100 text-blue-800">L</span></td>`;
                                        return `<td class="py-2 px-1 text-center text-slate-300">-</td>`;
                                    }).join('')}
                                    <td class="py-3 px-3 text-center font-extrabold text-slate-900 bg-slate-50 border-l border-slate-100">${sum.effective_days}</td>
                                    <td class="py-3 px-3 text-center font-bold ${sum.attendance_pct >= 85 ? 'text-emerald-700' : sum.attendance_pct >= 60 ? 'text-amber-600' : 'text-rose-600'} bg-slate-50">${sum.attendance_pct}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('view-monthly-attendance').innerHTML = html;
}

// -------------------------------------------------------------------
// 9. VIEW: ADVANCES KHATA LEDGER
// -------------------------------------------------------------------
let advanceWorkerFilter = '';
let advanceStatusFilter = '';

function renderAdvances() {
    const activeWorkers = APP_DATA.workers.filter(w => w.status === 'Active');

    let filtered = APP_DATA.advances.filter(a => {
        if (advanceWorkerFilter && a.worker_id !== Number(advanceWorkerFilter)) return false;
        if (advanceStatusFilter && a.status !== advanceStatusFilter) return false;
        return true;
    });

    const totalGiven = APP_DATA.advances.reduce((sum, a) => sum + (Number(a.amount_paid) || 0), 0);
    const totalPending = APP_DATA.advances.filter(a => a.status === 'Approved').reduce((sum, a) => sum + (Number(a.amount_paid) || 0), 0);
    const totalSettled = APP_DATA.advances.filter(a => a.status === 'Settled').reduce((sum, a) => sum + (Number(a.amount_paid) || 0), 0);

    const html = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Godown Staff Advance Khata Ledger</h2>
                <p class="text-xs text-slate-500">Track cash advances, UPI transfers, and wage deduction settlements</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="exportAdvancesCSV()" class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors">
                    <i data-lucide="download" class="w-4 h-4 text-emerald-600"></i>
                    <span>Export CSV</span>
                </button>
                <button onclick="openModal('add-advance-modal')" class="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Issue New Advance</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Advances Given</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${formatINR(totalGiven)}</div>
                <span class="text-[11px] text-slate-400 mt-1 block">Cumulative staff payouts</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-700">Outstanding Balance</span>
                <div class="mt-2 text-2xl font-extrabold text-amber-600">${formatINR(totalPending)}</div>
                <span class="text-[11px] text-amber-700 mt-1 block">Pending recovery from upcoming payroll</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Settled / Recovered</span>
                <div class="mt-2 text-2xl font-extrabold text-emerald-700">${formatINR(totalSettled)}</div>
                <span class="text-[11px] text-emerald-700 mt-1 block">Reconciled in salary calculations</span>
            </div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-6">
                    <select onchange="advanceWorkerFilter = this.value; renderAdvances();" class="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        <option value="">All Godown Staff</option>
                        ${activeWorkers.map(w => `<option value="${w.id}" ${advanceWorkerFilter === String(w.id) ? 'selected' : ''}>${w.name} (${w.role})</option>`).join('')}
                    </select>
                </div>
                <div class="sm:col-span-6">
                    <select onchange="advanceStatusFilter = this.value; renderAdvances();" class="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        <option value="">All Statuses</option>
                        <option value="Approved" ${advanceStatusFilter === 'Approved' ? 'selected' : ''}>Approved (Pending Recovery)</option>
                        <option value="Settled" ${advanceStatusFilter === 'Settled' ? 'selected' : ''}>Settled / Deducted</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                            <th class="py-3 px-4">Worker</th>
                            <th class="py-3 px-4">Payment Date</th>
                            <th class="py-3 px-4">Amount</th>
                            <th class="py-3 px-4">Mode</th>
                            <th class="py-3 px-4">Reason / Notes</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                        ${filtered.length ? filtered.map(a => {
                            const wrk = APP_DATA.workers.find(w => w.id === a.worker_id) || { name: 'Unknown', role: '' };
                            return `
                                <tr class="hover:bg-slate-50/60">
                                    <td class="py-3.5 px-4 font-bold text-slate-900">
                                        ${wrk.name}
                                        <span class="block text-[10px] text-slate-400 font-normal">${wrk.role}</span>
                                    </td>
                                    <td class="py-3.5 px-4 whitespace-nowrap">${formatDateDisplay(a.payment_date)}</td>
                                    <td class="py-3.5 px-4 font-extrabold text-slate-900 text-sm whitespace-nowrap">${formatINR(a.amount_paid)}</td>
                                    <td class="py-3.5 px-4 whitespace-nowrap">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${a.payment_mode === 'Cash' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">${a.payment_mode}</span>
                                    </td>
                                    <td class="py-3.5 px-4 max-w-xs truncate">${a.reason || 'Personal expense'}</td>
                                    <td class="py-3.5 px-4 whitespace-nowrap">
                                        <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${a.status === 'Approved' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${a.status}</span>
                                    </td>
                                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                                        ${a.status === 'Approved' ? `
                                            <button onclick="toggleAdvanceStatus(${a.id}, 'Settled')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]">Mark Settled</button>
                                        ` : `
                                            <button onclick="toggleAdvanceStatus(${a.id}, 'Approved')" class="text-slate-400 hover:text-amber-600 font-semibold text-[10px] underline">Reopen</button>
                                        `}
                                    </td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="7" class="p-8 text-center text-slate-400">No advance records found</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Advance Modal -->
        <div id="add-advance-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 class="text-sm font-bold text-slate-900">Issue Cash/UPI Advance</h3>
                    <button onclick="closeModal('add-advance-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">✕</button>
                </div>
                <form onsubmit="handleSaveAdvance(event)" class="p-5 space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Select Worker *</label>
                        <select id="new-adv-worker" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                            ${activeWorkers.map(w => `<option value="${w.id}">${w.name} (${w.role}) - Daily: ₹${w.daily_wage}</option>`).join('')}
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                            <input type="number" id="new-adv-amount" min="50" step="50" required placeholder="e.g. 1500" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Payment Mode *</label>
                            <select id="new-adv-mode" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI (GPay/PhonePe)</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Payment Date *</label>
                        <input type="date" id="new-adv-date" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Reason / Purpose</label>
                        <input type="text" id="new-adv-reason" placeholder="e.g., Medical, home repair, grocery" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button type="button" onclick="closeModal('add-advance-modal')" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm">Save & Issue Advance</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('view-advances').innerHTML = html;
}

function handleSaveAdvance(e) {
    e.preventDefault();
    const worker_id = Number(document.getElementById('new-adv-worker').value);
    const amount = Number(document.getElementById('new-adv-amount').value);
    const payment_mode = document.getElementById('new-adv-mode').value;
    const payment_date = document.getElementById('new-adv-date').value || new Date().toISOString().split('T')[0];
    const reason = document.getElementById('new-adv-reason').value.trim();

    const newId = APP_DATA.advances.length ? Math.max(...APP_DATA.advances.map(a => a.id)) + 1 : 1;

    APP_DATA.advances.push({
        id: newId,
        worker_id,
        request_date: payment_date,
        payment_date,
        amount_requested: amount,
        amount_paid: amount,
        payment_mode,
        reason,
        status: "Approved",
        settlement_id: null
    });

    StorageManager.save(APP_DATA);
    closeModal('add-advance-modal');
    renderAdvances();
    showToast(`Advance payment of ${formatINR(amount)} saved permanently!`);
}

function toggleAdvanceStatus(id, newStatus) {
    const adv = APP_DATA.advances.find(a => a.id === id);
    if (!adv) return;
    adv.status = newStatus;
    StorageManager.save(APP_DATA);
    renderAdvances();
    showToast(`Advance marked as '${newStatus}'`);
}

// -------------------------------------------------------------------
// 10. VIEW: VEHICLE FLEET & FUEL TRACKER
// -------------------------------------------------------------------
let fuelVehicleFilter = '';

function renderFuel() {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;

    let filtered = APP_DATA.fuel_expenses.filter(f => {
        if (fuelVehicleFilter && f.vehicle_id !== Number(fuelVehicleFilter)) return false;
        return true;
    });

    const monthlyExpenses = APP_DATA.fuel_expenses.filter(f => {
        const [y, m] = f.date.split('-').map(Number);
        return y === curYear && m === curMonth;
    });

    const totalMonthSpent = monthlyExpenses.reduce((sum, f) => sum + (Number(f.amount_spent) || 0), 0);
    const totalMonthLiters = monthlyExpenses.reduce((sum, f) => sum + (Number(f.liters) || 0), 0);

    const html = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Delivery Vehicles & Monthly Fuel Expenses</h2>
                <p class="text-xs text-slate-500">Track diesel, petrol, and CNG fills for Everest Spices and Colgate vans</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="openModal('add-vehicle-modal')" class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors">
                    <i data-lucide="truck" class="w-4 h-4 text-colgate"></i>
                    <span>+ Add Vehicle</span>
                </button>
                <button onclick="exportFuelCSV()" class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors">
                    <i data-lucide="download" class="w-4 h-4 text-emerald-600"></i>
                    <span>Export CSV</span>
                </button>
                <button onclick="openModal('add-fuel-modal')" class="inline-flex items-center gap-2 px-4 py-2 bg-colgate hover:bg-colgate-dark text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Log Fuel Fill</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Fuel Cost This Month</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${formatINR(totalMonthSpent)}</div>
                <span class="text-[11px] text-slate-400 mt-1 block">Active month expenditures</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Liters Filled</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${totalMonthLiters.toFixed(1)} Liters</div>
                <span class="text-[11px] text-slate-400 mt-1 block">Active delivery van and auto consumption</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Fleet Units</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${APP_DATA.vehicles.length} Vehicles</div>
                <span class="text-[11px] text-slate-400 mt-1 block">Everest & Colgate distribution fleet</span>
            </div>
        </div>

        <!-- Vehicle Fleet Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${APP_DATA.vehicles.map(v => {
                const drv = APP_DATA.workers.find(w => w.id === v.assigned_driver_id) || { name: 'Unassigned' };
                return `
                    <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                        <div class="min-w-0">
                            <h4 class="text-xs font-bold text-slate-900 truncate">${v.vehicle_name}</h4>
                            <p class="text-[11px] text-slate-500">${v.vehicle_number} • ${v.fuel_type}</p>
                            <span class="text-[10px] text-colgate font-semibold">Driver: ${drv.name}</span>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">${v.status}</span>
                    </div>
                `;
            }).join('')}
        </div>

        <!-- Filter -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <select onchange="fuelVehicleFilter = this.value; renderFuel();" class="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                <option value="">All Vehicles</option>
                ${APP_DATA.vehicles.map(v => `<option value="${v.id}" ${fuelVehicleFilter === String(v.id) ? 'selected' : ''}>${v.vehicle_name} (${v.vehicle_number})</option>`).join('')}
            </select>
        </div>

        <!-- Fuel Expense Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                            <th class="py-3 px-4">Date</th>
                            <th class="py-3 px-4">Vehicle</th>
                            <th class="py-3 px-4">Driver</th>
                            <th class="py-3 px-4">Fuel Type</th>
                            <th class="py-3 px-4">Amount Spent</th>
                            <th class="py-3 px-4">Liters</th>
                            <th class="py-3 px-4">Odometer</th>
                            <th class="py-3 px-4">Slip</th>
                            <th class="py-3 px-4">Notes</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                        ${filtered.length ? filtered.map(f => {
                            const veh = APP_DATA.vehicles.find(v => v.id === f.vehicle_id) || { vehicle_name: 'Unknown', vehicle_number: '' };
                            const drv = APP_DATA.workers.find(w => w.id === f.driver_id) || { name: 'Unassigned' };
                            return `
                                <tr class="hover:bg-slate-50/60">
                                    <td class="py-3 px-4 whitespace-nowrap">${formatDateDisplay(f.date)}</td>
                                    <td class="py-3 px-4 font-bold text-slate-900">
                                        ${veh.vehicle_name}
                                        <span class="block text-[10px] text-slate-400 font-normal">${veh.vehicle_number}</span>
                                    </td>
                                    <td class="py-3 px-4 whitespace-nowrap">${drv.name}</td>
                                    <td class="py-3 px-4 whitespace-nowrap">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${f.fuel_type === 'Diesel' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">${f.fuel_type}</span>
                                    </td>
                                    <td class="py-3 px-4 font-extrabold text-slate-900 text-sm whitespace-nowrap">${formatINR(f.amount_spent)}</td>
                                    <td class="py-3 px-4 whitespace-nowrap">${f.liters} L</td>
                                    <td class="py-3 px-4 whitespace-nowrap font-mono">${f.odometer_reading ? f.odometer_reading + ' KM' : '-'}</td>
                                    <td class="py-3 px-4 whitespace-nowrap">
                                        ${f.receipt_image ? `
                                            <button onclick="previewImage('${f.receipt_image}', 'Receipt Slip: ${veh.vehicle_number}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] inline-flex items-center gap-1">
                                                <i data-lucide="image" class="w-3 h-3 text-colgate"></i> View
                                            </button>
                                        ` : '<span class="text-slate-400">-</span>'}
                                    </td>
                                    <td class="py-3 px-4 max-w-xs truncate text-slate-500">${f.notes || '-'}</td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="9" class="p-8 text-center text-slate-400">No fuel fill entries recorded</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Fuel Fill Modal -->
        <div id="add-fuel-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 class="text-sm font-bold text-slate-900">Log Delivery Vehicle Fuel Fill</h3>
                    <button onclick="closeModal('add-fuel-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">✕</button>
                </div>
                <form onsubmit="handleSaveFuel(event)" class="p-5 space-y-4 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Select Vehicle *</label>
                            <select id="new-fuel-veh" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                ${APP_DATA.vehicles.map(v => `<option value="${v.id}">${v.vehicle_name} (${v.vehicle_number})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Driver In-Charge</label>
                            <select id="new-fuel-drv" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="">Unassigned</option>
                                ${APP_DATA.workers.map(w => `<option value="${w.id}">${w.name} (${w.role})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Fuel Type *</label>
                            <select id="new-fuel-type" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="Diesel">Diesel</option>
                                <option value="Petrol">Petrol</option>
                                <option value="CNG">CNG</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Amount Spent (₹) *</label>
                            <input type="number" id="new-fuel-amount" step="10" required placeholder="e.g. 2500" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Liters Filled</label>
                            <input type="number" id="new-fuel-liters" step="0.1" placeholder="e.g. 28.5" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Date Filled *</label>
                            <input type="date" id="new-fuel-date" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Odometer Reading (KM)</label>
                            <input type="number" id="new-fuel-odometer" placeholder="e.g. 42500" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Receipt / Bill Slip</label>
                            <input type="file" id="new-fuel-receipt" accept="image/*" class="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Petrol Pump Notes</label>
                            <input type="text" id="new-fuel-notes" placeholder="e.g., HP Petrol Pump" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button type="button" onclick="closeModal('add-fuel-modal')" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" class="px-5 py-2 bg-colgate hover:bg-colgate-dark text-white font-bold rounded-xl shadow-sm">Save Fuel Log</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Add Vehicle Modal -->
        <div id="add-vehicle-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 class="text-sm font-bold text-slate-900">Register Delivery Vehicle</h3>
                    <button onclick="closeModal('add-vehicle-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">✕</button>
                </div>
                <form onsubmit="handleSaveVehicle(event)" class="p-5 space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Registration / Number Plate *</label>
                        <input type="text" id="new-veh-number" required placeholder="e.g. MH-14-XY-9999" class="w-full px-3 py-2 uppercase font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Vehicle Description / Model *</label>
                        <input type="text" id="new-veh-name" required placeholder="e.g. Tata Ace Gold (Everest Van 2)" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                            <select id="new-veh-type" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="Delivery Van">Delivery Van</option>
                                <option value="Mini Truck">Mini Truck</option>
                                <option value="Auto Rickshaw">Auto Rickshaw</option>
                                <option value="Delivery Bike">Delivery Bike</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Fuel Type</label>
                            <select id="new-veh-fuel" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="Diesel">Diesel</option>
                                <option value="Petrol">Petrol</option>
                                <option value="CNG">CNG</option>
                            </select>
                        </div>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button type="button" onclick="closeModal('add-vehicle-modal')" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" class="px-5 py-2 bg-colgate hover:bg-colgate-dark text-white font-bold rounded-xl shadow-sm">Save Vehicle</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('view-fuel').innerHTML = html;
}

function handleSaveFuel(e) {
    e.preventDefault();
    const vehicle_id = Number(document.getElementById('new-fuel-veh').value);
    const driverVal = document.getElementById('new-fuel-drv').value;
    const driver_id = driverVal ? Number(driverVal) : null;
    const fuel_type = document.getElementById('new-fuel-type').value;
    const amount_spent = Number(document.getElementById('new-fuel-amount').value);
    const liters = Number(document.getElementById('new-fuel-liters').value) || 0;
    const date = document.getElementById('new-fuel-date').value || new Date().toISOString().split('T')[0];
    const odoVal = document.getElementById('new-fuel-odometer').value;
    const odometer_reading = odoVal ? Number(odoVal) : null;
    const notes = document.getElementById('new-fuel-notes').value.trim();

    const newId = APP_DATA.fuel_expenses.length ? Math.max(...APP_DATA.fuel_expenses.map(f => f.id)) + 1 : 1;

    const newExpense = {
        id: newId,
        vehicle_id,
        driver_id,
        date,
        fuel_type,
        amount_spent,
        liters,
        odometer_reading,
        receipt_image: "",
        notes
    };

    const receiptInput = document.getElementById('new-fuel-receipt');
    if (receiptInput && receiptInput.files && receiptInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            newExpense.receipt_image = evt.target.result;
            APP_DATA.fuel_expenses.push(newExpense);
            StorageManager.save(APP_DATA);
            closeModal('add-fuel-modal');
            renderFuel();
            showToast(`Fuel expense of ${formatINR(amount_spent)} saved permanently!`);
        };
        reader.readAsDataURL(receiptInput.files[0]);
        return;
    }

    APP_DATA.fuel_expenses.push(newExpense);
    StorageManager.save(APP_DATA);
    closeModal('add-fuel-modal');
    renderFuel();
    showToast(`Fuel expense of ${formatINR(amount_spent)} saved permanently!`);
}

function handleSaveVehicle(e) {
    e.preventDefault();
    const vehicle_number = document.getElementById('new-veh-number').value.trim().toUpperCase();
    const vehicle_name = document.getElementById('new-veh-name').value.trim();
    const vehicle_type = document.getElementById('new-veh-type').value;
    const fuel_type = document.getElementById('new-veh-fuel').value;

    const newId = APP_DATA.vehicles.length ? Math.max(...APP_DATA.vehicles.map(v => v.id)) + 1 : 1;

    APP_DATA.vehicles.push({
        id: newId,
        vehicle_number,
        vehicle_name,
        vehicle_type,
        fuel_type,
        assigned_driver_id: null,
        status: "Active"
    });

    StorageManager.save(APP_DATA);
    closeModal('add-vehicle-modal');
    renderFuel();
    showToast(`Vehicle '${vehicle_number}' registered!`);
}

// -------------------------------------------------------------------
// 11. VIEW: BEAT DISPATCHES
// -------------------------------------------------------------------
function renderDispatches() {
    const today = new Date().toISOString().split('T')[0];
    const todayDispatches = APP_DATA.dispatch_beats.filter(d => d.dispatch_date === today);

    const totalEverestCrates = todayDispatches.reduce((sum, d) => sum + (Number(d.crates_everest) || 0), 0);
    const totalColgateCartons = todayDispatches.reduce((sum, d) => sum + (Number(d.cartons_colgate) || 0), 0);

    const html = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Beat Dispatches & Stock Loading Log</h2>
                <p class="text-xs text-slate-500">Track delivery van routes, driver-helper crews, Everest crates, and Colgate cartons</p>
            </div>
            <button onclick="openModal('add-dispatch-modal')" class="inline-flex items-center gap-2 px-4 py-2 bg-everest hover:bg-everest-dark text-white text-xs font-bold rounded-xl shadow-sm transition-colors self-start">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Dispatch New Beat</span>
            </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="bg-white p-5 rounded-2xl border border-red-200/80 bg-red-50/20 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-everest">Everest Crates Dispatched</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${totalEverestCrates} Crates</div>
                <span class="text-[11px] text-slate-500 mt-1 block">Spices blends, hing, garam & kitchen king</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-colgate">Colgate Cartons Dispatched</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${totalColgateCartons} Cartons</div>
                <span class="text-[11px] text-slate-500 mt-1 block">Toothpastes, Vedshakti, MaxFresh</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Beats Logged</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${APP_DATA.dispatch_beats.length} Routes</div>
                <span class="text-[11px] text-slate-400 mt-1 block">Market distribution beats</span>
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                            <th class="py-3 px-4">Date</th>
                            <th class="py-3 px-4">Beat / Route</th>
                            <th class="py-3 px-4">Vehicle</th>
                            <th class="py-3 px-4">Crew (Driver & Helper)</th>
                            <th class="py-3 px-4">Everest Crates</th>
                            <th class="py-3 px-4">Colgate Cartons</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                        ${APP_DATA.dispatch_beats.length ? APP_DATA.dispatch_beats.map(b => {
                            const veh = APP_DATA.vehicles.find(v => v.id === b.vehicle_id) || { vehicle_name: 'Unknown', vehicle_number: '' };
                            const drv = APP_DATA.workers.find(w => w.id === b.driver_id) || { name: 'Unassigned' };
                            const hlp = APP_DATA.workers.find(w => w.id === b.helper_id) || { name: 'None' };
                            return `
                                <tr class="hover:bg-slate-50/60">
                                    <td class="py-3.5 px-4 whitespace-nowrap">${formatDateDisplay(b.dispatch_date)}</td>
                                    <td class="py-3.5 px-4 font-bold text-slate-900">
                                        ${b.beat_name}
                                        ${b.notes ? `<span class="block text-[11px] font-normal text-slate-400">${b.notes}</span>` : ''}
                                    </td>
                                    <td class="py-3.5 px-4 whitespace-nowrap">
                                        <span class="font-mono text-slate-800 font-bold block">${veh.vehicle_number}</span>
                                        <span class="text-[10px] text-slate-400">${veh.vehicle_name}</span>
                                    </td>
                                    <td class="py-3.5 px-4 whitespace-nowrap">
                                        <div>Driver: <strong class="text-slate-900">${drv.name}</strong></div>
                                        <div class="text-[11px] text-slate-500">Helper: ${hlp.name}</div>
                                    </td>
                                    <td class="py-3.5 px-4 whitespace-nowrap font-extrabold text-everest">${b.crates_everest} Crates</td>
                                    <td class="py-3.5 px-4 whitespace-nowrap font-extrabold text-colgate">${b.cartons_colgate} Cartons</td>
                                    <td class="py-3.5 px-4 whitespace-nowrap">
                                        <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${b.status === 'Dispatched' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${b.status}</span>
                                    </td>
                                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                                        ${b.status === 'Dispatched' ? `
                                            <button onclick="toggleDispatchStatus(${b.id}, 'Completed')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]">Mark Completed</button>
                                        ` : '<span class="text-slate-400 text-[11px]">Delivered</span>'}
                                    </td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="8" class="p-8 text-center text-slate-400">No beat dispatches logged</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Dispatch Modal -->
        <div id="add-dispatch-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 class="text-sm font-bold text-slate-900">Dispatch Delivery Beat / Route</h3>
                    <button onclick="closeModal('add-dispatch-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">✕</button>
                </div>
                <form onsubmit="handleSaveDispatch(event)" class="p-5 space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Beat / Route Name *</label>
                        <input type="text" id="new-beat-name" required placeholder="e.g. Main Bazaar Wholesale Route A" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Vehicle *</label>
                            <select id="new-beat-veh" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                ${APP_DATA.vehicles.map(v => `<option value="${v.id}">${v.vehicle_name} (${v.vehicle_number})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Dispatch Date *</label>
                            <input type="date" id="new-beat-date" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Delivery Driver</label>
                            <select id="new-beat-drv" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="">Unassigned</option>
                                ${APP_DATA.workers.map(w => `<option value="${w.id}">${w.name} (${w.role})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Godown Helper</label>
                            <select id="new-beat-hlp" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="">None</option>
                                ${APP_DATA.workers.map(w => `<option value="${w.id}">${w.name} (${w.role})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Everest Crates</label>
                            <input type="number" id="new-beat-everest" min="0" value="0" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Colgate Cartons</label>
                            <input type="number" id="new-beat-colgate" min="0" value="0" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Notes / Drop Points</label>
                        <input type="text" id="new-beat-notes" placeholder="e.g. 20 retail stores" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button type="button" onclick="closeModal('add-dispatch-modal')" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" class="px-5 py-2 bg-everest hover:bg-everest-dark text-white font-bold rounded-xl shadow-sm">Save & Dispatch</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('view-dispatches').innerHTML = html;
}

function handleSaveDispatch(e) {
    e.preventDefault();
    const beat_name = document.getElementById('new-beat-name').value.trim();
    const vehicle_id = Number(document.getElementById('new-beat-veh').value);
    const dispatch_date = document.getElementById('new-beat-date').value || new Date().toISOString().split('T')[0];
    const drvVal = document.getElementById('new-beat-drv').value;
    const hlpVal = document.getElementById('new-beat-hlp').value;
    const driver_id = drvVal ? Number(drvVal) : null;
    const helper_id = hlpVal ? Number(hlpVal) : null;
    const crates_everest = Number(document.getElementById('new-beat-everest').value) || 0;
    const cartons_colgate = Number(document.getElementById('new-beat-colgate').value) || 0;
    const notes = document.getElementById('new-beat-notes').value.trim();

    const newId = APP_DATA.dispatch_beats.length ? Math.max(...APP_DATA.dispatch_beats.map(d => d.id)) + 1 : 1;

    APP_DATA.dispatch_beats.push({
        id: newId,
        dispatch_date,
        beat_name,
        vehicle_id,
        driver_id,
        helper_id,
        crates_everest,
        cartons_colgate,
        status: "Dispatched",
        notes
    });

    StorageManager.save(APP_DATA);
    closeModal('add-dispatch-modal');
    renderDispatches();
    showToast(`Dispatch '${beat_name}' recorded!`);
}

function toggleDispatchStatus(id, newStatus) {
    const b = APP_DATA.dispatch_beats.find(d => d.id === id);
    if (!b) return;
    b.status = newStatus;
    StorageManager.save(APP_DATA);
    renderDispatches();
    showToast(`Beat dispatch marked as '${newStatus}'`);
}

// -------------------------------------------------------------------
// 12. VIEW: DAMAGED & EXPIRY RETURNS
// -------------------------------------------------------------------
let returnBrandFilter = '';
let returnStatusFilter = '';

function renderReturns() {
    let filtered = APP_DATA.damaged_returns.filter(r => {
        if (returnBrandFilter && r.brand !== returnBrandFilter) return false;
        if (returnStatusFilter && r.claim_status !== returnStatusFilter) return false;
        return true;
    });

    const totalClaims = APP_DATA.damaged_returns.reduce((sum, r) => sum + (Number(r.credit_note_amount) || 0), 0);
    const pendingCredit = APP_DATA.damaged_returns.filter(r => r.claim_status !== 'Credit Note Received').reduce((sum, r) => sum + (Number(r.credit_note_amount) || 0), 0);
    const creditedAmount = APP_DATA.damaged_returns.filter(r => r.claim_status === 'Credit Note Received').reduce((sum, r) => sum + (Number(r.credit_note_amount) || 0), 0);

    const html = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Damaged & Expiry Return Register</h2>
                <p class="text-xs text-slate-500">Track damaged cartons, leaking paste tubes, and expired spice packets to claim credit notes</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="exportReturnsCSV()" class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors">
                    <i data-lucide="download" class="w-4 h-4 text-emerald-600"></i>
                    <span>Export CSV</span>
                </button>
                <button onclick="openModal('add-return-modal')" class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Log Damaged Stock</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Return Claims</span>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">${formatINR(totalClaims)}</div>
                <span class="text-[11px] text-slate-400 mt-1 block">Everest & Colgate returns logged</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-700">Awaiting Depot Credit Note</span>
                <div class="mt-2 text-2xl font-extrabold text-amber-600">${formatINR(pendingCredit)}</div>
                <span class="text-[11px] text-amber-700 mt-1 block">Pending approval at depot</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Credit Notes Received</span>
                <div class="mt-2 text-2xl font-extrabold text-emerald-700">${formatINR(creditedAmount)}</div>
                <span class="text-[11px] text-emerald-700 mt-1 block">Credited to distributor ledger</span>
            </div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-6">
                    <select onchange="returnBrandFilter = this.value; renderReturns();" class="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        <option value="">All Brands (Everest & Colgate)</option>
                        <option value="Everest Spices" ${returnBrandFilter === 'Everest Spices' ? 'selected' : ''}>Everest Spices</option>
                        <option value="Colgate-Palmolive" ${returnBrandFilter === 'Colgate-Palmolive' ? 'selected' : ''}>Colgate-Palmolive</option>
                    </select>
                </div>
                <div class="sm:col-span-6">
                    <select onchange="returnStatusFilter = this.value; renderReturns();" class="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        <option value="">All Claim Statuses</option>
                        <option value="Pending Inspection" ${returnStatusFilter === 'Pending Inspection' ? 'selected' : ''}>Pending Inspection</option>
                        <option value="Submitted to Depot" ${returnStatusFilter === 'Submitted to Depot' ? 'selected' : ''}>Submitted to Depot</option>
                        <option value="Credit Note Received" ${returnStatusFilter === 'Credit Note Received' ? 'selected' : ''}>Credit Note Received</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                            <th class="py-3 px-4">Date</th>
                            <th class="py-3 px-4">Brand</th>
                            <th class="py-3 px-4">Product & Retailer</th>
                            <th class="py-3 px-4">Quantity</th>
                            <th class="py-3 px-4">Reason</th>
                            <th class="py-3 px-4">Claim Value</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                        ${filtered.length ? filtered.map(r => `
                            <tr class="hover:bg-slate-50/60">
                                <td class="py-3 px-4 whitespace-nowrap">${formatDateDisplay(r.return_date)}</td>
                                <td class="py-3 px-4 whitespace-nowrap">
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.brand.includes('Everest') ? 'bg-red-50 text-everest border border-red-200' : 'bg-blue-50 text-colgate border border-blue-200'}">${r.brand}</span>
                                </td>
                                <td class="py-3 px-4 font-bold text-slate-900">
                                    ${r.product_name}
                                    <span class="block text-[10px] text-slate-400 font-normal">Retailer: ${r.retailer_name} ${r.batch_no ? '• Batch: ' + r.batch_no : ''}</span>
                                </td>
                                <td class="py-3 px-4 whitespace-nowrap font-bold">${r.quantity} ${r.unit}</td>
                                <td class="py-3 px-4 whitespace-nowrap">${r.reason}</td>
                                <td class="py-3 px-4 whitespace-nowrap font-extrabold text-slate-900">${formatINR(r.credit_note_amount)}</td>
                                <td class="py-3 px-4 whitespace-nowrap">
                                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${r.claim_status === 'Credit Note Received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${r.claim_status}</span>
                                    ${r.credit_note_number ? `<span class="block font-mono text-[9px] text-emerald-700 mt-0.5">#${r.credit_note_number}</span>` : ''}
                                </td>
                                <td class="py-3 px-4 text-right whitespace-nowrap">
                                    <button onclick="openUpdateClaimModal(${r.id})" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px]">Update Claim</button>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="8" class="p-8 text-center text-slate-400">No damage return records found</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Return Modal -->
        <div id="add-return-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 class="text-sm font-bold text-slate-900">Log Damaged / Expired Product</h3>
                    <button onclick="closeModal('add-return-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">✕</button>
                </div>
                <form onsubmit="handleSaveReturn(event)" class="p-5 space-y-4 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Company / Brand *</label>
                            <select id="new-ret-brand" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="Everest Spices">Everest Spices</option>
                                <option value="Colgate-Palmolive">Colgate-Palmolive</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Return Date *</label>
                            <input type="date" id="new-ret-date" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Product Description *</label>
                        <input type="text" id="new-ret-prod" required placeholder="e.g. Everest Kitchen King 100g or Colgate MaxFresh 150g" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Retailer / Kirana Shop *</label>
                            <input type="text" id="new-ret-ret" required placeholder="e.g. Shree Ganesh Kirana" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Batch Number</label>
                            <input type="text" id="new-ret-batch" placeholder="e.g. EV-2026-B8" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Quantity *</label>
                            <input type="number" id="new-ret-qty" min="1" value="1" required class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Unit</label>
                            <select id="new-ret-unit" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                                <option value="Cartons">Cartons</option>
                                <option value="Packets">Packets</option>
                                <option value="Tubes">Tubes</option>
                                <option value="Boxes">Boxes</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Claim Amt (₹) *</label>
                            <input type="number" id="new-ret-amt" step="10" required placeholder="e.g. 1800" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Damage Reason</label>
                        <select id="new-ret-reason" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                            <option value="Damaged in Transit">Damaged in Transit</option>
                            <option value="Packaging Leakage">Packaging Leakage</option>
                            <option value="Expired">Expired</option>
                            <option value="Seal Broken">Seal Broken</option>
                        </select>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button type="button" onclick="closeModal('add-return-modal')" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                        <button type="submit" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm">Save Return Claim</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Update Claim Modal Container -->
        <div id="update-claim-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div id="update-claim-modal-content" class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100"></div>
        </div>
    `;

    document.getElementById('view-returns').innerHTML = html;
}

function handleSaveReturn(e) {
    e.preventDefault();
    const brand = document.getElementById('new-ret-brand').value;
    const return_date = document.getElementById('new-ret-date').value || new Date().toISOString().split('T')[0];
    const product_name = document.getElementById('new-ret-prod').value.trim();
    const retailer_name = document.getElementById('new-ret-ret').value.trim();
    const batch_no = document.getElementById('new-ret-batch').value.trim();
    const quantity = Number(document.getElementById('new-ret-qty').value) || 1;
    const unit = document.getElementById('new-ret-unit').value;
    const credit_note_amount = Number(document.getElementById('new-ret-amt').value) || 0;
    const reason = document.getElementById('new-ret-reason').value;

    const newId = APP_DATA.damaged_returns.length ? Math.max(...APP_DATA.damaged_returns.map(r => r.id)) + 1 : 1;

    APP_DATA.damaged_returns.push({
        id: newId,
        return_date,
        brand,
        product_name,
        retailer_name,
        batch_no,
        expiry_date: "",
        quantity,
        unit,
        reason,
        claim_status: "Pending Inspection",
        credit_note_amount,
        credit_note_number: "",
        notes: ""
    });

    StorageManager.save(APP_DATA);
    closeModal('add-return-modal');
    renderReturns();
    showToast(`Damaged return for '${product_name}' logged!`);
}

function openUpdateClaimModal(id) {
    const r = APP_DATA.damaged_returns.find(item => item.id === id);
    if (!r) return;

    const modalContent = document.getElementById('update-claim-modal-content');
    modalContent.innerHTML = `
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="text-sm font-bold text-slate-900">Update Depot Credit Note Claim</h3>
            <button onclick="closeModal('update-claim-modal')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">✕</button>
        </div>
        <form onsubmit="handleSaveClaimUpdate(event, ${r.id})" class="p-5 space-y-4 text-xs">
            <div>
                <span class="block text-slate-500 font-bold">Product:</span>
                <p class="font-bold text-slate-900 text-sm mt-0.5">${r.product_name}</p>
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Claim Status *</label>
                <select id="claim-status-input" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    <option value="Pending Inspection" ${r.claim_status === 'Pending Inspection' ? 'selected' : ''}>Pending Inspection</option>
                    <option value="Submitted to Depot" ${r.claim_status === 'Submitted to Depot' ? 'selected' : ''}>Submitted to Depot</option>
                    <option value="Credit Note Received" ${r.claim_status === 'Credit Note Received' ? 'selected' : ''}>Credit Note Received</option>
                    <option value="Rejected" ${r.claim_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Approved Credit Amount (₹)</label>
                <input type="number" id="claim-amt-input" step="10" value="${r.credit_note_amount}" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Credit Note Number</label>
                <input type="text" id="claim-num-input" value="${r.credit_note_number || ''}" placeholder="e.g. CN-EV-9821" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onclick="closeModal('update-claim-modal')" class="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" class="px-5 py-2 bg-colgate hover:bg-colgate-dark text-white font-bold rounded-xl shadow-sm">Save Claim Update</button>
            </div>
        </form>
    `;

    openModal('update-claim-modal');
}

function handleSaveClaimUpdate(e, id) {
    e.preventDefault();
    const r = APP_DATA.damaged_returns.find(item => item.id === id);
    if (!r) return;

    r.claim_status = document.getElementById('claim-status-input').value;
    r.credit_note_amount = Number(document.getElementById('claim-amt-input').value) || 0;
    r.credit_note_number = document.getElementById('claim-num-input').value.trim();

    StorageManager.save(APP_DATA);
    closeModal('update-claim-modal');
    renderReturns();
    showToast(`Claim status updated for '${r.product_name}'`);
}

// -------------------------------------------------------------------
// 13. VIEW: MONTHLY SALARY & ADVANCE SETTLEMENT CALCULATOR
// -------------------------------------------------------------------
let settlementYear = new Date().getFullYear();
let settlementMonth = new Date().getMonth() + 1;

function renderSettlements() {
    const activeWorkers = APP_DATA.workers.filter(w => w.status === 'Active');
    const monthStr = `${settlementYear}-${String(settlementMonth).padStart(2, '0')}`;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const html = `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 class="text-base font-bold text-slate-900">Godown Staff Payroll & Advance Reconciliation</h2>
                <p class="text-xs text-slate-500">Auto-calculate net payout: <code>(Days Worked × Daily Wage) - Advances Deducted = Net Payout</code></p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
                <select onchange="settlementMonth = Number(this.value); renderSettlements();" class="text-xs font-bold py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    ${monthNames.map((name, idx) => `<option value="${idx + 1}" ${settlementMonth === idx + 1 ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
                <select onchange="settlementYear = Number(this.value); renderSettlements();" class="text-xs font-bold py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-colgate outline-none">
                    ${[settlementYear - 1, settlementYear, settlementYear + 1].map(y => `<option value="${y}" ${settlementYear === y ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
                <button onclick="exportSettlementsCSV()" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    <span>Export CSV</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${activeWorkers.map(w => {
                const attSum = getWorkerAttendanceSummary(w.id, settlementYear, settlementMonth);
                const gross = attSum.effective_days * w.daily_wage;
                const pendingAdv = getWorkerPendingAdvances(w.id);
                const autoDeduct = Math.min(pendingAdv, gross);
                const netPay = Math.max(0, gross - autoDeduct);

                const existingSettlement = APP_DATA.salary_settlements.find(s => s.worker_id === w.id && s.month_year === monthStr);

                return `
                    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
                        <div class="p-5 border-b border-slate-100 flex items-center justify-between ${existingSettlement ? 'bg-emerald-50/40' : 'bg-slate-50/50'}">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                    ${w.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-slate-900 leading-tight">${w.name}</h3>
                                    <p class="text-[11px] text-slate-500">${w.role} • Wage: <strong class="text-slate-700">${formatINR(w.daily_wage)}/day</strong></p>
                                </div>
                            </div>

                            ${existingSettlement ? `
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">Settled</span>
                                    <button onclick="renderVoucher(${existingSettlement.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800" title="Print Salary Slip">
                                        <i data-lucide="printer" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            ` : `
                                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800">Unsettled</span>
                            `}
                        </div>

                        <div class="p-5 space-y-4 text-xs">
                            <div class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                <div>
                                    <span class="text-[10px] uppercase font-bold text-slate-400 block">Attendance Days</span>
                                    <span class="text-base font-extrabold text-slate-900 mt-0.5 block">${attSum.effective_days} Days</span>
                                    <span class="text-[10px] text-slate-500">P: ${attSum.present} | H: ${attSum.half_day}</span>
                                </div>
                                <div>
                                    <span class="text-[10px] uppercase font-bold text-slate-400 block">Gross Earned</span>
                                    <span class="text-base font-extrabold text-emerald-700 mt-0.5 block">${formatINR(gross)}</span>
                                    <span class="text-[10px] text-slate-500">${attSum.effective_days} × ${formatINR(w.daily_wage)}</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl ${pendingAdv > 0 ? 'bg-amber-50/70 border border-amber-200 text-amber-900' : 'bg-slate-50 border border-slate-200 text-slate-600'}">
                                <span class="font-semibold">Outstanding Advance Khata:</span>
                                <span class="font-extrabold ${pendingAdv > 0 ? 'text-amber-700' : 'text-slate-700'}">${formatINR(pendingAdv)}</span>
                            </div>

                            <form onsubmit="handleProcessSettlement(event, ${w.id}, '${monthStr}', ${gross})" class="space-y-3 pt-1">
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Advance Deducted (₹)</label>
                                        <input type="number" id="deduct_${w.id}" value="${existingSettlement ? existingSettlement.advances_deducted : autoDeduct}" min="0" step="50" oninput="updateLivePayout(${w.id}, ${gross})" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Bonus / Incentive (₹)</label>
                                        <input type="number" id="bonus_${w.id}" value="${existingSettlement ? existingSettlement.bonus_incentive : 0}" min="0" step="50" oninput="updateLivePayout(${w.id}, ${gross})" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none">
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Payment Mode</label>
                                        <select id="mode_${w.id}" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none">
                                            <option value="Cash" ${existingSettlement && existingSettlement.payment_mode === 'Cash' ? 'selected' : ''}>Cash</option>
                                            <option value="Bank Transfer" ${existingSettlement && existingSettlement.payment_mode === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                                            <option value="UPI" ${existingSettlement && existingSettlement.payment_mode === 'UPI' ? 'selected' : ''}>UPI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Ref / UTR / Voucher</label>
                                        <input type="text" id="ref_${w.id}" value="${existingSettlement ? existingSettlement.payment_reference : ''}" placeholder="Voucher # or UTR" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none">
                                    </div>
                                </div>

                                <div class="mt-4 p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                                    <div>
                                        <span class="text-[10px] font-bold text-slate-400 uppercase block">Calculated Net Payout</span>
                                        <span id="live_net_${w.id}" class="text-xl font-black text-emerald-400">
                                            ${formatINR(existingSettlement ? existingSettlement.net_payout : netPay)}
                                        </span>
                                    </div>
                                    <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg transition-colors shadow-md flex items-center gap-1.5">
                                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                                        <span>${existingSettlement ? 'Re-Settle' : 'Settle & Print Slip'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    document.getElementById('view-settlements').innerHTML = html;
}

function updateLivePayout(workerId, gross) {
    const deductEl = document.getElementById(`deduct_${workerId}`);
    const bonusEl = document.getElementById(`bonus_${workerId}`);
    const liveNetEl = document.getElementById(`live_net_${workerId}`);

    const deduct = Number(deductEl ? deductEl.value : 0) || 0;
    const bonus = Number(bonusEl ? bonusEl.value : 0) || 0;

    const net = Math.max(0, (gross - deduct) + bonus);
    if (liveNetEl) liveNetEl.textContent = formatINR(net);
}

function handleProcessSettlement(e, workerId, monthStr, gross) {
    e.preventDefault();
    const w = APP_DATA.workers.find(item => item.id === workerId);
    if (!w) return;

    const [year, month] = monthStr.split('-').map(Number);
    const attSum = getWorkerAttendanceSummary(w.id, year, month);

    const deduct = Number(document.getElementById(`deduct_${workerId}`).value) || 0;
    const bonus = Number(document.getElementById(`bonus_${workerId}`).value) || 0;
    const mode = document.getElementById(`mode_${workerId}`).value;
    const ref = document.getElementById(`ref_${workerId}`).value.trim();

    const net = Math.max(0, (gross - deduct) + bonus);

    let settlement = APP_DATA.salary_settlements.find(s => s.worker_id === workerId && s.month_year === monthStr);
    if (!settlement) {
        const newId = APP_DATA.salary_settlements.length ? Math.max(...APP_DATA.salary_settlements.map(s => s.id)) + 1 : 1;
        settlement = {
            id: newId,
            worker_id: workerId,
            month_year: monthStr,
            days_present: attSum.present,
            half_days: attSum.half_day,
            paid_leaves: attSum.paid_leave,
            absent_days: attSum.absent,
            effective_days: attSum.effective_days,
            daily_wage: w.daily_wage,
            gross_earnings: gross,
            advances_deducted: deduct,
            bonus_incentive: bonus,
            net_payout: net,
            settlement_date: new Date().toISOString().split('T')[0],
            payment_mode: mode,
            payment_reference: ref,
            notes: ""
        };
        APP_DATA.salary_settlements.push(settlement);
    } else {
        settlement.days_present = attSum.present;
        settlement.half_days = attSum.half_day;
        settlement.paid_leaves = attSum.paid_leave;
        settlement.absent_days = attSum.absent;
        settlement.effective_days = attSum.effective_days;
        settlement.daily_wage = w.daily_wage;
        settlement.gross_earnings = gross;
        settlement.advances_deducted = deduct;
        settlement.bonus_incentive = bonus;
        settlement.net_payout = net;
        settlement.settlement_date = new Date().toISOString().split('T')[0];
        settlement.payment_mode = mode;
        settlement.payment_reference = ref;
    }

    // Deduct / settle worker's approved advances up to deduct amount
    let remainingDeduct = deduct;
    const approvedAdvances = APP_DATA.advances.filter(a => a.worker_id === workerId && a.status === 'Approved');
    for (const adv of approvedAdvances) {
        if (remainingDeduct <= 0) break;
        if (adv.amount_paid <= remainingDeduct) {
            remainingDeduct -= adv.amount_paid;
            adv.status = 'Settled';
            adv.settlement_id = settlement.id;
        } else {
            adv.status = 'Settled';
            adv.settlement_id = settlement.id;
            const remainingBal = adv.amount_paid - remainingDeduct;
            remainingDeduct = 0;
            const newAdvId = APP_DATA.advances.length ? Math.max(...APP_DATA.advances.map(a => a.id)) + 1 : 1;
            APP_DATA.advances.push({
                id: newAdvId,
                worker_id: workerId,
                request_date: adv.request_date,
                payment_date: adv.payment_date,
                amount_requested: remainingBal,
                amount_paid: remainingBal,
                payment_mode: adv.payment_mode,
                reason: `Remaining balance from Advance #${adv.id}`,
                status: 'Approved',
                settlement_id: null
            });
        }
    }

    StorageManager.save(APP_DATA);
    showToast(`Salary settled for ${w.name}! Net payout: ${formatINR(net)}`);
    renderVoucher(settlement.id);
}

// -------------------------------------------------------------------
// 14. VIEW: PRINTABLE WAGE PAYMENT VOUCHER
// -------------------------------------------------------------------
function renderVoucher(settlementId) {
    const s = APP_DATA.salary_settlements.find(item => item.id === settlementId);
    if (!s) return;

    const w = APP_DATA.workers.find(item => item.id === s.worker_id) || { name: 'Worker', role: '', phone: '' };

    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    const voucherEl = document.getElementById('view-voucher');
    voucherEl.classList.remove('hidden');

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = `Wage Payout Voucher #${s.id}`;

    voucherEl.innerHTML = `
        <div class="space-y-6 max-w-4xl mx-auto">
            <div class="no-print flex items-center justify-between">
                <button onclick="switchView('settlements')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    <span>Back to Calculator</span>
                </button>
                <button onclick="window.print()" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors">
                    <i data-lucide="printer" class="w-4 h-4"></i>
                    <span>Print Official Voucher</span>
                </button>
            </div>

            <div class="bg-white rounded-2xl border border-slate-300 shadow-lg p-8 voucher-container">
                <div class="border-b-2 border-slate-900 pb-6 text-center">
                    <div class="inline-block px-3 py-1 rounded bg-red-100 text-everest text-[11px] font-bold uppercase tracking-wider mb-2">
                        Authorized FMCG Distribution Depot
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Anupama Agencies</h1>
                    <p class="text-xs text-slate-600 font-semibold mt-1">
                        Authorized Distributor: <strong>Everest Spices</strong> & <strong>Colgate-Palmolive India Ltd.</strong>
                    </p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Godown & Warehouse Operations • Daily Wage Payout Voucher</p>
                </div>

                <div class="py-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                        <span class="text-slate-400 font-medium block">Voucher Number:</span>
                        <span class="font-mono font-bold text-slate-900">VCHR-${s.id}-${s.month_year}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-medium block">Payout Month:</span>
                        <span class="font-bold text-slate-900">${s.month_year}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-medium block">Disbursement Date:</span>
                        <span class="font-bold text-slate-900">${formatDateDisplay(s.settlement_date)}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-medium block">Payment Mode:</span>
                        <span class="font-bold text-slate-900">${s.payment_mode} ${s.payment_reference ? '(' + s.payment_reference + ')' : ''}</span>
                    </div>
                </div>

                <div class="py-5 border-b border-slate-200 text-xs">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Godown Staff Particulars</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <span class="text-slate-500 block">Worker Name:</span>
                            <span class="text-sm font-extrabold text-slate-900">${w.name}</span>
                        </div>
                        <div>
                            <span class="text-slate-500 block">Designation / Role:</span>
                            <span class="font-bold text-slate-800">${w.role}</span>
                        </div>
                        <div>
                            <span class="text-slate-500 block">Registered Contact:</span>
                            <span class="font-bold text-slate-800">${w.phone}</span>
                        </div>
                    </div>
                </div>

                <div class="py-5 border-b border-slate-200 text-xs">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Attendance Days Breakdown</h3>
                    <div class="grid grid-cols-4 gap-3 text-center">
                        <div class="p-2.5 rounded bg-slate-50 border border-slate-100">
                            <span class="text-[10px] text-slate-500 uppercase font-bold block">Present (Full)</span>
                            <span class="text-sm font-bold text-slate-900 mt-1 block">${s.days_present}</span>
                        </div>
                        <div class="p-2.5 rounded bg-slate-50 border border-slate-100">
                            <span class="text-[10px] text-slate-500 uppercase font-bold block">Half Days (0.5)</span>
                            <span class="text-sm font-bold text-slate-900 mt-1 block">${s.half_days}</span>
                        </div>
                        <div class="p-2.5 rounded bg-slate-50 border border-slate-100">
                            <span class="text-[10px] text-slate-500 uppercase font-bold block">Paid Leaves</span>
                            <span class="text-sm font-bold text-slate-900 mt-1 block">${s.paid_leaves}</span>
                        </div>
                        <div class="p-2.5 rounded bg-blue-50/60 border border-blue-200">
                            <span class="text-[10px] text-colgate uppercase font-bold block">Effective Days</span>
                            <span class="text-sm font-black text-colgate mt-1 block">${s.effective_days} Days</span>
                        </div>
                    </div>
                </div>

                <div class="py-6 border-b-2 border-slate-900 text-xs">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Earnings & Deductions Summary</h3>
                    <table class="w-full">
                        <tbody class="divide-y divide-slate-100">
                            <tr>
                                <td class="py-2.5 text-slate-600">Daily Wage Rate</td>
                                <td class="py-2.5 text-right font-medium">${formatINR(s.daily_wage)} / day</td>
                            </tr>
                            <tr>
                                <td class="py-2.5 text-slate-600">Effective Days Worked (${s.effective_days} Days × ${formatINR(s.daily_wage)})</td>
                                <td class="py-2.5 text-right font-bold text-slate-900">${formatINR(s.gross_earnings)}</td>
                            </tr>
                            <tr>
                                <td class="py-2.5 text-rose-600 font-semibold">Less: Advance Recovered from Khata Ledger</td>
                                <td class="py-2.5 text-right font-bold text-rose-600">-${formatINR(s.advances_deducted)}</td>
                            </tr>
                            ${s.bonus_incentive > 0 ? `
                                <tr>
                                    <td class="py-2.5 text-emerald-600 font-semibold">Add: Festival Bonus / Overtime Incentive</td>
                                    <td class="py-2.5 text-right font-bold text-emerald-600">+${formatINR(s.bonus_incentive)}</td>
                                </tr>
                            ` : ''}
                            <tr class="bg-slate-900 text-white font-extrabold text-sm">
                                <td class="py-3.5 px-3 uppercase tracking-wider">Net Amount Payable to Staff</td>
                                <td class="py-3.5 px-3 text-right text-base text-emerald-400 font-black">${formatINR(s.net_payout)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="pt-12 pb-4 grid grid-cols-2 gap-8 text-center text-xs">
                    <div>
                        <div class="border-t border-slate-400 w-48 mx-auto pt-2 font-bold text-slate-800">
                            Worker Signature / Thumb
                        </div>
                        <span class="text-[10px] text-slate-400">Received full payment as calculated</span>
                    </div>
                    <div>
                        <div class="border-t border-slate-400 w-48 mx-auto pt-2 font-bold text-slate-800">
                            For Anupama Agencies
                        </div>
                        <span class="text-[10px] text-slate-400">Authorized Godown Manager</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------------
// 15. CSV EXPORT UTILITIES (UTF-8 BOM COMPATIBLE)
// -------------------------------------------------------------------
function downloadCSV(filename, csvContent) {
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename}`);
}

function exportAttendanceCSV() {
    const headers = ['Attendance ID', 'Date', 'Worker Name', 'Role', 'Status', 'Notes'];
    const rows = APP_DATA.attendances.map(a => {
        const w = APP_DATA.workers.find(item => item.id === a.worker_id) || { name: 'Unknown', role: '' };
        return [a.id, a.date, `"${w.name}"`, `"${w.role}"`, `"${a.status}"`, `"${a.notes || ''}"`].join(',');
    });
    downloadCSV('Anupama_Agencies_Attendance_Register.csv', [headers.join(','), ...rows].join('\r\n'));
}

function exportAdvancesCSV() {
    const headers = ['Advance ID', 'Worker Name', 'Role', 'Payment Date', 'Amount (INR)', 'Payment Mode', 'Reason', 'Status'];
    const rows = APP_DATA.advances.map(a => {
        const w = APP_DATA.workers.find(item => item.id === a.worker_id) || { name: 'Unknown', role: '' };
        return [a.id, `"${w.name}"`, `"${w.role}"`, a.payment_date, a.amount_paid, `"${a.payment_mode}"`, `"${a.reason || ''}"`, `"${a.status}"`].join(',');
    });
    downloadCSV('Anupama_Agencies_Khata_Advances.csv', [headers.join(','), ...rows].join('\r\n'));
}

function exportFuelCSV() {
    const headers = ['Expense ID', 'Date', 'Vehicle Number', 'Vehicle Name', 'Driver', 'Fuel Type', 'Amount Spent (INR)', 'Liters', 'Odometer Reading', 'Notes'];
    const rows = APP_DATA.fuel_expenses.map(f => {
        const v = APP_DATA.vehicles.find(item => item.id === f.vehicle_id) || { vehicle_number: '', vehicle_name: '' };
        const d = APP_DATA.workers.find(item => item.id === f.driver_id) || { name: 'Unassigned' };
        return [f.id, f.date, `"${v.vehicle_number}"`, `"${v.vehicle_name}"`, `"${d.name}"`, `"${f.fuel_type}"`, f.amount_spent, f.liters, f.odometer_reading || '', `"${f.notes || ''}"`].join(',');
    });
    downloadCSV('Anupama_Agencies_Fuel_Expenses.csv', [headers.join(','), ...rows].join('\r\n'));
}

function exportSettlementsCSV() {
    const headers = ['Settlement ID', 'Month-Year', 'Worker Name', 'Role', 'Effective Days', 'Daily Wage', 'Gross Earnings', 'Advances Deducted', 'Bonus', 'Net Payout', 'Payment Date', 'Mode', 'Reference'];
    const rows = APP_DATA.salary_settlements.map(s => {
        const w = APP_DATA.workers.find(item => item.id === s.worker_id) || { name: 'Unknown', role: '' };
        return [s.id, s.month_year, `"${w.name}"`, `"${w.role}"`, s.effective_days, s.daily_wage, s.gross_earnings, s.advances_deducted, s.bonus_incentive, s.net_payout, s.settlement_date, `"${s.payment_mode}"`, `"${s.payment_reference || ''}"`].join(',');
    });
    downloadCSV('Anupama_Agencies_Salary_Settlements.csv', [headers.join(','), ...rows].join('\r\n'));
}

function exportReturnsCSV() {
    const headers = ['Return ID', 'Date', 'Brand', 'Product Name', 'Retailer Name', 'Batch No', 'Quantity', 'Unit', 'Reason', 'Claim Status', 'Claim Amount (INR)', 'Credit Note Number'];
    const rows = APP_DATA.damaged_returns.map(r => {
        return [r.id, r.return_date, `"${r.brand}"`, `"${r.product_name}"`, `"${r.retailer_name}"`, `"${r.batch_no || ''}"`, r.quantity, `"${r.unit}"`, `"${r.reason}"`, `"${r.claim_status}"`, r.credit_note_amount, `"${r.credit_note_number || ''}"`].join(',');
    });
    downloadCSV('Anupama_Agencies_Damaged_Returns.csv', [headers.join(','), ...rows].join('\r\n'));
}

function exportAllCSV() {
    exportAttendanceCSV();
    setTimeout(exportAdvancesCSV, 300);
    setTimeout(exportFuelCSV, 600);
    setTimeout(exportReturnsCSV, 900);
}

// -------------------------------------------------------------------
// 16. JSON BACKUP & RESTORE UTILITIES
// -------------------------------------------------------------------
function downloadBackupJSON() {
    const jsonStr = JSON.stringify(APP_DATA, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = URL.createObjectURL(blob);
    link.download = `Anupama_Agencies_Backup_${dateStr}.json`;
    link.click();
    showToast("Backup JSON downloaded!");
}

function restoreBackupFromFile() {
    const fileInput = document.getElementById('restore-file-input');
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert("Please select a valid .json backup file to restore.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const parsed = JSON.parse(evt.target.result);
            if (!parsed.workers || !Array.isArray(parsed.workers)) {
                throw new Error("Invalid backup format");
            }
            APP_DATA = parsed;
            StorageManager.save(APP_DATA);
            closeModal('backup-modal');
            renderView(currentView);
            showToast("Database restored successfully from backup!");
        } catch (err) {
            alert("Error parsing backup file. Please ensure it is a valid Anupama Agencies backup JSON.");
        }
    };
    reader.readAsText(fileInput.files[0]);
}

function confirmResetToSeed() {
    if (confirm("Reset all data to default initial seed? All custom additions will be replaced.")) {
        APP_DATA = StorageManager.resetToSeed();
        closeModal('backup-modal');
        renderView(currentView);
        showToast("Database reset to factory default sample data.");
    }
}

// -------------------------------------------------------------------
// 17. INITIALIZATION ON DOM READY
// -------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Current date in header
    const dateBadge = document.getElementById('current-date-badge');
    if (dateBadge) {
        const today = new Date();
        dateBadge.textContent = today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    // Mobile drawer toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            if (backdrop) backdrop.classList.toggle('hidden');
        });
    }

    if (backdrop && sidebar) {
        backdrop.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            backdrop.classList.add('hidden');
        });
    }

    // Default view
    switchView('dashboard');
});
