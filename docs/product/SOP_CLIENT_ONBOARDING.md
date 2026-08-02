# SOP-BO-01: Client Onboarding

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** Product Owner / Sales Lead  

---

## Goal

To transition a qualified lead from the "Opportunity" stage in the CRM to an active "Client" with a project in progress, ensuring a premium first impression and complete data capture.

## Prerequisites

- Lead marked as "Won" in Odoo CRM.
- Client's primary contact information verified.
- Project scope and budget agreed upon.

## Step-by-Step Process

### 1. Account Creation
- **Odoo:** Convert the `crm.lead` to a `res.partner` (Customer).
- **Application:** Create a User account in the NestJS backend via the Admin Panel.
- **Linking:** Ensure the `x_website_user_id` in Odoo matches the User ID in the application database.

### 2. Project Initialization
- **Odoo:** Create a new `project.project` linked to the customer.
- **Milestones:** Apply the standard milestone template based on the project type (Residential/Commercial).
- **Portal Access:** Enable the `x_client_portal_active` flag on the project.

### 3. Client Welcome Package
- **Email:** Send the "Welcome to HEXA Studio" email sequence.
- **Credentials:** Provide the client with their portal login details.
- **Onboarding Call:** Schedule a 15-minute walkthrough of the Client Portal.

### 4. Document Collection
- **Request:** Ask client to upload a project brief and site photos via the Portal.
- **Verify:** Confirm all mandatory documents are uploaded to MinIO and linked in Odoo.

### 5. Internal Handoff
- **Notification:** Notify the Frontend and 3D leads via Slack.
- **Briefing:** Schedule a internal kickoff meeting to review the project goals.

## Verification

- [ ] User can log into the Client Portal.
- [ ] Project is visible to the client in the portal.
- [ ] Project milestones are populated and accurate.
- [ ] Welcome email sent and received.

## Exception Handling

| Issue | Action |
|-------|---------|
| Client cannot log in | Reset password and verify email in application DB |
| Portal shows no project | Verify `x_client_portal_active` flag in Odoo |
| Missing docs | Send automated reminder via Odoo email sequence |

## Related Docs

- `03-BUSINESS\BUSINESS_WORKFLOWS.md`
- `09-ODOO\CRM.md`
- `12-CLIENT-PORTAL\CLIENT_PORTAL.md`
