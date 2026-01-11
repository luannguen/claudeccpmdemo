# Epic: SaaS Client Features (E-2026-003)

## Description
Implement the client-facing side of the SaaS platform, enabling self-service registration, subscription management, and a dedicated client dashboard.

## Scope
- Registration Page (SignUp + Tenant Creation)
- Pricing/Subscription Page (Plan Selection)
- Client Dashboard (User & Subscription Info)
- Backend APIs for atomic Registration

## Milestones
1.  **Backend Core**:
    - [ ] `POST /api/saas/register`: Create Tenant + User + Role (atomic transaction).
    - [ ] `POST /api/saas/subscribe`: Update plan.

2.  **Frontend Pages**:
    - [ ] `PricingPage`: Display plans.
    - [ ] `RegisterPage`: Form for User & Shop details.
    - [ ] `ClientDashboard`: Basic info view.

3.  **Integration**:
    - [ ] `saasService` implementation.
    - [ ] Auth flow update (login after register).
    - [ ] Route protection.

## Technical Notes
- Use `mongoose.startSession()` for atomic registration (if replica set enabled) or careful error handling/rollback.
- Ensure `tenantId` is correctly populated on the created user.
- Password must be hashed.
