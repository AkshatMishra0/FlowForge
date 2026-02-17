# FlowForge API Documentation

## Overview

FlowForge provides a comprehensive REST API for managing business operations including leads, invoices, bookings, and WhatsApp automation.

## Base URL

```
http://localhost:4000/api
```

## Authentication

All API requests (except auth endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Rate Limiting:**
- Max 5 failed attempts per hour
- 15-minute block after 5 failures

### Search

#### GET /search
Global search across all entities.

**Query Parameters:**
- `q` (required): Search query
- `businessId` (required): Business ID
- `types` (optional): Comma-separated entity types (leads,invoices,bookings,messages)
- `limit` (optional): Results limit (default: 10)

**Response:**
```json
{
  "leads": [...],
  "invoices": [...],
  "bookings": [...],
  "messages": [...],
  "totalResults": 15
}
```

#### GET /search/suggestions
Get search autocomplete suggestions.

**Query Parameters:**
- `q` (required): Search query (min 2 characters)
- `businessId` (required): Business ID

**Response:**
```json
["John Doe", "Jane Smith", "Consulting Service"]
```

### Reports

#### GET /reports/business/:businessId
Generate comprehensive business report.

**Query Parameters:**
- `format`: json | csv (default: json)
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)

**Response:**
```json
{
  "leads": [...],
  "invoices": [...],
  "bookings": [...],
  "messages": [...]
}
```

#### GET /reports/revenue/:businessId
Get revenue analytics report.

**Query Parameters:**
- `startDate` (required): ISO date string
- `endDate` (required): ISO date string

**Response:**
```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "totalInvoices": 50,
  "paidInvoices": 40,
  "totalRevenue": 50000,
  "paidRevenue": 40000,
  "pendingRevenue": 10000,
  "averageInvoiceValue": 1000
}
```

#### GET /reports/lead-conversion/:businessId
Get lead conversion statistics.

**Response:**
```json
{
  "totalLeads": 100,
  "convertedLeads": 30,
  "conversionRate": "30.00%",
  "statusBreakdown": {
    "new": 20,
    "contacted": 30,
    "qualified": 20,
    "converted": 30,
    "lost": 0
  }
}
```

### Bulk Operations

#### POST /bulk/leads/update-status
Bulk update lead status.

**Request Body:**
```json
{
  "leadIds": ["lead-1", "lead-2"],
  "status": "qualified"
}
```

**Response:**
```json
{
  "updated": 2,
  "failed": 0,
  "errors": []
}
```

#### POST /bulk/leads/import
Bulk import leads from CSV data.

**Request Body:**
```json
{
  "data": [
    {
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "source": "website"
    }
  ]
}
```

#### POST /bulk/invoices/send
Bulk send invoices.

**Request Body:**
```json
{
  "invoiceIds": ["invoice-1", "invoice-2"]
}
```

### Performance

#### GET /performance/stats
Get performance statistics.

**Query Parameters:**
- `operation` (optional): Filter by operation name

**Response:**
```json
[
  {
    "operation": "searchLeads",
    "count": 150,
    "avgDuration": 45.2,
    "minDuration": 12.5,
    "maxDuration": 320.1,
    "p95Duration": 180.5,
    "p99Duration": 280.3
  }
]
```

#### GET /performance/memory
Get current memory usage.

**Response:**
```json
{
  "rss": 150,
  "heapTotal": 80,
  "heapUsed": 65,
  "external": 5
}
```

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
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limits

- General API: 10 requests per minute
- Search endpoints: 20 requests per minute
- Login attempts: 5 per hour per email

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Skip number of results (default: 0)

**Response Structure:**
```json
{
  "data": [...],
  "total": 250,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

## Webhooks

### POST /whatsapp/webhook
Receive WhatsApp webhook events.

**Verification:**
- Query param: `hub.mode=subscribe`
- Query param: `hub.verify_token=<your-token>`
- Returns: `hub.challenge` value

**Payload:**
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "1234567890",
                "text": {
                  "body": "Hello"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## CSV Export Format

All CSV exports follow this structure:

### Leads Export
```csv
id,name,phone,email,status,source,createdAt
lead-1,John Doe,1234567890,john@example.com,new,website,2026-02-01
```

### Invoices Export
```csv
id,invoiceNumber,status,total,dueDate,createdAt
invoice-1,INV-001,paid,1000,2026-02-15,2026-02-01
```

## Best Practices

1. **Always include businessId** - Required for multi-tenant operations
2. **Use pagination** - For large datasets
3. **Handle rate limits** - Implement exponential backoff
4. **Validate input** - Use proper data types
5. **Check response status** - Handle errors gracefully
6. **Use search suggestions** - For better UX
7. **Monitor performance** - Check /performance endpoints regularly

## SDK Examples

### JavaScript/TypeScript

```typescript
const flowforge = require('flowforge-sdk');

const client = new flowforge.Client({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:4000/api'
});

// Search leads
const results = await client.search.global({
  q: 'John',
  businessId: 'business-1',
  types: ['leads']
});

// Generate report
const report = await client.reports.revenue({
  businessId: 'business-1',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});

// Bulk operations
const bulkResult = await client.bulk.updateLeadStatus({
  businessId: 'business-1',
  leadIds: ['lead-1', 'lead-2'],
  status: 'qualified'
});
```

## Support

- Documentation: https://docs.flowforge.io
- API Status: https://status.flowforge.io
- Support: support@flowforge.io
