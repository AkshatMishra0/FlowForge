# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - March 2026
- **Lead Search:** Full-text search across leads with pagination support (name, phone, email, company, notes)
- **Bulk Lead Import:** New `bulkCreateLeads` method with per-lead validation and duplicate phone detection
- **Invoice Statistics:** `getInvoiceStats` endpoint returning payment rates, overdue counts, and average invoice value
- **Weekly Revenue Trend:** Analytics service now computes week-by-week revenue breakdown for configurable lookback windows
- **Customer Pagination:** Customer listing now supports `page`/`limit` pagination with total count metadata
- **Payment Retry Logic:** Exponential backoff retry mechanism for transient Razorpay API failures
- **Notification Deduplication:** `isDuplicateNotification` check prevents sending duplicate alerts within a configurable time window

### Fixed - March 2026
- Removed stale auto-generated comment blocks from lead, invoice, analytics, customer, notification, auth, and payment services
- Dashboard `getRecentActivity` now wraps parallel queries in try/catch with structured error logging
- Dashboard `getPerformanceMetrics` validates `days` parameter to prevent out-of-range queries (clamped 1–365)

### Changed - March 2026
- Customer `findAll` now returns `{ customers, pagination }` object instead of a flat array
- Payment link creation uses retry-with-backoff by default (3 attempts, 500ms base delay)
- Notification throttle window is configurable per call (default: 60 minutes)

### Added - February 2026
- **Health Monitoring:** Enhanced health service with system metrics, CPU usage, and historical tracking
- **Request Logging:** Advanced logging interceptor with metrics, security, and performance tracking
- **Authorization System:** Role-based access control (RBAC) with permissions guard
- **Rate Limiting:** Enhanced rate limit guard with blocking mechanism and headers
- **UI Components:** Comprehensive UI library (Button, Input, Card, Badge, Modal, Textarea)
- **Custom Hooks:** React hooks for async operations, debouncing, localStorage, and media queries
- **Configuration:** Environment validation with comprehensive .env documentation
- **Developer Tools:** Makefile for common tasks and EditorConfig for consistent coding styles
- **Testing:** Unit tests for health service, rate limit guard, and permissions guard
- **Decorators:** Utility decorators (@Public, @CurrentUser, @ApiPaginatedResponse)

### Changed - February 2026
- Enhanced error handling in logging with sensitive data sanitization
- Improved health check responses with formatted uptime and memory percentages
- Rate limit guard now tracks by user ID for authenticated requests
- Updated .env.example with detailed comments and categorization

### Security - February 2026
- Automatic rate limit blocking for excessive requests
- Sensitive field redaction in request logs
- Enhanced permission system with granular access control
- Secure environment variable validation

---

## [1.0.0] - 2025-11-01

### Added
- WhatsApp automation with Cloud API integration
- Smart invoicing with Razorpay payment links
- Payment reminder system with automated follow-ups
- Booking system with Google Calendar sync
- Mini CRM for lead management
- Analytics dashboard
- Authentication with NextAuth.js
- Background job processing with BullMQ
- Docker support for development

### Security
- JWT-based authentication
- OAuth 2.0 with Google
- Environment variable validation
- API rate limiting with throttler

---

## Planned

### Future Features
- Multi-language support
- Advanced analytics with AI insights
- Custom workflow builder
- Mobile app (iOS & Android)
- Advanced reporting with scheduled exports
- Integration marketplace
- Team collaboration features
