# NATIF OMS MASTER BLUEPRINT
**System:** oms.natif.vn (National Technology Innovation Fund - Online Management System)
**System Owner:** Dr. CDH (Chief of Office, NATIF)
**Legal Framework:** Decree 77/2026/ND-CP & Decree 268/2025/ND-CP
**Version:** 1.0
**Classification:** STRICTLY CONFIDENTIAL

---

## 1. CORE DIRECTIVES (THE BMAD PROTOCOL)
Any AI Agent (Roo Code) operating within this project MUST adhere to the following BMad (Behavior-Driven, Memory-Augmented Development) rules before executing any task:
1. **Context First:** Read this `natif_oms_master_blueprint.md` file before generating any code or architecture plan.
2. **Plan Before Execution:** Always create a step-by-step implementation plan in `bmad_memory/plans/` and await the System Owner's (Dr. CDH) approval.
3. **Language Rule:** All database schemas, variables, API routes, and system logic MUST be written in English. All UI/UX interfaces, user-facing error messages, and generated reports MUST be in professional Vietnamese administrative language.
4. **Security & RBAC:** Never bypass the Role-Based Access Control matrix. Financial and technological data are state secrets.

---

## 2. HIGH-LEVEL ARCHITECTURE
* **Infrastructure:** Cloud-based (Oracle Cloud / equivalent), highly scalable and secure.
* **Backend:** Microservices architecture (Node.js/Python). Must include distinct services for Operations, Finance, Evaluation, and External APIs.
* **Frontend:** Modern SPA (React/Vue/Next.js) with isolated dashboards for Internal Users, External Partners, and the Executive Board.
* **Database:** Relational database (PostgreSQL/Oracle) with strict ACID properties for financial transactions and JSONB support for dynamic scientific evaluation forms.

---

## 3. MASTER RBAC MATRIX (ROLE-BASED ACCESS CONTROL)
The system is divided into 4 operational blocks, governed by the `cdh-master-orchestrator`.

### A. The Master Orchestrator (God Mode)
* **[cdh-master-orchestrator]**: Ultimate System Owner. Overrides all sub-agents. Cross-references architecture, legal, finance, and council outputs. Focuses on holistic strategy, Q1 academic standards, and strict state legal frameworks.

### B. Core Tech & Architecture (IT Infrastructure)
* **[chief-system-architect]**: Designs DB schemas, APIs, and microservices. No executable code, only blueprints.
* **[full-stack-developer]**: Writes and tests frontend/backend code based on blueprints.
* **[security-devsecops]**: Implements JWT, OAuth2, data masking, and protects against OWASP top 10.
* **[data-scientist-ai]**: Builds AI integration (LiteLLM/9router), data pipelines, and socio-economic impact reports.

### C. NATIF Internal Operations (Business Logic)
* **[natif-executive]**: High-level governance, digital signatures, and final funding approvals.
* **[natif-dept-manager]**: Middle-management, task delegation, and cross-departmental data flows.
* **[natif-grants-specialist]**: Manages state orders and grants. Strict timeline and document validation.
* **[natif-voucher-startup]**: Manages the voucher marketplace, startup ecosystems, and vendor limits.
* **[natif-finance-disburse]**: Chief Accountant logic. State Treasury integration, interest rate support calculations.
* **[natif-legal-risk]**: Duplicate funding detection, contract generation, and compliance auditing.
* **[natif-admin-desk]**: Entry point for document reception, OCR, and initial routing.
* **[it-sysadmin-support]**: Helpdesk ticketing and system health monitoring.

### D. Evaluation & Audit (Appraisal Logic)
* **[scientific-council]**: Peer-review portals, digital voting matrices, and consensus algorithms (2/3 majority rules).
* **[independent-expert]**: Anonymous blind-review systems and isolated data scoring.
* **[financial-appraiser]**: Cross-checks proposed budgets against state financial norms.
* **[independent-auditor]**: Read-only access for external financial auditing and log exports.

### E. External Partners (Public Facing)
* **[external-partner]**: Portals for Applicant Enterprises, Commercial Banks (Debt Notification APIs), and Voucher Vendors. Focuses on UX/UI and secure Webhooks.

---

## 4. CORE BUSINESS MODULES TO BE DEVELOPED
When instructed to build the Frontend or Backend, focus on these 4 legal pillars:
1. **Grants & State Orders Module:** Workflow from application submission -> scientific council review -> financial appraisal -> contract signing -> periodic reporting -> final acceptance.
2. **Interest Rate Support Module:** API integration with Commercial Banks to verify debt collection and trigger automated interest support disbursement (capped at 50% interest, max 6%/year).
3. **Voucher Program Module:** A digital marketplace matching verified tech vendors with enterprises. Includes barcode/QR generation, redemption logic, and automated vendor payouts.
4. **Startup Ecosystem Module:** Tracking incubation programs, Techfest events, and monitoring startup growth KPIs.

---

## 5. DEVELOPMENT EXECUTION INSTRUCTIONS (For AI Agents)
* **When tasked with Frontend Development:** Read the RBAC matrix to build tailored dashboards. Ensure the UI gracefully handles complex state transitions (e.g., `Pending Review`, `Awaiting Signatures`).
* **When tasked with Backend Development:** Start by defining the PostgreSQL schema using the `chief-system-architect` mode. Ensure all API endpoints have RBAC middleware verifying the user's role before executing queries.
* **Data Masking Rule:** When designing the `independent-expert` or `scientific-council` evaluation APIs, strip all Personally Identifiable Information (PII) of the applicants from the payload unless explicitly authorized.
