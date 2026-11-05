# TERIMBERE Cooperative — Backend REST API

Node.js and Express RESTful API powering the **TERIMBERE Cooperative Management Platform**. Handles member records, loan issuance, amortization calculations, cash flow ledgers, quorum voting attendance, committee tasks, and regulatory exports.

---

## 🛠️ Technology Stack

* **Runtime**: Node.js (v18+)
* **Framework**: Express.js (v4.x)
* **Database**: MySQL (v8.0+) via `mysql2/promise` connection pooling
* **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
* **Network Binding**: Dual-stack `0.0.0.0` with configurable port (default: `5000`)
* **Document & Report Generation**: `jspdf` (for PDF statements) and `xlsx` (SheetJS for Excel workbooks)

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cooperative_db
JWT_SECRET=supersecretjwtkey_cooperative_2026
```

---

## 🗄️ Database Schema

The database consists of 9 core tables:

1. **`users`**: System officers and administrative user credentials (`id`, `name`, `email`, `password`, `role`, `created_at`).
2. **`members`**: Cooperative member records (`id`, `name`, `email`, `phone`, `role`, `status`, `joined_date`).
3. **`finances`**: Treasury cash-in and cash-out records (`id`, `type`, `amount`, `category`, `description`, `date`, `recorded_by`).
4. **`loans`**: Loan contracts and balances (`id`, `member_id`, `amount`, `interest_rate`, `duration_months`, `status`, `disbursed_date`).
5. **`loan_payments`**: Individual installment repayments linked to loans (`id`, `loan_id`, `amount`, `payment_date`, `payment_method`, `notes`).
6. **`meetings`**: Assembly sessions (`id`, `title`, `date`, `time`, `location`, `description`, `status`).
7. **`meeting_attendance`**: Quorum roll-call records (`id`, `meeting_id`, `member_id`, `status`).
8. **`tasks`**: Action items assigned to committee members (`id`, `title`, `description`, `assigned_to`, `due_date`, `priority`, `status`).
9. **`shares` / `savings`**: Optional supplemental equity records.

---

## 🔌 API Endpoints Reference

All routes except `/api/auth/*` require a valid JWT Bearer token passed in the `Authorization` header (`Authorization: Bearer <token>`).

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Authenticate and obtain a 24h JWT token (`email`, `password`) |

### 2. Members (`/api/members`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/members` | Retrieve all cooperative members with search & pagination |
| `POST` | `/api/members` | Onboard a new member |
| `PUT` | `/api/members/:id` | Update member profile or status (`active`, `inactive`, `suspended`) |
| `DELETE` | `/api/members/:id` | Remove a member record |

### 3. Credit & Loans (`/api/loans`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/loans` | List all loans with associated member names and remaining balances |
| `POST` | `/api/loans` | Disburse a new loan (`member_id`, `amount`, `interest_rate`, `duration_months`) |
| `GET` | `/api/loans/stats/summary` | Portfolio aggregates (total disbursed, repayments, outstanding) |
| `GET` | `/api/loans/:id/balance` | Get remaining balance and amortization calculation for a specific loan |

### 4. Loan Installments (`/api/loans/:loan_id/payments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/loans/:loan_id/payments` | Get repayment ledger for a given loan |
| `POST` | `/api/loans/:loan_id/payments` | Log an installment payment with overpayment safeguards |

### 5. Treasury & Finances (`/api/finances`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/finances` | List all financial transactions |
| `POST` | `/api/finances` | Record a cash inflow or outflow |
| `GET` | `/api/finances/stats/summary` | Net balance, total income, total expenditures |

### 6. Meetings & Governance (`/api/meetings` & `/api/attendance`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/meetings` | Retrieve scheduled and past general assemblies |
| `POST` | `/api/meetings` | Schedule a new assembly |
| `GET` | `/api/attendance/meeting/:meeting_id` | Get attendance roll call for a session |
| `POST` | `/api/attendance/batch` | Submit bulk roll-call statuses (`Present`, `Absent`, `Excused`) |

### 7. Tasks & Committee (`/api/tasks`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | List all action items |
| `POST` | `/api/tasks` | Assign an action item to a member |
| `PUT` | `/api/tasks/:id` | Update progress (`Pending`, `In Progress`, `Completed`) |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### 8. Regulatory Exports (`/api/exports`)
| Method | Endpoint | Content-Type | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exports/members/pdf` | `application/pdf` | Formatted membership roster |
| `GET` | `/api/exports/members/excel` | `application/vnd.openxmlformats...` | Raw membership workbook (.xlsx) |
| `GET` | `/api/exports/finances/pdf` | `application/pdf` | Official treasury audit statement |
| `GET` | `/api/exports/finances/excel` | `application/vnd.openxmlformats...` | Comprehensive ledger workbook (.xlsx) |

---

## 🚀 Running the Server

### Installation
```bash
cd backend
npm install
```

### Start Development Server
```bash
node server.js
```
The server will start listening on `http://0.0.0.0:5000` (supporting connections from both `localhost` and `127.0.0.1`).
