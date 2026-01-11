# 📧 Email Module

**Version:** 1.0.0  
**Status:** Phase 1 & 2 Complete (Foundation + Use-Cases)

## Overview

Module hóa hệ thống email automation theo Clean Architecture.

### Mục Đích

- Gửi transactional emails (order, payment, shipping, etc.)
- Gửi marketing emails (cart recovery, review requests, promos)
- Template management với variable replacement
- Retry logic cho reliability
- Communication logging

### Kiến Trúc

```
features/email/
├── types/                    # DTOs, Constants
│   └── EmailDTO.js
├── domain/                   # Business Logic (không phụ thuộc infra)
│   ├── policies/
│   │   └── retryPolicy.js
│   └── services/
│       └── templateEngine.js
├── infrastructure/           # External Dependencies
│   ├── providers/
│   │   ├── IEmailProvider.js   # Port interface
│   │   └── Base44EmailProvider.js
│   └── repositories/
│       ├── emailTemplateRepository.js
│       └── emailLogRepository.js
├── application/              # Use Cases
│   ├── use-cases/
│   │   ├── sendTransactionalEmail.js
│   │   ├── sendMarketingEmail.js
│   │   └── previewTemplate.js
│   └── EmailServiceFacade.js   # Main Public API
├── index.js                  # PUBLIC API ONLY
└── README.md
```

## Public API

### EmailServiceFacade (Recommended)

```javascript
import { EmailServiceFacade } from '@/components/features/email';

// Order emails
await EmailServiceFacade.sendOrderConfirmation(order);
await EmailServiceFacade.sendShippingNotification(order);
await EmailServiceFacade.sendDeliveryConfirmation(order);
await EmailServiceFacade.sendOrderCancellation(order, reason);

// Payment emails
await EmailServiceFacade.sendPaymentConfirmation(order);
await EmailServiceFacade.sendPaymentFailed(order);

// Marketing emails
await EmailServiceFacade.sendCartRecovery(cart, discountCode);
await EmailServiceFacade.sendReviewRequest(order);
await EmailServiceFacade.sendWelcomeEmail(user);

// PreOrder emails
await EmailServiceFacade.sendHarvestReminder(order, lot, daysUntil);
await EmailServiceFacade.sendHarvestReady(order, lot);
await EmailServiceFacade.sendDepositReminder(order, daysLeft);

// Referral emails
await EmailServiceFacade.sendReferralWelcome(member);
await EmailServiceFacade.sendReferralCommission(member, amount, customer);

// Custom
await EmailServiceFacade.sendCustomEmail({
  type: 'custom',
  recipientEmail: 'user@example.com',
  data: { ... }
});
```

### Use Cases (for custom flows)

```javascript
import { sendTransactionalEmail, sendMarketingEmail } from '@/components/features/email';

await sendTransactionalEmail({
  type: 'order_confirmation',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  data: { order_number: '123', ... }
});
```

### Types & Constants

```javascript
import { EMAIL_TYPE_CONFIG, COMMON_TEMPLATE_VARIABLES } from '@/components/features/email';

// Get config for a type
const config = EMAIL_TYPE_CONFIG['order_confirmation'];
console.log(config.label); // "Xác nhận đơn hàng"
console.log(config.icon);  // "✅"
console.log(config.variables); // Available template variables
```

## Template System

### Variable Syntax

Templates support Mustache-like syntax:

```html
<!-- Simple variable -->
<p>Xin chào {{customer_name}}!</p>

<!-- With filters -->
<p>Tổng: {{total_amount|currency}}</p>
<p>Ngày: {{order_date|date}}</p>

<!-- Conditionals -->
{{#if discount_amount}}
<p>Giảm giá: {{discount_amount|currency}}</p>
{{/if}}

<!-- Loops -->
{{#each items}}
<div>{{product_name}} x {{quantity}}</div>
{{/each}}
```

### Available Filters

- `uppercase`, `lowercase`, `capitalize`
- `number` - Format with locale
- `currency` - Format with "đ" suffix
- `date`, `datetime` - Date formatting
- `trim`, `escape` - String utilities

## Provider Abstraction

Module sử dụng Port/Adapter pattern cho email provider:

```javascript
// IEmailProvider interface (Port)
interface IEmailProvider {
  send(params: SendEmailParams): Promise<SendEmailResult>;
  sendBulk(recipients, subject, htmlBody): Promise<BulkResult>;
  isAvailable(): Promise<boolean>;
  healthCheck(): Promise<HealthStatus>;
}

// Current implementation: Base44EmailProvider
// Future: SendGridProvider, AwsSesProvider
```

## Retry Policy

Automatic retry with exponential backoff:

- Max retries: 3
- Base delay: 2 seconds
- Max delay: 30 seconds
- Jitter: Yes (prevents thundering herd)

Network/transient errors are retried. Permanent errors (invalid email, auth) fail immediately.

## ❌ DO NOT

```javascript
// ❌ Deep import - WRONG
import { emailTemplateRepository } from '@/features/email/infrastructure/repositories/emailTemplateRepository';
import { templateEngine } from '@/features/email/domain/services/templateEngine';

// ✅ Use public API - CORRECT
import { EmailServiceFacade } from '@/components/features/email';
```

## Migration from Legacy

If migrating from `CommunicationService`:

```javascript
// OLD
import CommunicationService from '@/components/services/CommunicationService';
await CommunicationService.sendOrderConfirmation(order);

// NEW
import { EmailServiceFacade } from '@/components/features/email';
await EmailServiceFacade.sendOrderConfirmation(order);
```

## Dependencies

- `@/api/base44Client` - Base44 SDK
- Entity: `EmailTemplate` - Database templates
- Entity: `CommunicationLog` - Email logs

## Next Phases

- Phase 3: Event-Driven (subscribe to ORDER_PLACED, etc.)
- Phase 4: Migrate transactional emails
- Phase 5: Migrate marketing emails
- Phase 6: Template enhancements (A/B testing, analytics)
- Phase 7: UI integration

See: `components/instruction/EmailModuleRefactorPlan.md