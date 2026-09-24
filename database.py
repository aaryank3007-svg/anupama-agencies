import os
from datetime import date, timedelta
from models import db, Worker, Attendance, Advance, Vehicle, FuelExpense, DispatchBeat, DamagedReturn, SalarySettlement

def init_db(app):
    """
    Initializes the database and populates realistic mock data if tables are empty.
    """
    with app.app_context():
        # Ensure uploads directories exist
        os.makedirs(os.path.join(app.root_path, 'static', 'uploads', 'workers'), exist_ok=True)
        os.makedirs(os.path.join(app.root_path, 'static', 'uploads', 'receipts'), exist_ok=True)
        
        db.create_all()
        
        # Check if seed data is already present
        if Worker.query.first() is None:
            seed_initial_data()

def seed_initial_data():
    """
    Seeds realistic FMCG distribution data for Anupama Agencies.
    """
    today = date.today()
    
    # 1. Godown Workers
    w1 = Worker(
        name="Ramesh Kumar",
        phone="9823145670",
        emergency_contact="9823145671",
        role="Senior Delivery Van Driver",
        join_date=date(today.year - 2, 3, 15),
        daily_wage=700.0,
        monthly_salary=18200.0,
        status="Active"
    )
    w2 = Worker(
        name="Suresh Yadav",
        phone="9834123450",
        emergency_contact="9834123451",
        role="Godown Loader & Dispatcher",
        join_date=date(today.year - 1, 6, 10),
        daily_wage=550.0,
        monthly_salary=14300.0,
        status="Active"
    )
    w3 = Worker(
        name="Amit Sharma",
        phone="9765432100",
        emergency_contact="9765432101",
        role="Beat Delivery Van Driver",
        join_date=date(today.year - 1, 9, 1),
        daily_wage=650.0,
        monthly_salary=16900.0,
        status="Active"
    )
    w4 = Worker(
        name="Manoj Verma",
        phone="9922334455",
        emergency_contact="9922334456",
        role="Godown Helper & Stock Stacker",
        join_date=date(today.year, 1, 12),
        daily_wage=500.0,
        monthly_salary=13000.0,
        status="Active"
    )
    w5 = Worker(
        name="Rajesh Patel",
        phone="9811223344",
        emergency_contact="9811223345",
        role="Warehouse Supervisor",
        join_date=date(today.year - 3, 2, 1),
        daily_wage=800.0,
        monthly_salary=20800.0,
        status="Active"
    )

    db.session.add_all([w1, w2, w3, w4, w5])
    db.session.commit()

    # 2. Delivery Vehicles
    v1 = Vehicle(
        vehicle_number="MH-14-GH-4921",
        vehicle_name="Tata Ace Gold (Everest Spices Van)",
        vehicle_type="Delivery Van",
        fuel_type="Diesel",
        assigned_driver_id=w1.id,
        status="Active"
    )
    v2 = Vehicle(
        vehicle_number="MH-14-DT-1108",
        vehicle_name="Mahindra Bolero Maxi Truck (Colgate Van)",
        vehicle_type="Mini Truck",
        fuel_type="Diesel",
        assigned_driver_id=w3.id,
        status="Active"
    )
    v3 = Vehicle(
        vehicle_number="MH-14-AB-7732",
        vehicle_name="Piaggio Ape Auto (Wholesale City Beat)",
        vehicle_type="Auto Rickshaw",
        fuel_type="CNG",
        assigned_driver_id=None,
        status="Active"
    )

    db.session.add_all([v1, v2, v3])
    db.session.commit()

    # 3. Attendance for the current month up to today (day 1 to day 16)
    # We will seed realistic pattern
    workers = [w1, w2, w3, w4, w5]
    for d in range(1, min(today.day + 1, 28)):
        att_date = date(today.year, today.month, d)
        for idx, worker in enumerate(workers):
            # Create a realistic variation: mostly Present, occasional half day, Sunday off or present
            # Weekday check: if Sunday (weekday() == 6)
            if att_date.weekday() == 6:
                status = "Paid Leave" if idx % 2 == 0 else "Present"
            elif d == 4 and idx == 1:
                status = "Half Day"
            elif d == 9 and idx == 3:
                status = "Absent"
            elif d == 11 and idx == 2:
                status = "Half Day"
            elif d == 14 and idx == 4:
                status = "Paid Leave"
            else:
                status = "Present"
            
            att = Attendance(
                worker_id=worker.id,
                date=att_date,
                status=status,
                notes="Morning Shift Regular" if status == "Present" else f"Logged as {status}"
            )
            db.session.add(att)
    
    db.session.commit()

    # 4. Advance Payments & Khata Ledger
    adv1 = Advance(
        worker_id=w2.id,
        request_date=today - timedelta(days=12),
        payment_date=today - timedelta(days=12),
        amount_requested=2000.0,
        amount_paid=2000.0,
        payment_mode="Cash",
        reason="Home repair & plumbing material",
        status="Approved"
    )
    adv2 = Advance(
        worker_id=w2.id,
        request_date=today - timedelta(days=3),
        payment_date=today - timedelta(days=3),
        amount_requested=1500.0,
        amount_paid=1500.0,
        payment_mode="UPI",
        reason="Mother medical prescription",
        status="Approved"
    )
    adv3 = Advance(
        worker_id=w3.id,
        request_date=today - timedelta(days=8),
        payment_date=today - timedelta(days=8),
        amount_requested=3000.0,
        amount_paid=3000.0,
        payment_mode="Cash",
        reason="Children school admission fee",
        status="Approved"
    )
    adv4 = Advance(
        worker_id=w4.id,
        request_date=today - timedelta(days=5),
        payment_date=today - timedelta(days=5),
        amount_requested=1000.0,
        amount_paid=1000.0,
        payment_mode="Cash",
        reason="Festival grocery purchase",
        status="Approved"
    )
    adv5 = Advance(
        worker_id=w1.id,
        request_date=today - timedelta(days=35),
        payment_date=today - timedelta(days=35),
        amount_requested=2500.0,
        amount_paid=2500.0,
        payment_mode="Bank Transfer",
        reason="Vehicle tyre puncture & family trip",
        status="Settled"
    )

    db.session.add_all([adv1, adv2, adv3, adv4, adv5])
    db.session.commit()

    # 5. Fuel Expenses
    f1 = FuelExpense(
        vehicle_id=v1.id,
        driver_id=w1.id,
        date=today - timedelta(days=14),
        fuel_type="Diesel",
        amount_spent=2850.0,
        liters=31.6,
        odometer_reading=41250,
        notes="BPCL Highway Pump, Full Tank for Outstation Route"
    )
    f2 = FuelExpense(
        vehicle_id=v2.id,
        driver_id=w3.id,
        date=today - timedelta(days=10),
        fuel_type="Diesel",
        amount_spent=3200.0,
        liters=35.5,
        odometer_reading=28900,
        notes="Indian Oil Depot, Colgate Bulk Delivery to Rural Supermarkets"
    )
    f3 = FuelExpense(
        vehicle_id=v3.id,
        driver_id=w1.id,
        date=today - timedelta(days=6),
        fuel_type="CNG",
        amount_spent=850.0,
        liters=10.5,
        odometer_reading=15420,
        notes="MGL Station Sector 12 - Daily City Delivery"
    )
    f4 = FuelExpense(
        vehicle_id=v1.id,
        driver_id=w1.id,
        date=today - timedelta(days=2),
        fuel_type="Diesel",
        amount_spent=2500.0,
        liters=27.7,
        odometer_reading=41680,
        notes="HP Petrol Pump - Everest Spices Beat Refill"
    )

    db.session.add_all([f1, f2, f3, f4])
    db.session.commit()

    # 6. FMCG Daily Delivery / Beat Dispatches
    b1 = DispatchBeat(
        dispatch_date=today,
        beat_name="Main Bazaar & Wholesale Kirana Market",
        vehicle_id=v1.id,
        driver_id=w1.id,
        helper_id=w2.id,
        crates_everest=45,
        cartons_colgate=30,
        status="Dispatched",
        notes="Morning dispatch - 22 retail drop points"
    )
    b2 = DispatchBeat(
        dispatch_date=today,
        beat_name="Station Road & Central Supermarkets",
        vehicle_id=v2.id,
        driver_id=w3.id,
        helper_id=w4.id,
        crates_everest=35,
        cartons_colgate=52,
        status="Dispatched",
        notes="High volume Colgate Toothpaste & Everest Masala blend"
    )
    b3 = DispatchBeat(
        dispatch_date=today - timedelta(days=1),
        beat_name="Industrial Area & Factory Canteens",
        vehicle_id=v3.id,
        driver_id=w1.id,
        helper_id=w4.id,
        crates_everest=28,
        cartons_colgate=15,
        status="Completed",
        notes="All crates delivered and empty boxes returned"
    )

    db.session.add_all([b1, b2, b3])
    db.session.commit()

    # 7. Damaged / Expiry Returns (Everest & Colgate)
    r1 = DamagedReturn(
        return_date=today - timedelta(days=5),
        brand="Everest Spices",
        product_name="Everest Garam Masala 100g Carton",
        retailer_name="Shree Ganesh Kirana Stores",
        batch_no="EV-2026-GM88",
        expiry_date="2027-04",
        quantity=3,
        unit="Cartons",
        reason="Damaged in Transit",
        claim_status="Submitted to Depot",
        credit_note_amount=3600.0,
        notes="Outer cardboard crushed during truck transit from depot"
    )
    r2 = DamagedReturn(
        return_date=today - timedelta(days=3),
        brand="Colgate-Palmolive",
        product_name="Colgate MaxFresh Red Gel 150g",
        retailer_name="Laxmi Supermarket",
        batch_no="CG-0826-MF",
        expiry_date="2027-08",
        quantity=14,
        unit="Tubes",
        reason="Packaging Leakage",
        claim_status="Pending Inspection",
        credit_note_amount=1680.0,
        notes="Retailer reported crimp leakage inside case"
    )
    r3 = DamagedReturn(
        return_date=today - timedelta(days=12),
        brand="Everest Spices",
        product_name="Everest Pav Bhaji Masala 100g",
        retailer_name="Sai Krupa Provisions",
        batch_no="EV-0225-PB",
        expiry_date="2026-08",
        quantity=25,
        unit="Packets",
        reason="Expired",
        claim_status="Credit Note Received",
        credit_note_amount=2150.0,
        credit_note_number="CN-EVEREST-94021",
        notes="Credit note credited in distributor running ledger"
    )
    r4 = DamagedReturn(
        return_date=today - timedelta(days=1),
        brand="Colgate-Palmolive",
        product_name="Colgate Strong Teeth 200g Family Pack",
        retailer_name="National Daily Mart",
        batch_no="CG-0626-ST",
        expiry_date="2027-06",
        quantity=2,
        unit="Cartons",
        reason="Seal Broken",
        claim_status="Pending Inspection",
        credit_note_amount=4800.0,
        notes="Shrink wrap and tape seal torn on arrival"
    )

    db.session.add_all([r1, r2, r3, r4])
    db.session.commit()
