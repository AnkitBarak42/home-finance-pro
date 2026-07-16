# Home Finance Pro — Realtime Firebase Edition

A family finance tracker built with **Next.js 14 + Firebase (Auth + Firestore)**.
Every family member logs in with their own account; income, expenses, accounts,
and categories sync **instantly** across everyone's phone/PC using Firestore's
realtime listeners (`onSnapshot`) — no refresh needed.

## Features
- Email/password login, one workspace per family
- "Create Family" → get a shareable invite code · "Join Family" → enter the code
- Add income/expense, pick category + account + payment mode, optional note
- **Voice entry** — tap the mic in Add Transaction and speak an amount/category (browser speech recognition)
- Realtime dashboard: Net Worth, Cash in Hand, Bank Balance, CC Outstanding, EMI Due, Bills Due, monthly income/expense/savings ring — **every card is tappable** and jumps to the right screen (e.g. tapping "CC Outstanding" opens Money → Credit Cards)
- A **"Due This Cycle"** list on the dashboard merges credit card bills, upcoming EMIs, and unpaid recurring bills into one sorted, tappable list — overdue items are flagged in red
- **Credit cards auto-track their bill**: pick payment mode "Card" and link the specific card when adding an expense, and that card's balance goes up automatically instead of manually editing "Used Limit" — pay it off anytime from Money → Credit Cards
- Transactions grouped by day with month navigation
- **Insights** — pie chart grouped by Category / Member / Account / Payment Mode, plus 6-month expense trend and an automatic "category up vs last month" alert
- **Money tab** — Accounts, Credit Cards (limit/used/available, statement day, **auto due date = statement + 20 days if left blank**, min due, cashback, one-tap payment), Loans/EMI (principal, remaining balance, interest, next due date, one-tap "Mark EMI Paid")
- **Vehicles** — per-vehicle logs for Fuel, Service, Insurance, Pollution, Challan, Tyres, each posts an expense automatically
- **Recurring Bills** — Electricity/Water/LPG/Broadband/Mobile/FASTag/Insurance with a due day and one-tap "mark paid"
- **Budgets** — set a monthly ₹ limit per category with a progress bar and over-budget warning
- **Reports** — Daily / Weekly / Monthly / Yearly income vs expense tables
- **Export** — download every transaction as a CSV file
- **Security PIN** — optional 4-digit PIN lock for this device (Settings → More → Security)
- Manage custom categories **with subcategories** (e.g. Grocery ▸ Vegetables, Vehicle ▸ Fuel) — a **"Food & Dining"** category ships pre-seeded with Fast Food / Cold Drink / Restaurant / Tea-Coffee subcategories as a working example — family member list with invite code, search across all transactions
- Mobile + desktop responsive (max-width app shell, centered on larger screens)

### Not included (by design)
A few things from the original wishlist need native-app capabilities or a paid
backend service that don't fit a self-hosted web app, so they were left out
rather than faked:
- **Face ID / Fingerprint** — browsers can't grant that to a web app; the PIN
  lock above is the web-friendly equivalent.
- **Bill photo scanning (OCR)** — needs a receipt-OCR API; would be a
  straightforward add-on later (e.g. Google Cloud Vision).
- **Push/background reminders** — works only while the app is open in a tab;
  true background notifications need Firebase Cloud Messaging + a service
  worker, which is a good next step if you want it.

---

## 1. Create your Firebase project (5 minutes)

1. Go to **https://console.firebase.google.com** → **Add project** → name it
   (e.g. `home-finance-pro`) → finish the wizard (Google Analytics is optional).
2. In the left sidebar, click **Build → Authentication → Get started**.
   Under the **Sign-in method** tab, enable **Email/Password**.
3. Click **Build → Firestore Database → Create database**.
   Start in **production mode**, pick a region close to you.
4. Once created, open the **Rules** tab of Firestore and paste the contents of
   `firestore.rules` from this project, then click **Publish**.
5. Click the ⚙️ gear icon (top left) → **Project settings**. Under
   **Your apps**, click the **</>** (web) icon, register an app (any nickname),
   and copy the `firebaseConfig` values shown — you'll need them next.

## 2. Configure the app

Copy `.env.local.example` to `.env.local` and fill in the values from step 1.5:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000** → you'll land on the login screen →
choose **New Family**, fill in your name/email/password → you're in.
Open the app on a second phone/browser, choose **Join Family**, and paste
the invite code shown under **More → Family Members**. Add a transaction on
one device and watch it appear instantly on the other.

## 4. Deploy (optional)

The easiest path is **Vercel**:

```bash
npm i -g vercel
vercel
```

Add the same `NEXT_PUBLIC_FIREBASE_*` variables in the Vercel project's
**Settings → Environment Variables**, then redeploy.

---

## How the data is structured (Firestore)

```
users/{uid}                        → { name, email, familyId, role }
families/{familyId}                → { name, createdAt, createdBy }
families/{familyId}/members/{uid}  → { name, email, role, joinedAt }
families/{familyId}/accounts/{id}  → { name, type, balance }
families/{familyId}/categories/{id}→ { name, icon, color, type, budget }
families/{familyId}/creditCards/{id} → { name, bank, creditLimit, usedLimit, statementDate, dueDate, minDue, cashback }
families/{familyId}/loans/{id}     → { name, type, principal, emiAmount, interestRate, remainingBalance, nextDueDate }
families/{familyId}/vehicles/{id}  → { name, type }
families/{familyId}/vehicleLogs/{id} → { vehicleId, type, amount, date, note, accountId, txnId }
families/{familyId}/bills/{id}     → { name, type, amount, dueDay, lastPaidMonth }
families/{familyId}/transactions/{id} → { type, amount, categoryId, accountId, paymentMode,
                                           note, date, createdBy, createdByName }
```

Paying a credit card, marking an EMI paid, logging a vehicle expense, and
marking a bill paid all create a normal transaction (so it shows up in
Insights/Reports/Export) **and** update the linked card/loan/bill record in
the same action.

Adding/deleting a transaction updates the linked account's `balance` inside a
Firestore **transaction** (`runTransaction`), so balances never drift even
with two people editing at once.

## Security

`firestore.rules` restricts every family subcollection (transactions,
accounts, categories, members) to signed-in users who belong to that
`familyId`. The family root doc is readable by any signed-in user only so the
"Join Family" screen can validate an invite code before creating an account.

## Notes & next steps you may want to add later
- Google/Apple sign-in (Firebase Auth supports both with a few lines)
- Push notifications on new transactions (Firebase Cloud Messaging)
- Export to Excel/CSV
- Budgets per category with progress bars
- Removing a member's access (currently membership records are display-only —
  revoking Firestore access for a specific member takes a small rule change
  keyed off a `members` allow-list instead of a single shared `familyId`)
