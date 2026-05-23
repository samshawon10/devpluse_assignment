# DevPulse

Live URL: https://devpluse-assignment.vercel.app/

DevPulse is an internal tech issue and feature tracker API for software teams. It allows contributors to report bugs or request features, and maintainers to manage issue updates, workflow status, and deletion.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Contributor and maintainer role permissions
- Create bug reports and feature requests
- View all issues with optional sorting and filtering
- View single issue details
- Update issue fields based on ownership and role
- Maintainer-only issue deletion
- Maintainer-controlled workflow status updates
- PostgreSQL database with raw SQL queries
- Standard success and error response format

## Tech Stack

- Node.js 24.x
- TypeScript
- Express.js
- PostgreSQL
- Native `pg` driver
- Raw SQL
- bcrypt
- jsonwebtoken
- http-status-codes
- CORS
- Vercel
- NeonDB

## Setup Steps

1. Clone the repository.

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

4. Run the database schema from `sql/schema.sql` in your PostgreSQL database.

5. Start the development server:

```bash
npm run dev
```

6. Build the project:

```bash
npm run build
```

7. Start the production server:

```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Log in and receive a JWT |

### Issues

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/issues` | Authenticated | Create a new issue |
| `GET` | `/api/issues` | Public | Get all issues |
| `GET` | `/api/issues/:id` | Public | Get a single issue |
| `PATCH` | `/api/issues/:id` | Authenticated | Update issue fields |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters for `GET /api/issues`

| Parameter | Allowed Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

## Authentication Header

Protected routes require a JWT in the `Authorization` header:

```text
Authorization: <JWT_TOKEN>
```

## Standard Response Format

Success response:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

## Database Schema Summary

### users

| Field | Description |
| --- | --- |
| `id` | Auto-incrementing unique user ID |
| `name` | Required full display name |
| `email` | Required unique login email |
| `password` | Required encrypted password hash |
| `role` | User role, either `contributor` or `maintainer` |
| `created_at` | Timestamp generated on insert |
| `updated_at` | Timestamp refreshed on update |

### issues

| Field | Description |
| --- | --- |
| `id` | Auto-incrementing unique issue ID |
| `title` | Required title, maximum 150 characters |
| `description` | Required issue details, minimum 20 characters |
| `type` | Issue type, either `bug` or `feature_request` |
| `status` | Workflow status: `open`, `in_progress`, or `resolved` |
| `reporter_id` | ID of the user who created the issue |
| `created_at` | Timestamp generated on insert |
| `updated_at` | Timestamp refreshed on update |

## Deployment

The backend is deployed on Vercel and uses NeonDB for PostgreSQL.

Required Vercel environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `CORS_ORIGIN`

