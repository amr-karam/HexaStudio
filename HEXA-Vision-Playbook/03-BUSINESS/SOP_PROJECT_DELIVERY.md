# SOP-BO-03: Project Delivery & Handoff

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** Project Manager / Frontend Lead  

---

## Goal

To deliver the final high-fidelity 3D assets and project documentation to the client in a professional manner, ensuring client satisfaction and formal project closure.

## Prerequisites

- All project milestones marked as "Completed" in Odoo.
- Final quality audit passed (Gate 5).
- Final renderings and 3D models verified.

## Step-by-Step Process

### 1. Final Review
- **Internal Audit:** Perform a final check of all deliverables against the original scope.
- **Client Approval:** Host a "Final Walkthrough" call; client signs off on the final version.

### 2. Asset Packaging
- **Optimization:** Run final Draco compression and texture optimization on 3D models.
- **Organization:** Structure files in MinIO: `/projects/{uuid}/final/`.
- **Documentation:** Generate a "Project Delivery Manual" (usage guide for the 3D scene).

### 3. Handoff via Portal
- **Upload:** Move final assets to the "Final Deliverables" folder in the Client Portal.
- **Notification:** Send "Project Delivered" notification via email and portal.
- **Access:** Grant the client permanent download access to final assets.

### 4. Formal Closure
- **Final Invoice:** Issue the final balance invoice in Odoo.
- **Project Status:** Mark project as "Delivered" in Odoo.
- **Feedback:** Send a satisfaction survey via the portal.
- **Archiving:** Move project data to the "Archive" bucket in MinIO after 90 days.

## Verification

- [ ] Final deliverables uploaded and accessible.
- [ ] Client has signed off on the final version.
- [ ] Final invoice issued.
- [ ] Project marked as "Delivered" in Odoo.

## Exception Handling

| Issue | Action |
|-------|---------|
| Last-minute changes | Create a "Change Order" and adjust final invoice |
| Payment delay | Restrict portal access to deliverables until paid |
| Technical issues | Provide technical support for asset loading |

## Related Docs

- `03-BUSINESS\SOPs.md`
- `09-ODOO\PROJECTS.md`
- `12-CLIENT-PORTAL\FILES.md`
