import unittest
from datetime import date
from app import app
from models import db, Worker, Attendance, Advance, Vehicle, FuelExpense, DispatchBeat, DamagedReturn, SalarySettlement

class AnupamaAgenciesSmokeTest(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_database_seeded(self):
        with app.app_context():
            workers = Worker.query.all()
            self.assertGreaterEqual(len(workers), 5, "Should have at least 5 seeded workers")
            vehicles = Vehicle.query.all()
            self.assertGreaterEqual(len(vehicles), 3, "Should have at least 3 seeded vehicles")
            advances = Advance.query.all()
            self.assertGreater(len(advances), 0, "Should have seeded advances")

    def test_all_pages_render_200(self):
        routes = [
            '/',
            '/workers',
            '/workers/1',
            '/attendance',
            '/attendance/monthly',
            '/advances',
            '/fuel',
            '/fuel/vehicles',
            '/dispatches',
            '/returns',
            '/settlements',
        ]
        for route in routes:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200, f"Route {route} failed with status {response.status_code}")

    def test_attendance_save(self):
        with app.app_context():
            worker = Worker.query.first()
            response = self.client.post('/attendance/save', data={
                'date': date.today().strftime('%Y-%m-%d'),
                f'status_{worker.id}': 'Present',
                f'notes_{worker.id}': 'Test attendance note'
            }, follow_redirects=True)
            self.assertEqual(response.status_code, 200)
            
            att = Attendance.query.filter_by(worker_id=worker.id, date=date.today()).first()
            self.assertIsNotNone(att)
            self.assertEqual(att.status, 'Present')

    def test_advance_and_balance(self):
        with app.app_context():
            worker = Worker.query.first()
            initial_balance = worker.total_advances_pending
            
            response = self.client.post('/advances/add', data={
                'worker_id': worker.id,
                'amount': 1200.0,
                'payment_mode': 'Cash',
                'reason': 'Emergency test advance',
                'request_date': date.today().strftime('%Y-%m-%d'),
                'payment_date': date.today().strftime('%Y-%m-%d'),
            }, follow_redirects=True)
            self.assertEqual(response.status_code, 200)
            
            db.session.expire_all()
            reloaded_worker = Worker.query.get(worker.id)
            self.assertEqual(reloaded_worker.total_advances_pending, initial_balance + 1200.0)

    def test_settlement_computation_and_voucher(self):
        with app.app_context():
            worker = Worker.query.first()
            today = date.today()
            month_year = f"{today.year}-{today.month:02d}"
            
            response = self.client.post('/settlements/process', data={
                'worker_id': worker.id,
                'month_year': month_year,
                'advances_deducted': 500.0,
                'bonus_incentive': 200.0,
                'payment_mode': 'Cash',
                'payment_reference': 'TEST-VCHR-1',
                'notes': 'Smoke test salary settlement'
            }, follow_redirects=True)
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Wage Payout Voucher", response.data)

    def test_csv_exports(self):
        export_routes = [
            '/export/attendance',
            '/export/advances',
            '/export/fuel',
            '/export/settlements',
            '/export/returns',
        ]
        for route in export_routes:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200, f"Export {route} failed")
            self.assertIn('text/csv', response.headers.get('Content-Type', ''))
            self.assertTrue(len(response.data) > 0)

if __name__ == '__main__':
    unittest.main()
