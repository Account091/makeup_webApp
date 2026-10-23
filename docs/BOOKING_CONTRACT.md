# Booking Data Contract (go-live core flow)

Single source of truth shared by the customer website (`customer-web/`) and the
Flutter admin app (`lib/`). If code disagrees with this file, the code is wrong.

## Flow

```
Customer (web)                         Server (Next.js API, firebase-admin)        Admin (Flutter, signed in)
--------------                         ------------------------------------        --------------------------
/book  pick service+date+details  -->  POST /api/booking/create-session
                                       - price from services/{id} + settings
                                       - transaction: calendar/{date} must be free
                                         -> HOLD (expiresAt = now + holdMinutes)
                                       - bookings/{bookingId} DEPOSIT_PENDING
pay UPI (QR / deep link), upload  -->  POST /api/booking/submit-proof (multipart)
screenshot + UTR                       - checks hold not expired, UTR unique
                                       - Storage payment_proofs/{bookingId}/...
                                       - status PAYMENT_PROOF_SUBMITTED             sees it in Payment Verification
                                                                                   Approve -> CONFIRMED, calendar BOOKED
                                                                                   Reject  -> PAYMENT_REJECTED, calendar freed
/track  bookingId + phone         -->  POST /api/booking/lookup (sanitized view)
```

Customers never read or write Firestore directly. All customer writes go through
the API routes, which use the **firebase-admin** SDK (service account).
The admin app talks to Firestore directly as a signed-in staff user whose custom
claims are `{ role: "owner" | "admin", orgId: "makeovers_by_prachi" }`.

## Collections

### `bookings/{bookingId}` — document ID **is** the booking ID
Booking ID format: `MBP-` + 6 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (e.g. `MBP-7K2QXD`).

| field | type | notes |
|---|---|---|
| `bookingId` | string | same as doc ID |
| `status` | string | see Booking status |
| `customerDetails` | map | `fullName`, `phone` (10 digits, no +91), `email` (may be "") |
| `event` | map | `type` (service title), `date` (`YYYY-MM-DD`), `readyByTime` (`HH:mm`), `venue`, `city`, `guestCount` (int) |
| `serviceId` | string | doc ID in `services` |
| `serviceTitle` | string | |
| `packageName` | string? | |
| `notes` | string? | customer notes |
| `commercials` | map | `basePrice`, `travelFee`, `totalAmount`, `depositRequired`, `depositPaid` (numbers, INR) |
| `payment` | map | `upiId`, `payeeName`, `status`, `utrNumber?`, `proofPath?` (Storage path), `submittedAt?`, `verifiedAt?`, `verifiedBy?` (uid/email), `rejectionReason?` |
| `expiresAt` | string ISO | end of the hold; only meaningful while `DEPOSIT_PENDING` |
| `createdAt` / `updatedAt` | Timestamp | |
| `confirmedAt?` / `cancelledAt?` | Timestamp | |

### Booking status (`status`) — UPPER_SNAKE, exactly these values
| value | meaning | who sets |
|---|---|---|
| `DEPOSIT_PENDING` | hold created, waiting for customer's UPI payment | server |
| `PAYMENT_PROOF_SUBMITTED` | screenshot/UTR uploaded, awaiting admin | server |
| `CONFIRMED` | admin verified the deposit; date is booked | admin |
| `PAYMENT_REJECTED` | admin rejected the proof (reason in `payment.rejectionReason`); date freed | admin |
| `EXPIRED` | hold lapsed without proof | server (lazily, on next touch) |
| `CANCELLED` | cancelled by admin after confirmation | admin |
| `COMPLETED` | event done | admin |

### Payment status (`payment.status`)
`DEPOSIT_PENDING` → `VERIFICATION_PENDING` → `VERIFIED` | `REJECTED`; or `EXPIRED`.

### `calendar/{YYYY-MM-DD}` — one bridal booking per date
| field | type | notes |
|---|---|---|
| `status` | `HOLD` \| `BOOKED` \| `BLOCKED` | |
| `bookingId` | string? | for HOLD/BOOKED |
| `expiresAt` | string ISO? | for HOLD; an expired HOLD counts as free |
| `note` | string? | admin note for BLOCKED |
| `updatedAt` | Timestamp | |

A date is **available** when the doc is missing, or it is `HOLD` with `expiresAt` in the past.
Public read (availability check), admin write. Server writes via admin SDK.

### `services/{serviceId}`
`title`, `description`, `price` (number INR), `category`, `durationMinutes?`, `imageUrl?`,
`active` (bool), `sortOrder` (int). Public read, admin write. The website lists only `active == true`,
ordered by `sortOrder`, and the server prices bookings from this collection.

### `settings/business`
| field | example |
|---|---|
| `businessName` | `Makeovers by Prachi` |
| `upiId` | `studio@okicici` |
| `payeeName` | `Makeovers by Prachi` |
| `whatsappNumber` | `919800000000` (country code, digits only) |
| `phoneDisplay` | `+91 98000 00000` |
| `email` | |
| `studioAddress` | |
| `depositPercent` | `30` |
| `holdMinutes` | `15` |
| `travelFees` | `{ "jodhpur": 0, "jaipur": 3500, "udaipur": 3500, "other": 8500 }` |

Public read, admin write. Edited from the Flutter Settings screen.

### `notifications/{autoId}`
`title`, `body`, `category` (`BOOKING` \| `PAYMENT`), `bookingId`, `isUnread` (bool), `createdAt`.
Written by server, read/updated by admin.

## Storage
`payment_proofs/{bookingId}/{fileName}` — written by server only (admin SDK); readable by staff
(`role` owner/admin). Admin app shows it with `getDownloadURL()`.

## API (customer-web)
| route | body | success |
|---|---|---|
| `POST /api/booking/create-session` | JSON `{ serviceId, packageName?, date, readyTime, venue, city, guestCount, fullName, phone, email?, notes? }` | `{ bookingId, totalAmount, depositAmount, expiresAt (ms), upiId, payeeName }` |
| `POST /api/booking/submit-proof` | multipart `bookingId`, `phone`, `utrNumber`, `file` (image ≤ 5 MB) | `{ bookingId, status }` |
| `POST /api/booking/lookup` | JSON `{ bookingId, phone }` | `{ booking: <sanitized> }` (no proof path, no internal ids) |
| `GET /api/availability?month=YYYY-MM` | | `{ unavailable: ["YYYY-MM-DD", ...] }` |
| `GET /api/public-config` | | services + public settings for the site |

Errors: `{ error: "<human message>" }` with 400/404/409/410/500.
