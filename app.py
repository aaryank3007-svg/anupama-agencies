import os
from datetime import datetime, date, timedelta
from calendar import monthrange
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from models import db, Worker, Attendance, Advance, Vehicle, FuelExpense, DispatchBeat, DamagedReturn, SalarySettlement
from database import init_db
from utils import format_inr, save_uploaded_file, export_csv_response

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'anupama-agencies-fmcg-distributor-secret-2026')

db_url = os.environ.get('DATABASE_URL', 'sqlite:///anupama_agencies.db')
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload

# Register Jinja context filters and functions
@app.template_filter('inr')
def inr_filter(value):
    return format_inr(value)

@app.context_processor
def inject_global_vars():
    today = date.today()
    return {
        'today': today,
        'current_year': today.year,
        'current_month': today.month,
        'now': datetime.now()
    }

# Initialize Database
db.init_app(app)
init_db(app)

# -------------------------------------------------------------------
# 1. DASHBOARD
# -------------------------------------------------------------------
@app.route('/')
def dashboard():
    today = date.today()
    
    # Active workers
    active_workers = Worker.query.filter_by(status='Active').all()
    total_workers_count = len(active_workers)
    
    # Today's attendance
    today_attendances = Attendance.query.filter_by(date=today).all()
    present_today = sum(1 for a in today_attendances if a.status in ('Present', 'Paid Leave'))
    half_day_today = sum(1 for a in today_attendances if a.status == 'Half Day')
    absent_today = sum(1 for a in today_attendances if a.status == 'Absent')
    marked_count = len(today_attendances)
    unmarked_count = max(0, total_workers_count - marked_count)
    
    # Pending advances across all workers
    total_pending_advances = sum(w.total_advances_pending for w in active_workers)
    
    # Fuel metrics: Current month vs previous month
    cur_year, cur_month = today.year, today.month
    if cur_month == 1:
        prev_year, prev_month = cur_year - 1, 12
    else:
        prev_year, prev_month = cur_year, cur_month - 1
        
    all_fuel = FuelExpense.query.all()
    cur_month_fuel = sum(f.amount_spent for f in all_fuel if f.date.year == cur_year and f.date.month == cur_month)
    prev_month_fuel = sum(f.amount_spent for f in all_fuel if f.date.year == prev_year and f.date.month == prev_month)
    
    fuel_diff_pct = 0
    if prev_month_fuel > 0:
        fuel_diff_pct = round(((cur_month_fuel - prev_month_fuel) / prev_month_fuel) * 100, 1)

    # Active beat dispatches today
    today_dispatches = DispatchBeat.query.filter_by(dispatch_date=today).all()
    active_beats_count = sum(1 for b in today_dispatches if b.status == 'Dispatched')
    
    # Pending damaged/expiry claims awaiting credit note
    pending_claims = DamagedReturn.query.filter(DamagedReturn.claim_status.in_(['Pending Inspection', 'Submitted to Depot'])).all()
    total_pending_claim_value = sum(c.credit_note_amount for c in pending_claims)
    
    # Recent Activities: last 5 dispatches and last 5 advances
    recent_dispatches = DispatchBeat.query.order_by(DispatchBeat.dispatch_date.desc(), DispatchBeat.id.desc()).limit(5).all()
    recent_advances = Advance.query.order_by(Advance.payment_date.desc(), Advance.id.desc()).limit(5).all()
    
    # Fuel Trend for the last 6 months for Chart.js
    monthly_fuel_labels = []
    monthly_fuel_data = []
    temp_date = date(cur_year, cur_month, 1)
    for i in range(5, -1, -1):
        m_date = (temp_date.replace(day=1) - timedelta(days=i * 28)).replace(day=1)
        label = m_date.strftime('%b %Y')
        total_spent = sum(f.amount_spent for f in all_fuel if f.date.year == m_date.year and f.date.month == m_date.month)
        monthly_fuel_labels.append(label)
        monthly_fuel_data.append(total_spent)
        
    return render_template(
        'dashboard.html',
        total_workers_count=total_workers_count,
        present_today=present_today,
        half_day_today=half_day_today,
        absent_today=absent_today,
        unmarked_count=unmarked_count,
        total_pending_advances=total_pending_advances,
        cur_month_fuel=cur_month_fuel,
        prev_month_fuel=prev_month_fuel,
        fuel_diff_pct=fuel_diff_pct,
        today_dispatches=today_dispatches,
        active_beats_count=active_beats_count,
        pending_claims_count=len(pending_claims),
        total_pending_claim_value=total_pending_claim_value,
        recent_dispatches=recent_dispatches,
        recent_advances=recent_advances,
        monthly_fuel_labels=monthly_fuel_labels,
        monthly_fuel_data=monthly_fuel_data
    )


# -------------------------------------------------------------------
# 2. WORKERS MANAGEMENT & PROFILES
# -------------------------------------------------------------------
@app.route('/workers')
def workers_list():
    role_filter = request.args.get('role', '')
    status_filter = request.args.get('status', 'Active')
    search = request.args.get('q', '').strip().lower()
    
    query = Worker.query
    if role_filter:
        query = query.filter(Worker.role.ilike(f"%{role_filter}%"))
    if status_filter and status_filter != 'All':
        query = query.filter_by(status=status_filter)
        
    workers = query.order_by(Worker.name).all()
    if search:
        workers = [w for w in workers if search in w.name.lower() or search in w.phone or search in w.role.lower()]
        
    today = date.today()
    # Compute current month working metrics for each worker
    worker_stats = []
    for w in workers:
        effective_days = w.days_worked_in_month(today.year, today.month)
        pending_adv = w.total_advances_pending
        earned = effective_days * w.daily_wage
        worker_stats.append({
            'worker': w,
            'effective_days': effective_days,
            'pending_adv': pending_adv,
            'earned': earned
        })
        
    roles = ['Senior Delivery Van Driver', 'Godown Loader & Dispatcher', 'Beat Delivery Van Driver', 'Godown Helper & Stock Stacker', 'Warehouse Supervisor']
    return render_template('workers/index.html', worker_stats=worker_stats, roles=roles, selected_role=role_filter, selected_status=status_filter, search=search)


@app.route('/workers/add', methods=['POST'])
def add_worker():
    name = request.form.get('name', '').strip()
    phone = request.form.get('phone', '').strip()
    emergency_contact = request.form.get('emergency_contact', '').strip()
    role = request.form.get('role', '').strip()
    daily_wage = float(request.form.get('daily_wage') or 500.0)
    join_date_str = request.form.get('join_date')
    join_date_val = datetime.strptime(join_date_str, '%Y-%m-%d').date() if join_date_str else date.today()
    
    photo_file = request.files.get('photo')
    photo_path = ''
    if photo_file:
        upload_folder = os.path.join(app.root_path, 'static', 'uploads', 'workers')
        photo_path = save_uploaded_file(photo_file, upload_folder, prefix="worker")
        
    new_worker = Worker(
        name=name,
        phone=phone,
        emergency_contact=emergency_contact,
        role=role,
        daily_wage=daily_wage,
        monthly_salary=daily_wage * 26,
        join_date=join_date_val,
        photo_path=photo_path,
        status='Active'
    )
    db.session.add(new_worker)
    db.session.commit()
    flash(f"Worker '{name}' added successfully!", 'success')
    return redirect(url_for('workers_list'))


@app.route('/workers/<int:id>')
def worker_profile(id):
    worker = Worker.query.get_or_404(id)
    today = date.today()
    
    # Month selector
    year = int(request.args.get('year', today.year))
    month = int(request.args.get('month', today.month))
    
    # Worker metrics
    att_summary = worker.attendance_summary_in_month(year, month)
    attendances = Attendance.query.filter(
        Attendance.worker_id == worker.id,
        db.extract('year', Attendance.date) == year,
        db.extract('month', Attendance.date) == month
    ).order_by(Attendance.date.desc()).all()
    
    advances = Advance.query.filter_by(worker_id=worker.id).order_by(Advance.payment_date.desc()).all()
    settlements = SalarySettlement.query.filter_by(worker_id=worker.id).order_by(SalarySettlement.settlement_date.desc()).all()
    
    earned_gross = att_summary['effective_days'] * worker.daily_wage
    est_net = max(0.0, earned_gross - worker.total_advances_pending)
    
    return render_template(
        'workers/view.html',
        worker=worker,
        year=year,
        month=month,
        att_summary=att_summary,
        attendances=attendances,
        advances=advances,
        settlements=settlements,
        earned_gross=earned_gross,
        est_net=est_net
    )


@app.route('/workers/<int:id>/edit', methods=['POST'])
def edit_worker(id):
    worker = Worker.query.get_or_404(id)
    worker.name = request.form.get('name', worker.name).strip()
    worker.phone = request.form.get('phone', worker.phone).strip()
    worker.emergency_contact = request.form.get('emergency_contact', worker.emergency_contact).strip()
    worker.role = request.form.get('role', worker.role).strip()
    worker.daily_wage = float(request.form.get('daily_wage') or worker.daily_wage)
    worker.monthly_salary = worker.daily_wage * 26
    worker.status = request.form.get('status', worker.status)
    
    photo_file = request.files.get('photo')
    if photo_file and photo_file.filename:
        upload_folder = os.path.join(app.root_path, 'static', 'uploads', 'workers')
        new_photo = save_uploaded_file(photo_file, upload_folder, prefix="worker")
        if new_photo:
            worker.photo_path = new_photo
            
    db.session.commit()
    flash(f"Updated profile for '{worker.name}'", 'success')
    return redirect(url_for('worker_profile', id=worker.id))


# -------------------------------------------------------------------
# 3. ATTENDANCE REGISTER (DAILY & MONTHLY)
# -------------------------------------------------------------------
@app.route('/attendance')
def attendance_register():
    date_str = request.args.get('date')
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            target_date = date.today()
    else:
        target_date = date.today()
        
    active_workers = Worker.query.filter_by(status='Active').order_by(Worker.name).all()
    
    # Fetch existing attendances for target_date
    existing_recs = Attendance.query.filter_by(date=target_date).all()
    att_dict = {a.worker_id: a for a in existing_recs}
    
    items = []
    for w in active_workers:
        rec = att_dict.get(w.id)
        items.append({
            'worker': w,
            'status': rec.status if rec else 'Present',
            'notes': rec.notes if rec else '',
            'is_saved': rec is not None
        })
        
    return render_template('attendance/register.html', target_date=target_date, items=items)


@app.route('/attendance/save', methods=['POST'])
def save_attendance():
    date_str = request.form.get('date')
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
    
    active_workers = Worker.query.filter_by(status='Active').all()
    for w in active_workers:
        status = request.form.get(f"status_{w.id}", "Present")
        notes = request.form.get(f"notes_{w.id}", "")
        
        att = Attendance.query.filter_by(worker_id=w.id, date=target_date).first()
        if att:
            att.status = status
            att.notes = notes
        else:
            att = Attendance(
                worker_id=w.id,
                date=target_date,
                status=status,
                notes=notes
            )
            db.session.add(att)
            
    db.session.commit()
    flash(f"Attendance for {target_date.strftime('%d %b %Y')} successfully saved!", "success")
    return redirect(url_for('attendance_register', date=target_date.strftime('%Y-%m-%d')))


@app.route('/attendance/monthly')
def monthly_attendance():
    today = date.today()
    year = int(request.args.get('year', today.year))
    month = int(request.args.get('month', today.month))
    
    days_in_month = monthrange(year, month)[1]
    days_list = [date(year, month, d) for d in range(1, days_in_month + 1)]
    
    active_workers = Worker.query.filter_by(status='Active').order_by(Worker.name).all()
    
    # Matrix of worker attendance by day
    matrix = []
    for w in active_workers:
        records = Attendance.query.filter(
            Attendance.worker_id == w.id,
            db.extract('year', Attendance.date) == year,
            db.extract('month', Attendance.date) == month
        ).all()
        rec_map = {r.date.day: r.status for r in records}
        
        summary = w.attendance_summary_in_month(year, month)
        matrix.append({
            'worker': w,
            'days': [rec_map.get(d.day, '-') for d in days_list],
            'summary': summary
        })
        
    return render_template(
        'attendance/monthly.html',
        year=year,
        month=month,
        days_list=days_list,
        matrix=matrix
    )


# -------------------------------------------------------------------
# 4. ADVANCE PAYMENT & KHATA LEDGER
# -------------------------------------------------------------------
@app.route('/advances')
def advances_ledger():
    worker_filter = request.args.get('worker_id', '')
    status_filter = request.args.get('status', '')
    
    query = Advance.query
    if worker_filter:
        query = query.filter_by(worker_id=int(worker_filter))
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    advances = query.order_by(Advance.payment_date.desc(), Advance.id.desc()).all()
    
    # Financial KPI summary
    all_advances = Advance.query.all()
    total_given = sum(a.amount_paid for a in all_advances if a.status in ('Approved', 'Settled'))
    total_pending = sum(a.amount_paid for a in all_advances if a.status == 'Approved')
    total_settled = sum(a.amount_paid for a in all_advances if a.status == 'Settled')
    
    active_workers = Worker.query.filter_by(status='Active').order_by(Worker.name).all()
    
    return render_template(
        'advances/index.html',
        advances=advances,
        active_workers=active_workers,
        total_given=total_given,
        total_pending=total_pending,
        total_settled=total_settled,
        selected_worker=worker_filter,
        selected_status=status_filter
    )


@app.route('/advances/add', methods=['POST'])
def add_advance():
    worker_id = int(request.form.get('worker_id'))
    amount = float(request.form.get('amount', 0))
    payment_mode = request.form.get('payment_mode', 'Cash')
    reason = request.form.get('reason', '').strip()
    req_date_str = request.form.get('request_date')
    pay_date_str = request.form.get('payment_date')
    
    req_date = datetime.strptime(req_date_str, '%Y-%m-%d').date() if req_date_str else date.today()
    pay_date = datetime.strptime(pay_date_str, '%Y-%m-%d').date() if pay_date_str else date.today()
    
    worker = Worker.query.get_or_404(worker_id)
    new_adv = Advance(
        worker_id=worker_id,
        request_date=req_date,
        payment_date=pay_date,
        amount_requested=amount,
        amount_paid=amount,
        payment_mode=payment_mode,
        reason=reason,
        status='Approved'
    )
    db.session.add(new_adv)
    db.session.commit()
    flash(f"Advance payment of {format_inr(amount)} recorded for {worker.name}", 'success')
    return redirect(url_for('advances_ledger'))


@app.route('/advances/<int:id>/status', methods=['POST'])
def update_advance_status(id):
    adv = Advance.query.get_or_404(id)
    new_status = request.form.get('status', adv.status)
    adv.status = new_status
    db.session.commit()
    flash(f"Advance #{adv.id} marked as {new_status}", 'success')
    return redirect(request.referrer or url_for('advances_ledger'))


# -------------------------------------------------------------------
# 5. DELIVERY VEHICLES & FUEL EXPENSE TRACKER
# -------------------------------------------------------------------
@app.route('/fuel')
def fuel_tracker():
    today = date.today()
    cur_year = int(request.args.get('year', today.year))
    cur_month = int(request.args.get('month', today.month))
    vehicle_filter = request.args.get('vehicle_id', '')
    
    query = FuelExpense.query
    if vehicle_filter:
        query = query.filter_by(vehicle_id=int(vehicle_filter))
        
    expenses = query.order_by(FuelExpense.date.desc(), FuelExpense.id.desc()).all()
    
    # Analytics for selected month
    monthly_expenses = [f for f in expenses if f.date.year == cur_year and f.date.month == cur_month]
    total_month_spent = sum(f.amount_spent for f in monthly_expenses)
    total_month_liters = sum(f.liters for f in monthly_expenses)
    
    # Previous month comparison
    if cur_month == 1:
        p_year, p_month = cur_year - 1, 12
    else:
        p_year, p_month = cur_year, cur_month - 1
    prev_month_spent = sum(f.amount_spent for f in expenses if f.date.year == p_year and f.date.month == p_month)
    
    vehicles = Vehicle.query.order_by(Vehicle.vehicle_name).all()
    drivers = Worker.query.filter(Worker.role.ilike('%driver%')).all()
    if not drivers:
        drivers = Worker.query.filter_by(status='Active').all()
        
    # Vehicle wise breakdown
    vehicle_stats = []
    for v in vehicles:
        v_fuel = [f for f in monthly_expenses if f.vehicle_id == v.id]
        v_spent = sum(f.amount_spent for f in v_fuel)
        v_liters = sum(f.liters for f in v_fuel)
        vehicle_stats.append({
            'vehicle': v,
            'spent': v_spent,
            'liters': v_liters,
            'fill_count': len(v_fuel)
        })
        
    return render_template(
        'fuel/index.html',
        expenses=expenses,
        monthly_expenses=monthly_expenses,
        vehicles=vehicles,
        drivers=drivers,
        total_month_spent=total_month_spent,
        total_month_liters=total_month_liters,
        prev_month_spent=prev_month_spent,
        vehicle_stats=vehicle_stats,
        cur_year=cur_year,
        cur_month=cur_month,
        selected_vehicle=vehicle_filter
    )


@app.route('/fuel/add', methods=['POST'])
def add_fuel_expense():
    vehicle_id = int(request.form.get('vehicle_id'))
    driver_id = request.form.get('driver_id')
    driver_id_val = int(driver_id) if driver_id else None
    fuel_type = request.form.get('fuel_type', 'Diesel')
    amount_spent = float(request.form.get('amount_spent', 0))
    liters = float(request.form.get('liters') or 0)
    odometer = request.form.get('odometer_reading')
    odometer_val = int(odometer) if odometer else None
    notes = request.form.get('notes', '').strip()
    date_str = request.form.get('date')
    fuel_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
    
    receipt_file = request.files.get('receipt')
    receipt_path = ''
    if receipt_file:
        upload_folder = os.path.join(app.root_path, 'static', 'uploads', 'receipts')
        receipt_path = save_uploaded_file(receipt_file, upload_folder, prefix="fuel_slip")
        
    new_expense = FuelExpense(
        vehicle_id=vehicle_id,
        driver_id=driver_id_val,
        date=fuel_date,
        fuel_type=fuel_type,
        amount_spent=amount_spent,
        liters=liters,
        odometer_reading=odometer_val,
        receipt_image=receipt_path,
        notes=notes
    )
    db.session.add(new_expense)
    db.session.commit()
    flash(f"Logged fuel expense of {format_inr(amount_spent)} successfully!", "success")
    return redirect(url_for('fuel_tracker'))


@app.route('/fuel/vehicles')
def vehicles_registry():
    vehicles = Vehicle.query.order_by(Vehicle.vehicle_name).all()
    drivers = Worker.query.filter_by(status='Active').all()
    return render_template('fuel/vehicles.html', vehicles=vehicles, drivers=drivers)


@app.route('/fuel/vehicles/add', methods=['POST'])
def add_vehicle():
    vehicle_number = request.form.get('vehicle_number', '').strip().upper()
    vehicle_name = request.form.get('vehicle_name', '').strip()
    vehicle_type = request.form.get('vehicle_type', 'Delivery Van')
    fuel_type = request.form.get('fuel_type', 'Diesel')
    driver_id = request.form.get('assigned_driver_id')
    driver_id_val = int(driver_id) if driver_id else None
    
    veh = Vehicle(
        vehicle_number=vehicle_number,
        vehicle_name=vehicle_name,
        vehicle_type=vehicle_type,
        fuel_type=fuel_type,
        assigned_driver_id=driver_id_val,
        status='Active'
    )
    db.session.add(veh)
    db.session.commit()
    flash(f"Vehicle '{vehicle_number}' registered successfully!", 'success')
    return redirect(url_for('vehicles_registry'))


# -------------------------------------------------------------------
# 6. FMCG DAILY DELIVERY / BEAT DISPATCH TRACKER
# -------------------------------------------------------------------
@app.route('/dispatches')
def beat_dispatches():
    today = date.today()
    date_filter = request.args.get('date', '')
    query = DispatchBeat.query
    if date_filter:
        try:
            target_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
            query = query.filter_by(dispatch_date=target_date)
        except ValueError:
            pass
            
    dispatches = query.order_by(DispatchBeat.dispatch_date.desc(), DispatchBeat.id.desc()).all()
    vehicles = Vehicle.query.filter_by(status='Active').all()
    workers = Worker.query.filter_by(status='Active').all()
    
    # Total crates dispatched today
    today_dispatches = [d for d in dispatches if d.dispatch_date == today]
    total_everest_crates = sum(d.crates_everest for d in today_dispatches)
    total_colgate_cartons = sum(d.cartons_colgate for d in today_dispatches)
    
    return render_template(
        'dispatches/index.html',
        dispatches=dispatches,
        vehicles=vehicles,
        workers=workers,
        selected_date=date_filter,
        total_everest_crates=total_everest_crates,
        total_colgate_cartons=total_colgate_cartons
    )


@app.route('/dispatches/add', methods=['POST'])
def add_dispatch():
    beat_name = request.form.get('beat_name', '').strip()
    vehicle_id = int(request.form.get('vehicle_id'))
    driver_id = request.form.get('driver_id')
    driver_id_val = int(driver_id) if driver_id else None
    helper_id = request.form.get('helper_id')
    helper_id_val = int(helper_id) if helper_id else None
    crates_everest = int(request.form.get('crates_everest') or 0)
    cartons_colgate = int(request.form.get('cartons_colgate') or 0)
    notes = request.form.get('notes', '').strip()
    date_str = request.form.get('dispatch_date')
    dispatch_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
    
    b = DispatchBeat(
        dispatch_date=dispatch_date,
        beat_name=beat_name,
        vehicle_id=vehicle_id,
        driver_id=driver_id_val,
        helper_id=helper_id_val,
        crates_everest=crates_everest,
        cartons_colgate=cartons_colgate,
        status='Dispatched',
        notes=notes
    )
    db.session.add(b)
    db.session.commit()
    flash(f"Dispatch for beat '{beat_name}' recorded!", "success")
    return redirect(url_for('beat_dispatches'))


@app.route('/dispatches/<int:id>/status', methods=['POST'])
def update_dispatch_status(id):
    dispatch = DispatchBeat.query.get_or_404(id)
    new_status = request.form.get('status', 'Completed')
    dispatch.status = new_status
    db.session.commit()
    flash(f"Beat dispatch marked as {new_status}!", 'success')
    return redirect(url_for('beat_dispatches'))


# -------------------------------------------------------------------
# 7. DAMAGED / EXPIRY RETURN LOG (EVEREST & COLGATE)
# -------------------------------------------------------------------
@app.route('/returns')
def returns_tracker():
    brand_filter = request.args.get('brand', '')
    status_filter = request.args.get('status', '')
    
    query = DamagedReturn.query
    if brand_filter:
        query = query.filter_by(brand=brand_filter)
    if status_filter:
        query = query.filter_by(claim_status=status_filter)
        
    returns = query.order_by(DamagedReturn.return_date.desc(), DamagedReturn.id.desc()).all()
    
    total_claims = sum(r.credit_note_amount for r in returns)
    pending_credit_amount = sum(r.credit_note_amount for r in returns if r.claim_status in ('Pending Inspection', 'Submitted to Depot'))
    credited_amount = sum(r.credit_note_amount for r in returns if r.claim_status == 'Credit Note Received')
    
    return render_template(
        'returns/index.html',
        returns=returns,
        total_claims=total_claims,
        pending_credit_amount=pending_credit_amount,
        credited_amount=credited_amount,
        selected_brand=brand_filter,
        selected_status=status_filter
    )


@app.route('/returns/add', methods=['POST'])
def add_return():
    brand = request.form.get('brand', 'Everest Spices')
    product_name = request.form.get('product_name', '').strip()
    retailer_name = request.form.get('retailer_name', '').strip()
    batch_no = request.form.get('batch_no', '').strip()
    expiry_date = request.form.get('expiry_date', '').strip()
    quantity = int(request.form.get('quantity') or 1)
    unit = request.form.get('unit', 'Cartons')
    reason = request.form.get('reason', 'Damaged in Transit')
    claim_amount = float(request.form.get('credit_note_amount') or 0.0)
    notes = request.form.get('notes', '').strip()
    date_str = request.form.get('return_date')
    return_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
    
    ret = DamagedReturn(
        return_date=return_date,
        brand=brand,
        product_name=product_name,
        retailer_name=retailer_name,
        batch_no=batch_no,
        expiry_date=expiry_date,
        quantity=quantity,
        unit=unit,
        reason=reason,
        claim_status='Pending Inspection',
        credit_note_amount=claim_amount,
        notes=notes
    )
    db.session.add(ret)
    db.session.commit()
    flash(f"Damaged return logged for '{product_name}'", "success")
    return redirect(url_for('returns_tracker'))


@app.route('/returns/<int:id>/update-claim', methods=['POST'])
def update_return_claim(id):
    ret = DamagedReturn.query.get_or_404(id)
    ret.claim_status = request.form.get('claim_status', ret.claim_status)
    ret.credit_note_amount = float(request.form.get('credit_note_amount') or ret.credit_note_amount)
    ret.credit_note_number = request.form.get('credit_note_number', ret.credit_note_number)
    db.session.commit()
    flash(f"Claim status updated for '{ret.product_name}'", "success")
    return redirect(url_for('returns_tracker'))


# -------------------------------------------------------------------
# 8. MONTHLY SALARY & ADVANCE SETTLEMENT CALCULATOR
# -------------------------------------------------------------------
@app.route('/settlements')
def settlements_calculator():
    today = date.today()
    year = int(request.args.get('year', today.year))
    month = int(request.args.get('month', today.month))
    month_str = f"{year}-{month:02d}"
    
    active_workers = Worker.query.filter_by(status='Active').order_by(Worker.name).all()
    
    settlement_cards = []
    for w in active_workers:
        att = w.attendance_summary_in_month(year, month)
        eff_days = att['effective_days']
        gross = eff_days * w.daily_wage
        pending_advances = w.total_advances_pending
        
        # Max auto deduction is min(pending_advances, gross)
        auto_deduction = min(pending_advances, gross)
        net_pay = gross - auto_deduction
        
        # Check if already settled this month
        existing_settlement = SalarySettlement.query.filter_by(worker_id=w.id, month_year=month_str).first()
        
        settlement_cards.append({
            'worker': w,
            'att': att,
            'effective_days': eff_days,
            'gross': gross,
            'pending_advances': pending_advances,
            'auto_deduction': auto_deduction,
            'net_pay': net_pay,
            'settlement': existing_settlement
        })
        
    return render_template(
        'settlements/index.html',
        year=year,
        month=month,
        month_str=month_str,
        settlement_cards=settlement_cards
    )


@app.route('/settlements/process', methods=['POST'])
def process_settlement():
    worker_id = int(request.form.get('worker_id'))
    month_year = request.form.get('month_year')
    worker = Worker.query.get_or_404(worker_id)
    
    parts = month_year.split('-')
    year, month = int(parts[0]), int(parts[1])
    
    att = worker.attendance_summary_in_month(year, month)
    eff_days = att['effective_days']
    daily_wage = worker.daily_wage
    gross = eff_days * daily_wage
    
    advances_deducted = float(request.form.get('advances_deducted', 0))
    bonus_incentive = float(request.form.get('bonus_incentive', 0))
    payment_mode = request.form.get('payment_mode', 'Cash')
    payment_ref = request.form.get('payment_reference', '').strip()
    notes = request.form.get('notes', '').strip()
    
    net_payout = max(0.0, (gross - advances_deducted) + bonus_incentive)
    
    # Check if settlement already exists for this month
    settlement = SalarySettlement.query.filter_by(worker_id=worker_id, month_year=month_year).first()
    if not settlement:
        settlement = SalarySettlement(
            worker_id=worker_id,
            month_year=month_year,
            days_present=att['present'],
            half_days=att['half_day'],
            paid_leaves=att['paid_leave'],
            absent_days=att['absent'],
            effective_days=eff_days,
            daily_wage=daily_wage,
            gross_earnings=gross,
            advances_deducted=advances_deducted,
            bonus_incentive=bonus_incentive,
            net_payout=net_payout,
            settlement_date=date.today(),
            payment_mode=payment_mode,
            payment_reference=payment_ref,
            notes=notes
        )
        db.session.add(settlement)
        db.session.flush()
    else:
        settlement.days_present = att['present']
        settlement.half_days = att['half_day']
        settlement.paid_leaves = att['paid_leave']
        settlement.absent_days = att['absent']
        settlement.effective_days = eff_days
        settlement.daily_wage = daily_wage
        settlement.gross_earnings = gross
        settlement.advances_deducted = advances_deducted
        settlement.bonus_incentive = bonus_incentive
        settlement.net_payout = net_payout
        settlement.settlement_date = date.today()
        settlement.payment_mode = payment_mode
        settlement.payment_reference = payment_ref
        settlement.notes = notes

    # Deduct / settle worker's approved advances up to advances_deducted amount
    remaining_deduction = advances_deducted
    approved_advances = Advance.query.filter_by(worker_id=worker_id, status='Approved').order_by(Advance.payment_date).all()
    for adv in approved_advances:
        if remaining_deduction <= 0:
            break
        if adv.amount_paid <= remaining_deduction:
            remaining_deduction -= adv.amount_paid
            adv.status = 'Settled'
            adv.settlement_id = settlement.id
        else:
            # Partially deduct: we keep this advance settled with new partial record or split
            adv.status = 'Settled'
            adv.settlement_id = settlement.id
            remaining_balance = adv.amount_paid - remaining_deduction
            remaining_deduction = 0
            # Create a balance advance
            bal_adv = Advance(
                worker_id=worker_id,
                request_date=adv.request_date,
                payment_date=adv.payment_date,
                amount_requested=remaining_balance,
                amount_paid=remaining_balance,
                payment_mode=adv.payment_mode,
                reason=f"Remaining balance from Advance #{adv.id}",
                status='Approved'
            )
            db.session.add(bal_adv)

    db.session.commit()
    flash(f"Monthly settlement completed for {worker.name}! Net payout: {format_inr(net_payout)}", "success")
    return redirect(url_for('settlement_voucher', id=settlement.id))


@app.route('/settlements/voucher/<int:id>')
def settlement_voucher(id):
    settlement = SalarySettlement.query.get_or_404(id)
    return render_template('settlements/voucher.html', settlement=settlement)


# -------------------------------------------------------------------
# 9. EXCEL / CSV EXPORTS
# -------------------------------------------------------------------
@app.route('/export/attendance')
def export_attendance_csv():
    records = Attendance.query.join(Worker).order_by(Attendance.date.desc()).all()
    headers = ['Attendance ID', 'Date', 'Worker Name', 'Role', 'Status', 'Notes']
    rows = []
    for r in records:
        rows.append([
            r.id,
            r.date.strftime('%Y-%m-%d'),
            r.worker.name,
            r.worker.role,
            r.status,
            r.notes or ''
        ])
    return export_csv_response('Anupama_Agencies_Attendance_Register.csv', headers, rows)


@app.route('/export/advances')
def export_advances_csv():
    records = Advance.query.join(Worker).order_by(Advance.payment_date.desc()).all()
    headers = ['Advance ID', 'Worker Name', 'Role', 'Request Date', 'Payment Date', 'Amount Paid (INR)', 'Payment Mode', 'Reason', 'Status']
    rows = []
    for r in records:
        rows.append([
            r.id,
            r.worker.name,
            r.worker.role,
            r.request_date.strftime('%Y-%m-%d'),
            r.payment_date.strftime('%Y-%m-%d'),
            r.amount_paid,
            r.payment_mode,
            r.reason or '',
            r.status
        ])
    return export_csv_response('Anupama_Agencies_Khata_Advances.csv', headers, rows)


@app.route('/export/fuel')
def export_fuel_csv():
    records = FuelExpense.query.join(Vehicle).order_by(FuelExpense.date.desc()).all()
    headers = ['Expense ID', 'Date', 'Vehicle Number', 'Vehicle Name', 'Driver', 'Fuel Type', 'Amount Spent (INR)', 'Liters', 'Odometer Reading', 'Notes']
    rows = []
    for r in records:
        driver_name = r.driver.name if r.driver else 'Unassigned'
        rows.append([
            r.id,
            r.date.strftime('%Y-%m-%d'),
            r.vehicle.vehicle_number,
            r.vehicle.vehicle_name,
            driver_name,
            r.fuel_type,
            r.amount_spent,
            r.liters,
            r.odometer_reading or '',
            r.notes or ''
        ])
    return export_csv_response('Anupama_Agencies_Fuel_Expenses.csv', headers, rows)


@app.route('/export/settlements')
def export_settlements_csv():
    records = SalarySettlement.query.join(Worker).order_by(SalarySettlement.settlement_date.desc()).all()
    headers = ['Settlement ID', 'Month-Year', 'Worker Name', 'Role', 'Effective Days', 'Daily Wage (INR)', 'Gross Earnings (INR)', 'Advances Deducted (INR)', 'Bonus/Incentive (INR)', 'Net Payout (INR)', 'Payment Date', 'Payment Mode', 'Reference']
    rows = []
    for r in records:
        rows.append([
            r.id,
            r.month_year,
            r.worker.name,
            r.worker.role,
            r.effective_days,
            r.daily_wage,
            r.gross_earnings,
            r.advances_deducted,
            r.bonus_incentive,
            r.net_payout,
            r.settlement_date.strftime('%Y-%m-%d'),
            r.payment_mode,
            r.payment_reference or ''
        ])
    return export_csv_response('Anupama_Agencies_Salary_Settlements.csv', headers, rows)


@app.route('/export/returns')
def export_returns_csv():
    records = DamagedReturn.query.order_by(DamagedReturn.return_date.desc()).all()
    headers = ['Return ID', 'Date', 'Brand', 'Product Name', 'Retailer Name', 'Batch No', 'Expiry Date', 'Quantity', 'Unit', 'Reason', 'Claim Status', 'Credit Note Amount (INR)', 'Credit Note Number', 'Notes']
    rows = []
    for r in records:
        rows.append([
            r.id,
            r.return_date.strftime('%Y-%m-%d'),
            r.brand,
            r.product_name,
            r.retailer_name,
            r.batch_no or '',
            r.expiry_date or '',
            r.quantity,
            r.unit,
            r.reason,
            r.claim_status,
            r.credit_note_amount,
            r.credit_note_number or '',
            r.notes or ''
        ])
    return export_csv_response('Anupama_Agencies_Damaged_Expiry_Returns.csv', headers, rows)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1')
    app.run(host='0.0.0.0', port=port, debug=debug)
