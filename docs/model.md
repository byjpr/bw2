### 🧶 **Weavers**

Represents users engaging with the system (e.g. community members).

| Field        | Type         | Notes                        |
| ------------ | ------------ | ---------------------------- |
| `id`         | UUID / PK    | Primary key                  |
| `location`   | Geo / String | Location data for the weaver |
| `user_id`    | Foreign Key  | Links to user account (1:1)  |
| `created_at` | DateTime     | Timestamp of creation        |

---

### 🏘 **Associations**

Represents a community group or unit.

| Field            | Type         | Notes                                    |
| ---------------- | ------------ | ---------------------------------------- |
| `id`             | UUID / PK    | Primary key                              |
| `location`       | Geo / String | Base location of the association         |
| `population`     | Integer      | Current number of members                |
| `max_population` | Integer      | Default: 30                              |
| `admins`         | List\[FK]    | User IDs of approvers/admins             |
| `owner_id`       | Foreign Key  | Primary owner/creator of the association |

---

### 📄 **Applications**

Tracks users applying to join associations.

| Field            | Type        | Notes                                                                  |
| ---------------- | ----------- | ---------------------------------------------------------------------- |
| `id`             | UUID / PK   | Primary key                                                            |
| `user_id`        | Foreign Key | Applicant                                                              |
| `association_id` | Foreign Key | Target association                                                     |
| `created_at`     | DateTime    | Application submission date                                            |
| `status`         | Enum        | `new`, `under_review`, `invited`, `approved`, `kicked`, `selfimmolate` |
| `approved`       | Boolean     | Whether the application was approved (default: false)                  |
| `approved_by`    | Foreign Key | User ID of the approver (nullable, set if approved)                    |

---

### 🎟 **Events**

Scheduled events within or outside associations.

| Field            | Type         | Notes                                                     |
| ---------------- | ------------ | --------------------------------------------------------- |
| `id`             | UUID / PK    | Primary key                                               |
| `association_id` | Foreign Key  | Organising association                                    |
| `location`       | Geo / String | Event location                                            |
| `name`           | String       | Event name/title                                          |
| `date`           | Date         | Date of event                                             |
| `arrival_time`   | Time         | Suggested or official arrival time                        |
| `arrival_rules`  | Enum         | `on_time`, `british_social`, `british_business`, `german` |
| `description_md` | Markdown     | Event description (Markdown-supported)                    |
| `ticket_link`    | URL          | Optional external ticketing or RSVP link                  |


---

### 📬 **RSVPs** (Future)

| Field          | Type        | Notes                                                      |
| -------------- | ----------- | ---------------------------------------------------------- |
| `id`           | UUID / PK   | Primary key                                                |
| `event_id`     | Foreign Key | Links to the `events` table                                |
| `user_id`      | Foreign Key | Links to the `users` table                                 |
| `status`       | Enum        | `yes`, `no`, `maybe`, `late`, `cancelled` (default: `yes`) |
| `comment`      | Text        | Optional message from the user                             |
| `guests_count` | Integer     | Optional number of additional guests (default: 0)          |
| `responded_at` | DateTime    | Timestamp of RSVP                                          |


---

### ✅ **Checkins** (Future)

| Field           | Type        | Notes                                                         |
| --------------- | ----------- | ------------------------------------------------------------- |
| `id`            | UUID / PK   | Primary key                                                   |
| `event_id`      | Foreign Key | Links to `events` table                                       |
| `user_id`       | Foreign Key | Links to `users` table                                        |
| `checked_in_at` | DateTime    | Timestamp when user was checked in                            |
| `checked_in_by` | Foreign Key | Optional – user ID of the organizer/staff who checked them in |
| `notes`         | Text        | Optional field for notes (e.g. late arrival, issue, etc.)     |

---

### 🔔 Notifications (future)

| Field        | Type        | Notes                                 |
| ------------ | ----------- | ------------------------------------- |
| `id`         | UUID / PK   | Primary key                           |
| `user_id`    | Foreign Key | Recipient                             |
| `type`       | Enum        | `application_update`, `event_invite` |
| `content`    | Text        | Message body                          |
| `read_at`    | DateTime    | Null if unread                        |
| `created_at` | DateTime    | Timestamp                             |
