"""
Script to generate a comprehensive, professional PDF documentation manual
explaining the Anupama Agencies FMCG Distribution Web Application.
"""
import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to calculate total page count and draw running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip running header/footer on title page
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, 11 * inch - 36, "Anupama Agencies — FMCG Distribution Management Portal (Technical Manual)")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer
        self.line(54, 46, 8.5 * inch - 54, 46)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_str)
        self.drawString(54, 32, "Confidential & Proprietary — Python 3.14 & Flask Architecture Guide")
        self.restoreState()


def build_pdf(filename="Anupama_Agencies_Project_Explanation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#004B87")     # Colgate Trust Blue
    SECONDARY = colors.HexColor("#C41E3A")   # Everest Spice Red
    DARK_TEXT = colors.HexColor("#0F172A")   # Slate 900
    MUTED_TEXT = colors.HexColor("#475569")  # Slate 600
    BG_LIGHT = colors.HexColor("#F8FAFC")    # Slate 50
    CARD_BORDER = colors.HexColor("#E2E8F0") # Slate 200
    CODE_BG = colors.HexColor("#F1F5F9")     # Slate 100
    ACCENT_GREEN = colors.HexColor("#059669")# Emerald

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=MUTED_TEXT,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=21,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=DARK_TEXT,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B"),
        backColor=CODE_BG,
        borderColor=CARD_BORDER,
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6,
        keepWithNext=False
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=DARK_TEXT
    )

    story = []

    # ==========================================
    # COVER / HEADER SECTION
    # ==========================================
    story.append(Paragraph("ANUPAMA AGENCIES", ParagraphStyle(
        'SuperTitle', fontName='Helvetica-Bold', fontSize=10, textColor=SECONDARY, spaceAfter=4
    )))
    story.append(Paragraph("FMCG Distribution Management System", title_style))
    story.append(Paragraph(
        "Complete Technical Architecture, Python Source Code Breakdown, Database Design, and Operational Documentation for Authorized FMCG Dealership (Everest Spices & Colgate-Palmolive).",
        subtitle_style
    ))

    # Meta Info Card
    meta_table_data = [
        [Paragraph("<b>System Version:</b> 2.0 (Production)", body_style),
         Paragraph("<b>Primary Language:</b> Python 3.14", body_style)],
        [Paragraph("<b>Framework:</b> Flask 3.1 & SQLAlchemy ORM", body_style),
         Paragraph("<b>Database:</b> SQLite (anupama_agencies.db)", body_style)],
        [Paragraph("<b>Frontend:</b> Jinja2, TailwindCSS, Chart.js", body_style),
         Paragraph("<b>Documentation Date:</b> September 2026", body_style)],
    ]
    meta_table = Table(meta_table_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.75, CARD_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # SECTION 1: EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # ==========================================
    story.append(Paragraph("1. Executive Summary & Business Context", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))
    
    story.append(Paragraph(
        "<b>Anupama Agencies</b> is an authorized FMCG super-stockist and distributor representing leading Indian multinational brands: <b>Everest Spices</b> (blended & pure spice formulations) and <b>Colgate-Palmolive India Ltd.</b> (oral healthcare and hygiene goods). Operating an FMCG dealership requires coordinated logistics between godown warehousing, beat delivery to hundreds of kirana retail outlets, staff attendance, advance cash disbursements, fleet fuel expenses, and damaged goods reconciliation.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Challenge:</b> Traditionally, distribution agencies rely on physical muster rolls, paper khata notebooks, and disconnected spreadsheets. This introduces critical operational errors:",
        body_style
    ))
    story.append(Paragraph("• <b>Khata Slip Leakage:</b> Cash advances given to godown workers and drivers are frequently forgotten or dispute-prone during monthly wage disbursement.", bullet_style))
    story.append(Paragraph("• <b>Fuel & Fleet Opacity:</b> High diesel expenditures for mini-trucks and delivery vans lack odometer verification and receipt cross-checking.", bullet_style))
    story.append(Paragraph("• <b>Beat Reconciliation Delays:</b> Morning crate dispatches (Everest crates and Colgate cartons) are not tied to driver/helper pairs, obscuring delivery bottlenecks.", bullet_style))
    story.append(Paragraph("• <b>Manufacturer Claim Loss:</b> Transit damage and expiry returns from retailers are delayed in submission to depot, causing credit note claims to expire.", bullet_style))
    story.append(Paragraph(
        "<b>The Solution:</b> A high-performance, Python-driven centralized web portal that brings complete digital transparency, real-time calculation, automated muster roll generation, printable payment vouchers, and Excel-compatible data exports.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 2: SYSTEM ARCHITECTURE
    # ==========================================
    story.append(Paragraph("2. System Architecture & Tech Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))
    
    story.append(Paragraph(
        "The application follows a clean <b>Model-View-Controller (MVC)</b> architectural pattern with an ~80% Python backend footprint and a ~20% lightweight frontend presentation tier. No heavyweight Node.js build pipelines are required, ensuring instant portability across Windows, Linux, and cloud environments.",
        body_style
    ))

    arch_data = [
        [Paragraph("<b>Layer</b>", body_style), Paragraph("<b>Components & Technology</b>", body_style), Paragraph("<b>Key Responsibilities</b>", body_style)],
        [
            Paragraph("<b>Presentation (View)</b>", body_style),
            Paragraph("Jinja2 Templates, HTML5, Vanilla CSS (custom.css), TailwindCSS (CDN), Lucide Icons, Chart.js", body_style),
            Paragraph("Render server-side dashboards, dynamic forms, mobile-responsive navigation, Chart.js fuel trends, and printable wage vouchers.", body_style)
        ],
        [
            Paragraph("<b>Controller (Flask Routes)</b>", body_style),
            Paragraph("Flask 3.1 (app.py) with 24 route handlers, Jinja context filters, file upload handler", body_style),
            Paragraph("Request dispatching, payload validation, business calculations (wages, deductions, fuel diffs), session flash notifications.", body_style)
        ],
        [
            Paragraph("<b>Data Access (ORM)</b>", body_style),
            Paragraph("SQLAlchemy 2.0 & Flask-SQLAlchemy 3.1.1 (models.py)", body_style),
            Paragraph("Object Relational Mapping, cascade deletions, lazy loading, computed model properties, and aggregation queries.", body_style)
        ],
        [
            Paragraph("<b>Persistence (Database)</b>", body_style),
            Paragraph("SQLite 3 (anupama_agencies.db), database.py", body_style),
            Paragraph("Transactional zero-config file database, automated schema generation, and realistic FMCG dealership mock data seeding.", body_style)
        ],
        [
            Paragraph("<b>Utility & Export</b>", body_style),
            Paragraph("utils.py, Python standard csv, io, datetime", body_style),
            Paragraph("Indian Rupee (INR) formatting, secure file upload hashing, and UTF-8 BOM CSV streaming for Microsoft Excel.", body_style)
        ]
    ]
    arch_table = Table(arch_data, colWidths=[90, 180, 234])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 3: PYTHON CODEBASE DEEP DIVE
    # ==========================================
    story.append(PageBreak())
    story.append(Paragraph("3. Detailed Python Code Breakdown", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "The Python backend comprises five primary files: <code>models.py</code>, <code>database.py</code>, <code>utils.py</code>, <code>app.py</code>, and <code>smoke_test.py</code>. Below is the systematic breakdown of every component.",
        body_style
    ))

    # 3.1 models.py
    story.append(Paragraph("3.1 Data Models & Relationships (models.py)", h2_style))
    story.append(Paragraph(
        "<code>models.py</code> defines 7 relational database entities utilizing <code>Flask-SQLAlchemy</code>. It incorporates cascading relationships, foreign key constraints, and dynamic Python calculation methods.",
        body_style
    ))

    model_summary_data = [
        [Paragraph("<b>Model Name</b>", body_style), Paragraph("<b>Key Attributes & Types</b>", body_style), Paragraph("<b>Relationships & Methods</b>", body_style)],
        [
            Paragraph("<b>Worker</b>", body_style),
            Paragraph("id, name, phone, emergency_contact, role, join_date, daily_wage, monthly_salary, status, photo_path", body_style),
            Paragraph("Relationships: <code>attendances</code>, <code>advances</code>, <code>salary_settlements</code> (cascade='all, delete-orphan'). Methods: <code>total_advances_pending</code>, <code>days_worked_in_month()</code>, <code>attendance_summary_in_month()</code>.", body_style)
        ],
        [
            Paragraph("<b>Attendance</b>", body_style),
            Paragraph("id, worker_id (FK), date, status, notes", body_style),
            Paragraph("Enforces unique constraint: <code>(worker_id, date)</code>. Statuses: Present (1.0), Half Day (0.5), Paid Leave (1.0), Absent (0.0).", body_style)
        ],
        [
            Paragraph("<b>Advance</b>", body_style),
            Paragraph("id, worker_id (FK), request_date, payment_date, amount_requested, amount_paid, payment_mode, reason, status, settlement_id (FK)", body_style),
            Paragraph("Tracks khata loans. Statuses: <code>Pending</code>, <code>Approved</code>, <code>Settled</code>. Links directly to <code>SalarySettlement</code> upon wage deduction.", body_style)
        ],
        [
            Paragraph("<b>Vehicle</b>", body_style),
            Paragraph("id, vehicle_number (unique), vehicle_name, vehicle_type, fuel_type, assigned_driver_id (FK), status", body_style),
            Paragraph("Represents fleet assets (Tata Ace, Mahindra Bolero, Ape Auto). Relationships: <code>fuel_expenses</code>, <code>dispatches</code>.", body_style)
        ],
        [
            Paragraph("<b>FuelExpense</b>", body_style),
            Paragraph("id, vehicle_id (FK), driver_id (FK), date, fuel_type, amount_spent, liters, odometer_reading, receipt_image, notes", body_style),
            Paragraph("Stores fuel fill logs with physical receipt image path and odometer tracking.", body_style)
        ],
        [
            Paragraph("<b>DispatchBeat</b>", body_style),
            Paragraph("id, dispatch_date, beat_name, vehicle_id (FK), driver_id (FK), helper_id (FK), crates_everest, cartons_colgate, status, notes", body_style),
            Paragraph("Logs morning retail deliveries per commercial beat. Statuses: <code>Dispatched</code>, <code>Completed</code>.", body_style)
        ],
        [
            Paragraph("<b>DamagedReturn</b>", body_style),
            Paragraph("id, return_date, brand, product_name, retailer_name, batch_no, expiry_date, quantity, unit, reason, claim_status, credit_note_amount, credit_note_number", body_style),
            Paragraph("Tracks retailer returns for Everest & Colgate. Pipeline: <code>Pending Inspection</code> &rarr; <code>Submitted to Depot</code> &rarr; <code>Credit Note Received</code>.", body_style)
        ],
        [
            Paragraph("<b>SalarySettlement</b>", body_style),
            Paragraph("id, worker_id (FK), month_year, days_present, half_days, paid_leaves, absent_days, effective_days, daily_wage, gross_earnings, advances_deducted, bonus_incentive, net_payout, settlement_date, payment_mode, payment_reference", body_style),
            Paragraph("Stores immutable monthly wage settlement snapshots and generates formal printable wage payment vouchers.", body_style)
        ]
    ]
    model_table = Table(model_summary_data, colWidths=[90, 190, 224])
    model_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    story.append(model_table)
    story.append(Spacer(1, 10))

    # 3.2 database.py
    story.append(Paragraph("3.2 Database Initialization & Realistic Seeding (database.py)", h2_style))
    story.append(Paragraph(
        "<code>database.py</code> provides <code>init_db(app)</code> which ensures storage directories exist (<code>static/uploads/workers</code> and <code>static/uploads/receipts</code>), executes <code>db.create_all()</code> to instantiate the SQLite schema, and automatically seeds realistic data if the tables are empty:",
        body_style
    ))
    story.append(Paragraph("• <b>5 Godown Staff:</b> Senior Drivers (Ramesh Kumar, Amit Sharma), Loaders (Suresh Yadav), Helpers (Manoj Verma), and Supervisors (Rajesh Patel) with varying daily wages (Rs. 500 to Rs. 800).", bullet_style))
    story.append(Paragraph("• <b>3 Fleet Vehicles:</b> Tata Ace Gold (Diesel), Mahindra Bolero Maxi Truck (Diesel), and Piaggio Ape Auto (CNG).", bullet_style))
    story.append(Paragraph("• <b>Multi-day Attendance Matrix:</b> Pre-populated for the active month with Present, Half Day, Absent, and Paid Leave records.", bullet_style))
    story.append(Paragraph("• <b>Live Khata Advances:</b> Real-world advance records (medical, school fees, repair) in Approved and Settled states.", bullet_style))
    story.append(Paragraph("• <b>Beat Dispatches & Damage Claims:</b> Pre-configured route trips and credit note claims for both Everest Spices and Colgate-Palmolive.", bullet_style))
    story.append(Spacer(1, 8))

    # 3.3 utils.py
    story.append(Paragraph("3.3 Core Utilities & Export Engine (utils.py)", h2_style))
    story.append(Paragraph(
        "<code>utils.py</code> encapsulates mission-critical helper functions utilized across routes and Jinja templates:",
        body_style
    ))
    story.append(Paragraph(
        "<b>1. Indian Rupee (INR) Formatter (<code>format_inr</code>):</b> Standard Python <code>locale</code> formatting frequently misbehaves across Windows and Linux server environments. <code>format_inr</code> implements the exact Indian numbering system (separating the last 3 digits, followed by groupings of 2 digits for thousands, lakhs, and crores):",
        body_style
    ))
    story.append(Paragraph(
        "<i>Input: <code>154250.5</code> &rarr; Output: <code>Rs. 1,54,250.50</code>. Supports negative amounts, null protection, and 2-decimal precision.</i>",
        code_style
    ))
    story.append(Paragraph(
        "<b>2. Secure File Uploader (<code>save_uploaded_file</code>):</b> Validates file extensions (PNG, JPG, JPEG, WEBP), generates collision-free timestamped filenames, saves to designated uploads directories, and returns relative web URLs.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. Microsoft Excel-Compatible CSV Streamer (<code>export_csv_response</code>):</b> Builds on Python's in-memory <code>io.StringIO</code> and standard <code>csv.writer</code>. Critically, it prepends the <b>UTF-8 Byte Order Mark (<code>\\ufeff</code>)</b> so that Microsoft Excel correctly recognizes Indian Rupee characters and Unicode text without character corruption.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # 3.4 app.py
    story.append(PageBreak())
    story.append(Paragraph("3.4 Application Routing & Business Controller (app.py)", h2_style))
    story.append(Paragraph(
        "<code>app.py</code> serves as the application nerve center, spanning 961 lines of meticulously structured Python code. It configures Flask, registers custom Jinja filters, injects global date variables, and exposes 24 endpoints categorized into 9 operational functional modules:",
        body_style
    ))

    routes_data = [
        [Paragraph("<b>Module</b>", body_style), Paragraph("<b>Route Endpoint</b>", body_style), Paragraph("<b>Method</b>", body_style), Paragraph("<b>Description & Logic</b>", body_style)],
        [
            Paragraph("<b>1. Dashboard</b>", body_style),
            Paragraph("<code>/</code>", body_style),
            Paragraph("GET", body_style),
            Paragraph("Aggregates real-time KPIs: worker headcount, today's attendance tallies, pending advance sum, month-over-month fuel expenditure with % difference, active dispatches, pending damaged claims, and generates dynamic 6-month fuel trend arrays for Chart.js.", body_style)
        ],
        [
            Paragraph("<b>2. Workers</b>", body_style),
            Paragraph("<code>/workers</code><br/><code>/workers/add</code><br/><code>/workers/&lt;id&gt;</code><br/><code>/workers/&lt;id&gt;/edit</code>", body_style),
            Paragraph("GET<br/>POST<br/>GET<br/>POST", body_style),
            Paragraph("Directory of staff with role & status filtering, search filter, photo upload, monthly attendance summary, advance history, and WhatsApp/Call integration.", body_style)
        ],
        [
            Paragraph("<b>3. Attendance</b>", body_style),
            Paragraph("<code>/attendance</code><br/><code>/attendance/save</code><br/><code>/attendance/monthly</code>", body_style),
            Paragraph("GET<br/>POST<br/>GET", body_style),
            Paragraph("Daily bulk attendance register with 'Mark All Present' shortcut. Monthly muster roll matrix view (days 1–31) calculating effective days and attendance %.", body_style)
        ],
        [
            Paragraph("<b>4. Advances</b>", body_style),
            Paragraph("<code>/advances</code><br/><code>/advances/add</code><br/><code>/advances/&lt;id&gt;/status</code>", body_style),
            Paragraph("GET<br/>POST<br/>POST", body_style),
            Paragraph("Staff khata ledger. Records cash/UPI/bank advances. Computes Total Given, Total Pending, and Total Settled. Live status toggle.", body_style)
        ],
        [
            Paragraph("<b>5. Fuel & Fleet</b>", body_style),
            Paragraph("<code>/fuel</code><br/><code>/fuel/add</code><br/><code>/fuel/vehicles</code><br/><code>/fuel/vehicles/add</code>", body_style),
            Paragraph("GET<br/>POST<br/>GET<br/>POST", body_style),
            Paragraph("Tracks fleet logs (Tata Ace, Bolero, Ape Auto). Logs liters, amount, odometer reading, and fuel receipt image upload with image preview modal.", body_style)
        ],
        [
            Paragraph("<b>6. Dispatches</b>", body_style),
            Paragraph("<code>/dispatches</code><br/><code>/dispatches/add</code><br/><code>/dispatches/&lt;id&gt;/status</code>", body_style),
            Paragraph("GET<br/>POST<br/>POST", body_style),
            Paragraph("FMCG daily route delivery tracker. Records beat name, vehicle, driver, helper, Everest Spices crates, and Colgate cartons dispatched.", body_style)
        ],
        [
            Paragraph("<b>7. Returns</b>", body_style),
            Paragraph("<code>/returns</code><br/><code>/returns/add</code><br/><code>/returns/&lt;id&gt;/update-claim</code>", body_style),
            Paragraph("GET<br/>POST<br/>POST", body_style),
            Paragraph("Damaged & expiry log for Everest and Colgate. Tracks batch numbers, retailer names, depot claim statuses, and credit note numbers.", body_style)
        ],
        [
            Paragraph("<b>8. Settlements</b>", body_style),
            Paragraph("<code>/settlements</code><br/><code>/settlements/process</code><br/><code>/settlements/voucher/&lt;id&gt;</code>", body_style),
            Paragraph("GET<br/>POST<br/>GET", body_style),
            Paragraph("Automated wage calculator applying monthly attendance, daily wages, advance deduction cascade, bonus incentive, and generates printable payment voucher.", body_style)
        ],
        [
            Paragraph("<b>9. CSV Exports</b>", body_style),
            Paragraph("<code>/export/attendance</code><br/><code>/export/advances</code><br/><code>/export/fuel</code><br/><code>/export/settlements</code><br/><code>/export/returns</code>", body_style),
            Paragraph("GET", body_style),
            Paragraph("Five instant one-click downloadable Excel-compatible CSV reports generated on-the-fly via streaming response with UTF-8 BOM encoding.", body_style)
        ]
    ]
    routes_table = Table(routes_data, colWidths=[80, 120, 50, 254])
    routes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    story.append(routes_table)
    story.append(Spacer(1, 10))

    # 3.5 Automated Smoke Testing
    story.append(Paragraph("3.5 Quality Assurance & Automated Verification (smoke_test.py)", h2_style))
    story.append(Paragraph(
        "<code>smoke_test.py</code> incorporates Python's standard <code>unittest</code> framework to execute 6 rigorous test suites verifying the integrity of the application:",
        body_style
    ))
    story.append(Paragraph("1. <code>test_database_seeded</code>: Confirms that initial seed data contains at least 5 workers, 3 vehicles, and active advances.", bullet_style))
    story.append(Paragraph("2. <code>test_all_pages_render_200</code>: Simulates HTTP GET requests across all 11 core routes, asserting HTTP 200 OK status codes.", bullet_style))
    story.append(Paragraph("3. <code>test_attendance_save</code>: Verifies POST data submission to <code>/attendance/save</code> and asserts persistence in SQLite.", bullet_style))
    story.append(Paragraph("4. <code>test_advance_and_balance</code>: Validates that recording a new advance increments the worker's pending balance accurately.", bullet_style))
    story.append(Paragraph("5. <code>test_settlement_computation_and_voucher</code>: Simulates salary processing, verifies advance deduction deduction logic, and confirms voucher rendering.", bullet_style))
    story.append(Paragraph("6. <code>test_csv_exports</code>: Downloads all 5 CSV export endpoints, asserting text/csv MIME headers and non-zero byte payloads.", bullet_style))
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 4: KEY ALGORITHMS & MATHEMATICAL FORMULAS
    # ==========================================
    story.append(PageBreak())
    story.append(Paragraph("4. Mathematical Formulas & Business Logic", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "The application replaces manual accounting guesswork with deterministic mathematical calculations codified in Python:",
        body_style
    ))

    # Formula 1: Effective Working Days
    story.append(Paragraph("4.1 Effective Working Days Calculation", h2_style))
    story.append(Paragraph(
        "Implemented in <code>Worker.days_worked_in_month(year, month)</code>. A half-day is credited as 0.5, while full days and paid leaves receive 1.0 credit:",
        body_style
    ))
    story.append(Paragraph(
        "Effective Working Days = Present Count + Paid Leave Count + (Half Day Count &times; 0.5)",
        code_style
    ))

    # Formula 2: Salary Settlement & Advance Reconciliation
    story.append(Paragraph("4.2 Monthly Salary Settlement & Khata Deduction Engine", h2_style))
    story.append(Paragraph(
        "Implemented in <code>/settlements/process</code> in <code>app.py</code>. The gross earnings are computed directly from the worker's agreed daily wage rate, and advances are automatically deducted up to the authorized deduction limit:",
        body_style
    ))
    story.append(Paragraph(
        "Gross Earnings = Effective Working Days &times; Daily Wage Rate<br/>"
        "Net Payout = MAX( 0.0 , (Gross Earnings - Advances Deducted) + Bonus Incentive )",
        code_style
    ))
    story.append(Paragraph(
        "<b>Advance Cascade Logic:</b> When a monthly salary is settled with advance deductions, the system iterates through the worker's oldest approved advances. If an advance is smaller than or equal to the remaining deduction amount, it is flagged as <code>Settled</code>. If an advance is larger than the remaining deduction, it is marked as <code>Settled</code> and an automated remainder advance record is created for the remaining balance. This guarantees that khata ledgers never lose track of fractional advance balances.",
        body_style
    ))

    # Formula 3: Month-over-Month Fuel Comparison
    story.append(Paragraph("4.3 Fleet Fuel Expenditure Variance", h2_style))
    story.append(Paragraph(
        "Computed on the executive dashboard to provide instant operational cost control over delivery vans and trucks:",
        body_style
    ))
    story.append(Paragraph(
        "Fuel Variance (%) = [ (Current Month Expense - Previous Month Expense) / Previous Month Expense ] &times; 100",
        code_style
    ))
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 5: FRONTEND ARCHITECTURE & DESIGN SYSTEM
    # ==========================================
    story.append(Paragraph("5. Frontend Architecture & Design Aesthetics", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "The user interface is engineered according to enterprise UI standards, featuring custom branding for Anupama Agencies:",
        body_style
    ))
    story.append(Paragraph("• <b>Bespoke Brand Colorway:</b> Dual brand themes combining <b>Everest Warm Red</b> (<code>#C41E3A</code>) and <b>Colgate Trust Blue</b> (<code>#004B87</code>) with slate neutrals (<code>#F8FAFC</code>).", bullet_style))
    story.append(Paragraph("• <b>Template Inheritance (base.html):</b> Establishes a responsive dual-navigation pattern: a sticky collapsible left sidebar on desktop and an animated mobile drawer for tablet/smartphone warehouse use.", bullet_style))
    story.append(Paragraph("• <b>Micro-Interactions (custom.css & app.js):</b> Smooth hover lifts on metric cards (<code>card-hover</code>), status badges for muster rolls (present green, half-day amber, absent red, leave blue), auto-dismissing flash notifications, and image modals for instant receipt inspection.", bullet_style))
    story.append(Paragraph("• <b>Interactive Wage Calculator:</b> Live JavaScript calculation in <code>templates/settlements/index.html</code> dynamically updates net payouts in real time as managers adjust advance deduction and bonus inputs.", bullet_style))
    story.append(Paragraph("• <b>Printable Payment Voucher (voucher.html):</b> Utilizes dedicated CSS <code>@media print</code> rules. Strips navigation, sidebars, and backgrounds, outputting a legal payment voucher complete with dual signature blocks for Godown Manager and Worker.", bullet_style))
    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 6: INSTALLATION & OPERATIONAL MANUAL
    # ==========================================
    story.append(PageBreak())
    story.append(Paragraph("6. Installation, Configuration & Run Guide", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph("6.1 Prerequisites", h2_style))
    story.append(Paragraph("• Python 3.10, 3.11, 3.12, 3.13, or 3.14 installed on Windows, macOS, or Linux.", body_style))
    story.append(Paragraph("• Standard pip package manager.", body_style))

    story.append(Paragraph("6.2 Step-by-Step Installation", h2_style))
    story.append(Paragraph(
        "1. Open PowerShell or Terminal in the project root directory:<br/>"
        "<code>cd \"c:\\python project for anupama agenices\"</code>",
        code_style
    ))
    story.append(Paragraph(
        "2. Install required Python packages:<br/>"
        "<code>pip install -r requirements.txt</code>",
        code_style
    ))
    story.append(Paragraph(
        "3. Launch the application server:<br/>"
        "<code>python app.py</code>",
        code_style
    ))
    story.append(Paragraph(
        "4. Access the web dashboard in any browser:<br/>"
        "<code>http://127.0.0.1:5000</code>",
        code_style
    ))

    story.append(Paragraph("6.3 Running Quality Assurance Tests", h2_style))
    story.append(Paragraph(
        "Execute automated smoke tests anytime to guarantee zero regressions:<br/>"
        "<code>python smoke_test.py</code>",
        code_style
    ))

    story.append(Paragraph("6.4 Production Deployment Recommendations", h2_style))
    story.append(Paragraph(
        "For production deployment on an on-premise warehouse server or cloud VPS (Ubuntu/Debian):",
        body_style
    ))
    story.append(Paragraph("• <b>WSGI HTTP Server:</b> Run behind <b>Gunicorn</b> or <b>Waitress</b>: <code>waitress-serve --port=5000 app:app</code> or <code>gunicorn -w 4 -b 0.0.0.0:5000 app:app</code>.", bullet_style))
    story.append(Paragraph("• <b>Reverse Proxy:</b> Terminate SSL/TLS via <b>Nginx</b> or <b>Caddy</b> with HTTPS certificates.", bullet_style))
    story.append(Paragraph("• <b>Database Scaling:</b> SQLite supports thousands of daily transactions effortlessly. If agency operations expand to multiple multi-city depots, the SQLAlchemy URI can be switched to PostgreSQL with zero model code modifications.", bullet_style))
    story.append(Paragraph("• <b>Automated Backups:</b> Schedule a daily backup cron job for <code>instance/anupama_agencies.db</code> and the <code>static/uploads/</code> directory.", bullet_style))
    story.append(Spacer(1, 14))

    # Sign-off box
    signoff_data = [
        [
            Paragraph("<b>Document Prepared For:</b> Anupama Agencies (Distributor Operations)", body_style),
            Paragraph("<b>Status:</b> Approved for Production Deployment", body_style)
        ],
        [
            Paragraph("<b>Technical Lead:</b> AI Senior Python Solutions Architect", body_style),
            Paragraph("<b>Distribution Partners:</b> Everest Spices & Colgate-Palmolive India", body_style)
        ]
    ]
    signoff_table = Table(signoff_data, colWidths=[250, 254])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(signoff_table)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {os.path.abspath(filename)}")

if __name__ == '__main__':
    target = "Anupama_Agencies_Project_Explanation.pdf"
    if len(sys.argv) > 1:
        target = sys.argv[1]
    build_pdf(target)
