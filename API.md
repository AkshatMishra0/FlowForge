# FlowForge API Documentation

## Base URL

```
Local: http://localhost:4000/api
Production: https://your-domain.com/api
```
 
## Authentication

All protected endpoints require JWT token in Authorization header :

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/signup
Create a new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### POST /auth/signin
Sign in to existing account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Get current user details (Protected)

#### GET /auth/google
Initiate Google OAuth flow

#### GET /auth/google/callback
Google OAuth callback

---

### Business

#### POST /business
Create business profile (Protected)

**Request:**
```json
{
  "name": "My Business",
  "address": "123 Main St",
  "phone": "+919876543210",
  "whatsappNumber": "+919876543210",
  "email": "business@example.com",
  "timezone": "Asia/Kolkata"
}
```

#### PATCH /business/:id
Update business profile (Protected)

#### GET /business/:id
Get business by ID (Protected)

#### GET /business
Get all businesses for current user (Protected)

---

### Leads

#### POST /leads?businessId=xxx
Create new lead (Protected)

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+919876543210",
  "whatsapp": "+919876543210",
  "company": "ABC Corp",
  "source": "website",
  "status": "new",
  "tags": ["hot", "enterprise"],
  "notes": "Interested in premium plan"
}
```

#### PATCH /leads/:id
Update lead (Protected)

#### GET /leads?businessId=xxx
Get all leads (Protected)

Query params:
- `status`: Filter by status
- `source`: Filter by source
- `tags`: Filter by tags

#### GET /leads/:id
Get lead by ID with full activity timeline (Protected)

#### DELETE /leads/:id
Delete lead (Protected)

---

### WhatsApp

#### POST /whatsapp/send?businessId=xxx
Send WhatsApp message (Protected)

**Request:**
```json
{
  "phone": "+919876543210",
  "message": "Hello! This is a test message.",
  "type": "text",
  "leadId": "optional-lead-id"
}
```

**Template Message:**
```json
{
  "phone": "+919876543210",
  "type": "template",
  "templateName": "hello_world",
  "languageCode": "en",
  "templateComponents": []
}
```

#### POST /whatsapp/webhook
WhatsApp webhook endpoint (Public - for Meta to call)

#### GET /whatsapp/messages?businessId=xxx
Get message logs (Protected)

#### GET /whatsapp/messages/:id
Get message by ID (Protected)

---

### Invoices

#### POST /invoices?businessId=xxx
Create invoice (Protected)

**Request:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210",
  "customerAddress": "123 Street, City",
  "items": [
    {
      "description": "Web Development",
      "quantity": 1,
      "unitPrice": 50000,
      "amount": 50000
    }
  ],
  "tax": 9000,
  "discount": 0,
  "currency": "INR",
  "dueDate": "2025-12-31",
  "notes": "Payment due in 30 days",
  "leadId": "optional-lead-id",
  "sendPaymentLink": true,
  "sendWhatsApp": true
}
```

#### POST /invoices/:id/payment-link
Generate Razorpay payment link (Protected)

#### POST /invoices/:id/send-whatsapp
Send invoice via WhatsApp (Protected)

#### PATCH /invoices/:id/status
Update invoice status (Protected)

**Request:**
```json
{
  "status": "paid",
  "paymentId": "razorpay-payment-id",
  "orderId": "razorpay-order-id"
}
```

#### GET /invoices?businessId=xxx
Get all invoices (Protected)

Query params:
- `status`: Filter by status

#### GET /invoices/:id
Get invoice by ID (Public - for customer viewing)

---

### Bookings

#### POST /bookings?businessId=xxx
Create booking (Public - for customer self-service)

**Request:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210",
  "bookingDate": "2025-12-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "duration": 60,
  "notes": "Need consultation",
  "leadId": "optional"
}
```

#### PATCH /bookings/:id
Update booking (Protected)

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

#### GET /bookings?businessId=xxx
Get all bookings (Protected)

Query params:
- `status`: Filter by status
- `date`: Filter by date

#### GET /bookings/slots?businessId=xxx&date=2025-12-15
Get available time slots (Public)

#### GET /bookings/:id
Get booking by ID (Public)

---

### Dashboard

#### GET /dashboard/stats?businessId=xxx
Get dashboard statistics (Protected)

**Response:**
```json
{
  "totalLeads": 150,
  "totalInvoices": 45,
  "totalBookings": 30,
  "totalMessages": 500,
  "paidInvoices": 40,
  "pendingBookings": 5,
  "totalRevenue": 2500000
}
```

#### GET /dashboard/activity?businessId=xxx
Get recent activity (Protected)

**Response:**
```json
{
  "leads": [...],
  "invoices": [...],
  "bookings": [...],
  "messages": [...]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## Rate Limiting

API is rate limited to:
- 10 requests per minute per IP
- Adjust in backend configuration if needed

---

## Webhooks

### WhatsApp Webhook

Meta will send POST requests to `/api/whatsapp/webhook` for:
- Incoming messages
- Message status updates
- Read receipts

Webhook verification (GET request):
```
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=your-token&hub.challenge=challenge
```

---

## Testing with Swagger

API documentation with interactive testing available at:

```
http://localhost:4000/api
```

---

## Need Help?

- Check [Installation Guide](./INSTALLATION.md)
- View [README](./README.md)
- Open GitHub Issue
