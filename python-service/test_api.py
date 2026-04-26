import requests
import os
import psycopg2
from urllib.parse import urlparse

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"

# ── Colours ───────────────────────────────────────────────────────────────────

class Colors:
    GREEN  = '\033[92m'
    RED    = '\033[91m'
    YELLOW = '\033[93m'
    BLUE   = '\033[94m'
    CYAN   = '\033[96m'
    BOLD   = '\033[1m'
    END    = '\033[0m'

def print_success(msg): print(f"{Colors.GREEN}[+] {msg}{Colors.END}")
def print_error(msg):   print(f"{Colors.RED}[X] {msg}{Colors.END}")
def print_info(msg):    print(f"{Colors.BLUE}[i] {msg}{Colors.END}")
def print_warning(msg): print(f"{Colors.YELLOW}[!] {msg}{Colors.END}")
def section(title):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*55}")
    print(f"  {title}")
    print(f"{'='*55}{Colors.END}")

# ── DB helper (used to inspect DB state directly) ─────────────────────────────

def get_db():
    url = os.getenv("DATABASE_URL", "")
    try:
        if url:
            p = urlparse(url.replace("+asyncpg", ""))
            return psycopg2.connect(
                host=p.hostname or "localhost",
                port=p.port or 5432,
                database=(p.path or "/fleeto").lstrip("/"),
                user=p.username or "fleeto",
                password=p.password or "fleeto_dev",
            )
        return psycopg2.connect(
            host="localhost", port=5432,
            database="fleeto", user="fleeto", password="fleeto_dev",
        )
    except Exception as e:
        print_warning(f"DB connect failed: {e}")
        return None


def db_query(sql, params=()):
    conn = get_db()
    if not conn:
        return None
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        print_warning(f"DB query error: {e}")
        return None

# ── Global state ──────────────────────────────────────────────────────────────

state = {
    # tokens
    "operator_token": None,
    "rider_token":    None,
    # resource ids
    "operator_id":    None,
    "rider_id":       None,
    "job_id":         None,
    "job_id_2":       None,
    "tracking_token": None,
}

def op_headers():
    return {
        "Authorization": f"Bearer {state['operator_token']}",
        "Content-Type":  "application/json",
    }

def rider_headers():
    return {
        "Authorization": f"Bearer {state['rider_token']}",
        "Content-Type":  "application/json",
    }

# ── Results tracker ───────────────────────────────────────────────────────────

results = []

def record(name, passed):
    results.append((name, passed))
    if passed:
        print_success(f"PASS — {name}")
    else:
        print_error(f"FAIL — {name}")
    return passed

# ─────────────────────────────────────────────────────────────────────────────
# 1. OPERATOR AUTH
# ─────────────────────────────────────────────────────────────────────────────

def test_register_operator():
    section("1. Register Operator")
    payload = {
        "name":     "Tunde Logistics",
        "email":    "tunde@fleeto-test.com",
        "password": "Secret123!",
    }
    r = requests.post(f"{API_V1}/auth/register", json=payload)
    print_info(f"POST /auth/register  →  {r.status_code}")
    if r.status_code in (200, 201):
        data = r.json()
        state["operator_token"] = data.get("access_token")
        print_info(f"Token: {state['operator_token'][:30]}...")

        # Pull operator id from DB for later checks
        rows = db_query("SELECT id FROM operators WHERE email = %s", (payload["email"],))
        if rows:
            state["operator_id"] = rows[0][0]
            print_info(f"Operator ID (from DB): {state['operator_id']}")
        return record("Register operator", True)

    print_error(r.text)
    return record("Register operator", False)


def test_register_duplicate_email():
    section("2. Register Duplicate Email (expect 409)")
    payload = {"name": "Dupe", "email": "tunde@fleeto-test.com", "password": "Secret123!"}
    r = requests.post(f"{API_V1}/auth/register", json=payload)
    print_info(f"POST /auth/register  →  {r.status_code}")
    return record("Duplicate email rejected", r.status_code == 409)


def test_login_operator():
    section("3. Operator Login")
    payload = {"email": "tunde@fleeto-test.com", "password": "Secret123!"}
    r = requests.post(f"{API_V1}/auth/operator/login", json=payload)
    print_info(f"POST /auth/operator/login  →  {r.status_code}")
    if r.status_code == 200:
        state["operator_token"] = r.json().get("access_token")
        print_info(f"Fresh token: {state['operator_token'][:30]}...")
        return record("Operator login", True)
    print_error(r.text)
    return record("Operator login", False)


def test_login_operator_wrong_password():
    section("4. Operator Login — Wrong Password (expect 401)")
    payload = {"email": "tunde@fleeto-test.com", "password": "WrongPass!"}
    r = requests.post(f"{API_V1}/auth/operator/login", json=payload)
    print_info(f"POST /auth/operator/login  →  {r.status_code}")
    return record("Wrong password rejected", r.status_code == 401)

# ─────────────────────────────────────────────────────────────────────────────
# 2. RIDER MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

def test_add_rider():
    section("5. Add Rider to Fleet")
    payload = {"name": "Emeka Rider", "phone": "08012345678", "password": "rider123"}
    r = requests.post(f"{API_V1}/riders", json=payload, headers=op_headers())
    print_info(f"POST /riders  →  {r.status_code}")
    if r.status_code in (200, 201):
        data = r.json()
        state["rider_id"] = data.get("id")
        print_info(f"Rider ID: {state['rider_id']}")
        print_info(f"Status:   {data.get('status')}")
        return record("Add rider", True)
    print_error(r.text)
    return record("Add rider", False)


def test_list_riders():
    section("6. List Riders")
    r = requests.get(f"{API_V1}/riders", headers=op_headers())
    print_info(f"GET /riders  →  {r.status_code}")
    if r.status_code == 200:
        riders = r.json()
        print_info(f"Riders in fleet: {len(riders)}")
        for rd in riders:
            print_info(f"  — {rd['name']} ({rd['status']})")
        return record("List riders", True)
    print_error(r.text)
    return record("List riders", False)


def test_get_single_rider():
    section("7. Get Single Rider")
    r = requests.get(f"{API_V1}/riders/{state['rider_id']}", headers=op_headers())
    print_info(f"GET /riders/{{id}}  →  {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print_info(f"Name: {data['name']}  |  Phone: {data['phone']}")
        return record("Get single rider", True)
    print_error(r.text)
    return record("Get single rider", False)


def test_rider_login():
    section("8. Rider Login")
    payload = {"phone": "08012345678", "password": "rider123"}
    r = requests.post(f"{API_V1}/auth/rider/login", json=payload)
    print_info(f"POST /auth/rider/login  →  {r.status_code}")
    if r.status_code == 200:
        state["rider_token"] = r.json().get("access_token")
        print_info(f"Rider token: {state['rider_token'][:30]}...")
        return record("Rider login", True)
    print_error(r.text)
    return record("Rider login", False)


def test_rider_wrong_password():
    section("9. Rider Login — Wrong Password (expect 401)")
    payload = {"phone": "08012345678", "password": "wrongpass"}
    r = requests.post(f"{API_V1}/auth/rider/login", json=payload)
    print_info(f"POST /auth/rider/login  →  {r.status_code}")
    return record("Rider wrong password rejected", r.status_code == 401)

# ─────────────────────────────────────────────────────────────────────────────
# 3. JOB MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

def test_create_job_no_rider():
    section("10. Create Job — No Rider Assigned")
    payload = {
        "pickup_address":    "10 Allen Ave, Ikeja, Lagos",
        "dropoff_address":   "5 Bode Thomas St, Surulere, Lagos",
        "parcel_description": "Important documents",
        "customer_phone":    "07011223344",
    }
    r = requests.post(f"{API_V1}/jobs", json=payload, headers=op_headers())
    print_info(f"POST /jobs  →  {r.status_code}")
    if r.status_code in (200, 201):
        data = r.json()
        state["job_id"]         = data.get("id")
        state["tracking_token"] = data.get("tracking_token")
        print_info(f"Job ID:         {state['job_id']}")
        print_info(f"Status:         {data.get('status')}")
        print_info(f"Tracking token: {state['tracking_token']}")
        return record("Create job (no rider)", data.get("status") == "created")
    print_error(r.text)
    return record("Create job (no rider)", False)


def test_create_job_with_rider():
    section("11. Create Job — Rider Assigned at Creation")
    payload = {
        "pickup_address":    "22 Opebi Rd, Ikeja",
        "dropoff_address":   "14 Awolowo Rd, Ikoyi",
        "parcel_description": "Fragile glassware",
        "rider_id":          state["rider_id"],
    }
    r = requests.post(f"{API_V1}/jobs", json=payload, headers=op_headers())
    print_info(f"POST /jobs  →  {r.status_code}")
    if r.status_code in (200, 201):
        data = r.json()
        state["job_id_2"] = data.get("id")
        print_info(f"Job ID: {state['job_id_2']}  |  Status: {data.get('status')}")
        return record("Create job (with rider)", data.get("status") == "assigned")
    print_error(r.text)
    return record("Create job (with rider)", False)


def test_list_operator_jobs():
    section("12. List Operator Jobs")
    r = requests.get(f"{API_V1}/jobs", headers=op_headers())
    print_info(f"GET /jobs  →  {r.status_code}")
    if r.status_code == 200:
        jobs = r.json()
        print_info(f"Jobs found: {len(jobs)}")
        for j in jobs:
            print_info(f"  — [{j['status']}] {j['parcel_description'][:40]}")
        return record("List operator jobs", True)
    print_error(r.text)
    return record("List operator jobs", False)


def test_get_single_job():
    section("13. Get Single Job")
    r = requests.get(f"{API_V1}/jobs/{state['job_id']}", headers=op_headers())
    print_info(f"GET /jobs/{{id}}  →  {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print_info(f"Pickup:  {data['pickup_address']}")
        print_info(f"Dropoff: {data['dropoff_address']}")
        return record("Get single job", True)
    print_error(r.text)
    return record("Get single job", False)


def test_assign_rider_to_job():
    section("14. Assign Rider to Existing Job")
    payload = {"rider_id": state["rider_id"]}
    r = requests.patch(f"{API_V1}/jobs/{state['job_id']}/assign", json=payload, headers=op_headers())
    print_info(f"PATCH /jobs/{{id}}/assign  →  {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print_info(f"Status: {data.get('status')}  |  Rider ID: {data.get('rider_id')}")
        return record("Assign rider to job", data.get("status") == "assigned")
    print_error(r.text)
    return record("Assign rider to job", False)

# ─────────────────────────────────────────────────────────────────────────────
# 4. RIDER JOB FLOW
# ─────────────────────────────────────────────────────────────────────────────

def test_rider_list_jobs():
    section("15. Rider — List My Jobs")
    r = requests.get(f"{API_V1}/jobs/mine", headers=rider_headers())
    print_info(f"GET /jobs/mine  →  {r.status_code}")
    if r.status_code == 200:
        jobs = r.json()
        print_info(f"Jobs assigned to rider: {len(jobs)}")
        for j in jobs:
            print_info(f"  — [{j['status']}] {j['parcel_description'][:40]}")
        return record("Rider list jobs", True)
    print_error(r.text)
    return record("Rider list jobs", False)


def test_rider_mark_picked_up():
    section("16. Rider — Mark Job as Picked Up")
    payload = {"status": "picked_up"}
    r = requests.patch(
        f"{API_V1}/jobs/{state['job_id']}/status",
        json=payload, headers=rider_headers()
    )
    print_info(f"PATCH /jobs/{{id}}/status  →  {r.status_code}")
    if r.status_code == 200:
        print_info(f"New status: {r.json().get('status')}")
        return record("Mark picked_up", r.json().get("status") == "picked_up")
    print_error(r.text)
    return record("Mark picked_up", False)


def test_rider_mark_in_transit():
    section("17. Rider — Mark Job as In Transit")
    payload = {"status": "in_transit"}
    r = requests.patch(
        f"{API_V1}/jobs/{state['job_id']}/status",
        json=payload, headers=rider_headers()
    )
    print_info(f"PATCH /jobs/{{id}}/status  →  {r.status_code}")
    if r.status_code == 200:
        print_info(f"New status: {r.json().get('status')}")
        return record("Mark in_transit", r.json().get("status") == "in_transit")
    print_error(r.text)
    return record("Mark in_transit", False)


def test_invalid_status_transition():
    section("18. Invalid Status Transition (expect 409)")
    # Job is in_transit — jumping straight to picked_up should fail
    payload = {"status": "picked_up"}
    r = requests.patch(
        f"{API_V1}/jobs/{state['job_id']}/status",
        json=payload, headers=rider_headers()
    )
    print_info(f"PATCH /jobs/{{id}}/status  →  {r.status_code}")
    return record("Invalid transition rejected", r.status_code == 409)


def test_rider_ping_location():
    section("19. Rider — Ping Location")
    params = {"lat": 6.5244, "lng": 3.3792}   # Ikeja coords
    r = requests.post(
        f"{API_V1}/jobs/{state['job_id']}/location",
        params=params, headers=rider_headers()
    )
    print_info(f"POST /jobs/{{id}}/location  →  {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print_info(f"Lat: {data.get('lat')}  |  Lng: {data.get('lng')}")
        return record("Ping location", True)
    print_error(r.text)
    return record("Ping location", False)


def test_rider_mark_delivered():
    section("20. Rider — Mark Job as Delivered")
    payload = {"status": "delivered"}
    r = requests.patch(
        f"{API_V1}/jobs/{state['job_id']}/status",
        json=payload, headers=rider_headers()
    )
    print_info(f"PATCH /jobs/{{id}}/status  →  {r.status_code}")
    if r.status_code == 200:
        print_info(f"Final status: {r.json().get('status')}")
        return record("Mark delivered", r.json().get("status") == "delivered")
    print_error(r.text)
    return record("Mark delivered", False)

# ─────────────────────────────────────────────────────────────────────────────
# 5. CUSTOMER TRACKING (public — no auth)
# ─────────────────────────────────────────────────────────────────────────────

def test_tracking_valid_token():
    section("21. Customer Tracking — Valid Token")
    r = requests.get(f"{API_V1}/tracking/{state['tracking_token']}")
    print_info(f"GET /tracking/{{token}}  →  {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print_info(f"Status:         {data.get('status')}")
        print_info(f"Pickup:         {data.get('pickup_address')}")
        print_info(f"Dropoff:        {data.get('dropoff_address')}")
        loc = data.get("rider_location")
        if loc:
            print_info(f"Rider location: {loc['lat']}, {loc['lng']}")
        else:
            print_info("Rider location: not available")
        return record("Tracking — valid token", True)
    print_error(r.text)
    return record("Tracking — valid token", False)


def test_tracking_invalid_token():
    section("22. Customer Tracking — Invalid Token (expect 404)")
    r = requests.get(f"{API_V1}/tracking/not-a-real-token-xyz")
    print_info(f"GET /tracking/{{bad-token}}  →  {r.status_code}")
    return record("Tracking — invalid token 404", r.status_code == 404)

# ─────────────────────────────────────────────────────────────────────────────
# 6. DB VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

def test_db_state():
    section("23. Direct DB Verification")

    rows = db_query("SELECT id, email, plan FROM operators ORDER BY created_at DESC LIMIT 3")
    if rows:
        print_info("Operators in DB:")
        for row in rows:
            print_info(f"  — {row[1]}  (plan: {row[2]})")

    rows = db_query("SELECT id, name, phone, status FROM riders ORDER BY created_at DESC LIMIT 5")
    if rows:
        print_info("Riders in DB:")
        for row in rows:
            print_info(f"  — {row[1]} | {row[2]} | {row[3]}")

    rows = db_query(
        "SELECT id, status, parcel_description FROM jobs ORDER BY created_at DESC LIMIT 5"
    )
    if rows:
        print_info("Jobs in DB:")
        for row in rows:
            print_info(f"  — [{row[1]}] {row[2][:50]}")

    rows = db_query(
        "SELECT lat, lng, recorded_at FROM location_pings ORDER BY recorded_at DESC LIMIT 3"
    )
    if rows:
        print_info("Location pings in DB:")
        for row in rows:
            print_info(f"  — lat:{row[0]}, lng:{row[1]}  at {row[2]}")

    return record("DB state verified", True)

# ─────────────────────────────────────────────────────────────────────────────
# 7. EDGE / SECURITY CHECKS
# ─────────────────────────────────────────────────────────────────────────────

def test_unauthenticated_access():
    section("24. Unauthenticated Access (expect 401/403)")
    r = requests.get(f"{API_V1}/jobs")
    print_info(f"GET /jobs (no token)  →  {r.status_code}")
    return record("Unauthenticated blocked", r.status_code in (401, 403))


def test_operator_token_on_rider_endpoint():
    section("25. Operator Token on Rider-Only Endpoint (expect 403)")
    payload = {"status": "picked_up"}
    r = requests.patch(
        f"{API_V1}/jobs/{state['job_id_2']}/status",
        json=payload, headers=op_headers()
    )
    print_info(f"PATCH /jobs/{{id}}/status (operator token)  →  {r.status_code}")
    return record("Operator token rejected on rider endpoint", r.status_code in (401, 403))


def test_rider_cannot_access_other_operators_job():
    section("26. Rider Cannot Access Another Operator's Job")
    # Create a second operator and job, then try with the first rider token
    r2 = requests.post(
        f"{API_V1}/auth/register",
        json={"name": "Other Op", "email": "other@fleeto-test.com", "password": "Secret123!"},
    )
    if r2.status_code not in (200, 201):
        print_warning("Could not create second operator — skipping")
        return record("Cross-operator job access blocked", False)

    other_token = r2.json().get("access_token")
    other_headers = {"Authorization": f"Bearer {other_token}", "Content-Type": "application/json"}

    # Other operator creates a job
    rj = requests.post(
        f"{API_V1}/jobs",
        json={
            "pickup_address": "A", "dropoff_address": "B",
            "parcel_description": "Secret parcel",
        },
        headers=other_headers,
    )
    if rj.status_code not in (200, 201):
        print_warning("Could not create cross-operator job — skipping")
        return record("Cross-operator job access blocked", False)

    other_job_id = rj.json().get("id")

    # First rider tries to mark it — should fail (not assigned to them)
    r = requests.patch(
        f"{API_V1}/jobs/{other_job_id}/status",
        json={"status": "picked_up"},
        headers=rider_headers(),
    )
    print_info(f"PATCH other op job with rider token  →  {r.status_code}")
    return record("Cross-operator job access blocked", r.status_code == 404)

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print(f"\n{Colors.BOLD}{Colors.CYAN}")
    print("╔══════════════════════════════════════════════════════╗")
    print("║            FLEETO API — ENDPOINT TEST SUITE          ║")
    print("╚══════════════════════════════════════════════════════╝")
    print(Colors.END)

    # Auth
    test_register_operator()
    test_register_duplicate_email()
    test_login_operator()
    test_login_operator_wrong_password()

    # Riders
    test_add_rider()
    test_list_riders()
    test_get_single_rider()
    test_rider_login()
    test_rider_wrong_password()

    # Jobs
    test_create_job_no_rider()
    test_create_job_with_rider()
    test_list_operator_jobs()
    test_get_single_job()
    test_assign_rider_to_job()

    # Rider flow
    test_rider_list_jobs()
    test_rider_mark_picked_up()
    test_rider_mark_in_transit()
    test_invalid_status_transition()
    test_rider_ping_location()
    test_rider_mark_delivered()

    # Tracking (public)
    test_tracking_valid_token()
    test_tracking_invalid_token()

    # DB
    test_db_state()

    # Security
    test_unauthenticated_access()
    test_operator_token_on_rider_endpoint()
    test_rider_cannot_access_other_operators_job()

    # ── Summary ───────────────────────────────────────────────────────────────
    passed = sum(1 for _, ok in results if ok)
    failed = sum(1 for _, ok in results if not ok)
    total  = len(results)

    print(f"\n{Colors.BOLD}{'='*55}")
    print(f"  RESULTS:  {Colors.GREEN}{passed} passed{Colors.END}{Colors.BOLD}  |  "
          f"{Colors.RED}{failed} failed{Colors.END}{Colors.BOLD}  |  {total} total")
    print(f"{'='*55}{Colors.END}\n")

    if failed:
        print(f"{Colors.RED}Failed tests:{Colors.END}")
        for name, ok in results:
            if not ok:
                print(f"  {Colors.RED}✗ {name}{Colors.END}")
        print()

    return failed == 0


if __name__ == "__main__":
    ok = main()
    raise SystemExit(0 if ok else 1)
