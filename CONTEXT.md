# BuilderOS — Domain Glossary

BuilderOS is the platform made by Ambitious Labs to help its students — who aspire to create their own app using vibe coding tools — go from idea to shipped app. It combines an LMS, artifacts, coach calendar access, and is upsell-driven.

This document is a **glossary only**. It defines the language of the domain. It is not a spec, an architecture document, or a place for implementation decisions. Those belong in `docs/adr/` or in code.

---

## Terms

### Ambitious Labs
The company that owns and operates BuilderOS. Not a user-facing term inside the product unless explicitly branded.

### App
The product a [[Student]] is building on BuilderOS. Always called "app" — never "product", "project", "venture", or "build". One Student works toward one App at a time (TBD: confirm).

### App Idea
What the Student wants to build, captured at a general level. **Not an [[Artifact]].** The App Idea is the seed — it drives the conversations that produce every Artifact, and it feeds into the [[Master Prompt]] alongside the Artifacts. Think of it as the spec that everything else derives from.

### Artifact
A structured document a Student produces inside BuilderOS as part of building their [[App]]. Each Artifact has a defined type and captures one specific aspect of the App. Artifacts are produced through conversations driven by the [[App Idea]]. Confirmed Artifact types: Business Model, Database Design. Others TBD (see [[Artifact types]]).

### Artifact types
TBD — needs the exact enumeration locked. Candidates from the codebase: Business Model, Validation, Product Brief, UI/UX, Database Design, Landing Page, App Details. Confirmed so far: Business Model, Database Design.

### Master Prompt
The final derived output that combines the [[App Idea]] with all the [[Artifact]]s. It is what the Student ultimately pastes into their vibe-coding tool to build the App. **Conceptually distinct from an Artifact** — Master Prompt is a *result*, not an input — but it lives under the Artifact category in the data model for technical/grouping reasons.

### Student
The primary and canonical noun for a person using BuilderOS. A Student is enrolled with Ambitious Labs and is working toward shipping their [[App]]. Synonyms to avoid in domain language and UI copy: "founder", "member", "customer".

**DB note:** the underlying database table represents Students as `user` (legacy). Translate at the boundary — code that talks to the DB may say `user`, but anything above the data layer should say Student.

### Admin
An Ambitious Labs staff member with elevated permissions to manage Students, content, and billing. Not a customer-facing role.

### Coach
A customer-facing **label**, not a system role. There is only one staff role: [[Admin]]. "Coach" is what Students see when an Admin runs a 1-on-1 session or authors LMS content. Permissions live on Admin; "Coach" is presentation.

### Vibe coding tool
TBD — needs definition. Working hypothesis: external AI-assisted code-generation tools (Lovable, Cursor, v0, etc.) that a Student uses *outside* BuilderOS to actually build their App. BuilderOS produces the inputs (artifacts, prompts) that get pasted into these tools.

### Upsell
TBD — needs definition. Working hypothesis: paid upgrades layered on top of a base tier (coaching, premium content, etc.).
