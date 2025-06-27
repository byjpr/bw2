## 👤 1. Weaver (Public User)

These pages are available to users registering and participating as individual community members.

### 1.1 `/` – Landing Page
- App overview and mission
- CTA: Register or Log In
- Public links to Conduct, Terms

### 1.2 `/weaver/register`
- Email, password, username
- Optional motivation
- Submit to create IDP account

### 1.3 `/weaver/apply`
- Location input (postcode, geolocation)
- Twitter handle, Discord username
- Selected personality or motivation questions
- Submit to become a Weaver

### 1.4 `/weaver/status`
- Shows current application status (`new`, `under_review`, `approved`)
- Timeline or ETA if applicable

### 1.5 `/associations/discover`
- Map or list of 3 closest associations
- Rate limited per IP/user
- Blurred details until apply

### 1.6 `/associations/apply/:id`
- Association overview
- Input optional motivation
- Submit application

### 1.7 `/applications`
- Show list of submitted applications
- Allow withdrawal or view status

### 1.8 `/association`
- Overview of approved association
- Events, notices, announcements
- Option to leave or request transfer

### 1.9 `/events`
- Event list for current association
- RSVP options

### 1.10 `/events/:id`
- Event detail page
- RSVP status and update
- Event rules and instructions
- View attendees (if public)

### 1.11 `/events/:id/checkin`
- **For members only:** QR code to present for check-in

### 1.12 `/messages`
- Threaded messages with admins
- Only available during applications/events

### 1.13 `/settings`
- Email, password, display name
- Notification settings
- Request leave/transfer
- Delete account

### 1.14 `/conduct`
- Code of conduct
- Age/consent requirements
- Report abuse

### 1.15 `/feedback`
- Optional survey or open feedback box

### 1.16 `/404` & `/error`
- Page not found / unexpected error display

---

## 🛡 2. Association Admin

These pages are available to admins of individual associations.

### 2.1 `/admin/association/:id`
- Member list with management actions
- Application queue (accept/reject)
- Role assignment (admin promotion/demotion)
- Internal notes

### 2.2 `/admin/association/:id/events`
- List of events for association
- Create/edit/delete events
- View RSVP counts

### 2.3 `/admin/association/:id/events/:id`
- Event detail with full control
- Set attendance rules, limits

### 2.4 `/admin/events/:id/checkin`
- QR scanner or manual check-in
- Mark attendance
- Add no-show notes

### 2.5 `/admin/association/:id/insights`
- Stats on participation, application volume
- Member retention, engagement charts
- Feedback and issues reported

---

## 🧑‍💼 3. Platform Admin

For managing the full platform (superadmin/global admin).

### 3.1 `/admin`
- Global dashboard for all pending Weaver applications
- Filters: location, score, date
- Approve / reject / flag
- Metrics (apps per week, total users)

### 3.2 `/admin/weavers/:id`
- Detail view of individual Weaver applications
- View answers, social links, edit fields
- Approve / reject / blacklist

### 3.3 `/admin/associations`
- List of all associations
- Create new association
- Edit or deactivate existing ones

### 3.4 `/admin/associations/:id`
- Force-assign admins
- See full history and member churn
- View flagged issues or moderation logs

### 3.5 `/admin/moderation`
- Reported messages or users
- Resolution status (dismiss, warn, ban)

### 3.6 `/admin/insights`
- Global engagement stats
- Applications by geography, time
- Event participation heatmaps

---

## 🧾 Shared Legal Pages (All Roles)

These should be globally accessible:

### `/terms`
- Legal terms of service

### `/privacy`
- GDPR-compliant privacy policy
