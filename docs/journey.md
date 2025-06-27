## 🧭 User Journey: Community Onboarding & Participation

### 1. **User Registration**

ID service: auri https://github.com/auri/auri

* **Input**: Email, password, basic profile info (optional: real name, display name).
* **Backend**: Creates a user record and optionally a linked "weaver" record.

---

### 2. **Weaver Profile & Application Submission**

* **Prompted** to submit a **Weaver application**, including:

  * Locational data (e.g., postcode, geolocation, or town)
  * Optional profile details or motivation statement
  * **Status**: Marked as `new` in the `applications` table.

#### ✅ Application Review

* Reviewed by a **global admin** (or automated scoring / flagging system).
* Status updated to `approved`.
* User now becomes a verified *Weaver* and can proceed.

---

### 3. **Association Discovery (Location-Gated)**

* Once approved, user can request associations **near their location**.
* System returns **3 closest associations**, calculated by proximity.

#### 🔒 Access Control & Privacy Logic:

* **Rate limiting** by IP or user (e.g., max 2 queries/hour).
* **Geofenced discovery**: must provide a locational query close to user's saved location (±X km).
* Optional: **obfuscation** of exact association coordinates until a user applies or is approved.

> *This prevents scraping the full list of associations globally and protects small communities.*

---

### 4. **Application to Association**

* User selects one of the 3 nearby associations.
* Submits an application (creates new `applications` record).
* Status starts as `new` → reviewed by **admins** of that association.

#### Association Admins May:

* Mark as `under_review`, `invited`, or `approved`
* Optionally message the applicant

Once **approved**, the user is:

* Added to the association's population count
* Granted member access to its events and discussions

---

### 5. **Events & Participation**

* Member sees upcoming events for their association.
* Can RSVP to events (creates `rsvp` record)
* Can be checked in at the event (`checkin` record)

---

### 6. **Optional Flows**

* **Transfer**: Leave or apply to another association (if permitted)
* **Admin Promotion**: Association owner/admins can promote members
* **Self-removal**: Application status `kicked` or `selfimmolate`
