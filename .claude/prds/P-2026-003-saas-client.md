# Product Requirements Document (PRD): SaaS Client Portal

## 1. Introduction
The SaaS Client Portal is the public-facing interface that allows new users to discover the platform, sign up for an account, create their own tenant (shop), and subscribe to a service plan.

## 2. Problem Statement
Currently, tenants and users are seeded manually or via limited admin tools. There is no self-service flow for a public user to register and provision their own environment.

## 3. Goals
- **Self-Service Registration**: Users can sign up and create a tenant in one flow.
- **Monetization**: Users can select a pricing plan (Basic/Pro) during registration.
- **Account Management**: Users can log in and view their subscription status.

## 4. User Stories
- As a **Visitor**, I want to view pricing plans so I can choose the right one.
- As a **Visitor**, I want to register an account and name my shop/tenant.
- As a **Tenant Owner**, I want to view my current subscription plan.

## 5. Functional Requirements
### 5.1. Registration Flow
- **Inputs**: Email, Password, Full Name, Shop Name (Tenant Name), Shop Domain (Subdomain).
- **Process**:
    1. Validate email uniqueness.
    2. Validate subdomain uniqueness.
    3. Create Tenant record.
    4. Create User record (assigned as Tenant Owner).
    5. Link User to Tenant.
    6. Default to "Basic" plan (or selected plan).

### 5.2. Subscription (Mock/Stub)
- **Pricing Page**: Display "Basic" ($0) and "Pro" ($29) plans.
- **Subscribe**: Simple API call to update Tenant's `plan` field. (Stripe integration is out of scope for MVP, will use Stub).

### 5.3. Client Dashboard
- View User Profile.
- View Tenant Info (Name, Domain).
- View Subscription Status.

## 6. Non-Functional Requirements
- **Security**: Password hashing, Input validation (Zero Trust).
- **Isolation**: New user must only access their own tenant.
- **Performance**: Registration should confirm within 2 seconds.

## 7. Success Metrics
- Successful creation of Tenant + User pairs via UI.
- Correct role assignment (Tenant Owner) upon registration.
