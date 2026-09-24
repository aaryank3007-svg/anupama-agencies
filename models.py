from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

db = SQLAlchemy()

class Worker(db.Model):
    __tablename__ = 'workers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    emergency_contact = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(60), nullable=False)  # Loader, Driver, Helper, Supervisor
    join_date = db.Column(db.Date, nullable=False, default=date.today)
    daily_wage = db.Column(db.Float, nullable=False, default=500.0)
    monthly_salary = db.Column(db.Float, nullable=False, default=15000.0)
    status = db.Column(db.String(20), nullable=False, default='Active')  # Active, Inactive
    photo_path = db.Column(db.String(255), nullable=True, default='')
    created_at = db.Column(db.DateTime, default=datetime.now)

    # Relationships
    attendances = db.relationship('Attendance', backref='worker', lazy=True, cascade='all, delete-orphan')
    advances = db.relationship('Advance', backref='worker', lazy=True, cascade='all, delete-orphan')
    salary_settlements = db.relationship('SalarySettlement', backref='worker', lazy=True, cascade='all, delete-orphan')

    @property
    def total_advances_pending(self):
        """Total approved advances that have not yet been settled/deducted."""
        approved_advances = [a.amount_paid for a in self.advances if a.status == 'Approved']
        return sum(approved_advances)

    @property
    def total_advances_taken(self):
        """Historical total of advances paid to this worker."""
        return sum([a.amount_paid for a in self.advances if a.status in ('Approved', 'Settled')])

    def days_worked_in_month(self, year, month):
        """Calculate effective days worked in a specific month (Present: 1.0, Half Day: 0.5, Paid Leave: 1.0)."""
        recs = [a for a in self.attendances if a.date.year == year and a.date.month == month]
        effective_days = 0.0
        for r in recs:
            if r.status in ('Present', 'Paid Leave'):
                effective_days += 1.0
            elif r.status == 'Half Day':
                effective_days += 0.5
        return effective_days

    def attendance_summary_in_month(self, year, month):
        recs = [a for a in self.attendances if a.date.year == year and a.date.month == month]
        present = sum(1 for a in recs if a.status == 'Present')
        half_day = sum(1 for a in recs if a.status == 'Half Day')
        absent = sum(1 for a in recs if a.status == 'Absent')
        paid_leave = sum(1 for a in recs if a.status == 'Paid Leave')
        effective = present + paid_leave + (half_day * 0.5)
        total_marked = len(recs)
        pct = (effective / total_marked * 100) if total_marked > 0 else 0
        return {
            'present': present,
            'half_day': half_day,
            'absent': absent,
            'paid_leave': paid_leave,
            'effective_days': effective,
            'total_marked': total_marked,
            'attendance_pct': round(pct, 1)
        }

    def __repr__(self):
        return f"<Worker {self.id}: {self.name} ({self.role})>"


class Attendance(db.Model):
    __tablename__ = 'attendance'
    __table_args__ = (
        db.UniqueConstraint('worker_id', 'date', name='uq_worker_attendance_date'),
    )

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    status = db.Column(db.String(20), nullable=False, default='Present')  # Present, Half Day, Absent, Paid Leave
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return f"<Attendance Worker={self.worker_id} Date={self.date} Status={self.status}>"


class Advance(db.Model):
    __tablename__ = 'advances'

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=False)
    request_date = db.Column(db.Date, nullable=False, default=date.today)
    payment_date = db.Column(db.Date, nullable=False, default=date.today)
    amount_requested = db.Column(db.Float, nullable=False, default=0.0)
    amount_paid = db.Column(db.Float, nullable=False, default=0.0)
    payment_mode = db.Column(db.String(30), nullable=False, default='Cash')  # Cash, UPI, Bank Transfer
    reason = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Approved')  # Pending, Approved, Settled
    settlement_id = db.Column(db.Integer, db.ForeignKey('salary_settlements.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return f"<Advance #{self.id} Worker={self.worker_id} Amt={self.amount_paid} Status={self.status}>"


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_number = db.Column(db.String(50), nullable=False, unique=True)
    vehicle_name = db.Column(db.String(120), nullable=False)
    vehicle_type = db.Column(db.String(50), nullable=False, default='Delivery Van')  # Delivery Van, Auto, Mini Truck, Bike
    fuel_type = db.Column(db.String(20), nullable=False, default='Diesel')  # Diesel, Petrol, CNG
    assigned_driver_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Active')  # Active, Maintenance, Inactive
    created_at = db.Column(db.DateTime, default=datetime.now)

    # Relationships
    assigned_driver = db.relationship('Worker', foreign_keys=[assigned_driver_id], lazy=True)
    fuel_expenses = db.relationship('FuelExpense', backref='vehicle', lazy=True, cascade='all, delete-orphan')
    dispatches = db.relationship('DispatchBeat', backref='vehicle', lazy=True)

    def __repr__(self):
        return f"<Vehicle {self.vehicle_number} ({self.vehicle_name})>"


class FuelExpense(db.Model):
    __tablename__ = 'fuel_expenses'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=True)
    date = db.Column(db.Date, nullable=False, default=date.today)
    fuel_type = db.Column(db.String(20), nullable=False, default='Diesel')
    amount_spent = db.Column(db.Float, nullable=False, default=0.0)
    liters = db.Column(db.Float, nullable=False, default=0.0)
    odometer_reading = db.Column(db.Integer, nullable=True)
    receipt_image = db.Column(db.String(255), nullable=True, default='')
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    driver = db.relationship('Worker', foreign_keys=[driver_id], lazy=True)

    def __repr__(self):
        return f"<FuelExpense #{self.id} Vehicle={self.vehicle_id} Amt={self.amount_spent}>"


class DispatchBeat(db.Model):
    __tablename__ = 'dispatch_beats'

    id = db.Column(db.Integer, primary_key=True)
    dispatch_date = db.Column(db.Date, nullable=False, default=date.today)
    beat_name = db.Column(db.String(120), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=True)
    helper_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=True)
    crates_everest = db.Column(db.Integer, nullable=False, default=0)
    cartons_colgate = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(30), nullable=False, default='Dispatched')  # Dispatched, Completed
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    driver = db.relationship('Worker', foreign_keys=[driver_id], lazy=True)
    helper = db.relationship('Worker', foreign_keys=[helper_id], lazy=True)

    def __repr__(self):
        return f"<DispatchBeat #{self.id} Beat={self.beat_name} Date={self.dispatch_date}>"


class DamagedReturn(db.Model):
    __tablename__ = 'damaged_returns'

    id = db.Column(db.Integer, primary_key=True)
    return_date = db.Column(db.Date, nullable=False, default=date.today)
    brand = db.Column(db.String(50), nullable=False)  # Everest Spices, Colgate-Palmolive
    product_name = db.Column(db.String(150), nullable=False)
    retailer_name = db.Column(db.String(150), nullable=False)
    batch_no = db.Column(db.String(50), nullable=True)
    expiry_date = db.Column(db.String(30), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit = db.Column(db.String(30), nullable=False, default='Cartons')  # Cartons, Packets, Tubes, Boxes
    reason = db.Column(db.String(100), nullable=False, default='Damaged in Transit')  # Expired, Damaged in Transit, Packaging Leaking, Seal Broken
    claim_status = db.Column(db.String(50), nullable=False, default='Pending Inspection')  # Pending Inspection, Submitted to Depot, Credit Note Received, Rejected
    credit_note_amount = db.Column(db.Float, nullable=False, default=0.0)
    credit_note_number = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return f"<DamagedReturn #{self.id} Brand={self.brand} Product={self.product_name}>"


class SalarySettlement(db.Model):
    __tablename__ = 'salary_settlements'

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=False)
    month_year = db.Column(db.String(7), nullable=False)  # YYYY-MM
    days_present = db.Column(db.Float, nullable=False, default=0.0)
    half_days = db.Column(db.Float, nullable=False, default=0.0)
    paid_leaves = db.Column(db.Float, nullable=False, default=0.0)
    absent_days = db.Column(db.Float, nullable=False, default=0.0)
    effective_days = db.Column(db.Float, nullable=False, default=0.0)
    daily_wage = db.Column(db.Float, nullable=False, default=0.0)
    gross_earnings = db.Column(db.Float, nullable=False, default=0.0)
    advances_deducted = db.Column(db.Float, nullable=False, default=0.0)
    bonus_incentive = db.Column(db.Float, nullable=False, default=0.0)
    net_payout = db.Column(db.Float, nullable=False, default=0.0)
    settlement_date = db.Column(db.Date, nullable=False, default=date.today)
    payment_mode = db.Column(db.String(30), nullable=False, default='Cash')  # Cash, Bank Transfer, UPI
    payment_reference = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)

    # Linked advances settled in this payment
    settled_advances = db.relationship('Advance', backref='settlement', lazy=True)

    def __repr__(self):
        return f"<SalarySettlement #{self.id} Worker={self.worker_id} Month={self.month_year} Net={self.net_payout}>"
