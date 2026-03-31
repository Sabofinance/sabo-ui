# Part 5: Regression & E2E Testing Plan

**Date**: 31 March 2026  
**Phase**: Regression Testing & End-to-End Validation  
**Objective**: Verify all 82 implemented endpoints work correctly in real-world user flows  
**Status**: 🔄 **IN PROGRESS**

---

## Executive Plan

### Testing Scope
- ✅ **Regression Testing**: Verify Part 2-4 changes didn't break existing functionality
- ✅ **E2E Validation**: Test complete user journeys from start to finish
- ✅ **Error Scenario Testing**: Verify error states show correctly
- ✅ **API Contract Testing**: Confirm all 82 endpoints match their documented specs
- ✅ **Cross-Dashboard Testing**: Admin & user dashboards work independently

### Recent Changes to Verify (Parts 2-4)
| Change | Files Modified | Risk Level |
|--------|-----------------|-----------|
| Admin invite endpoint added | admin.api.ts, AdminAcceptInvitePage.tsx | 🔴 NEW FEATURE |
| Conversions chart wired | DashboardPage.tsx, ConversionsTrendBarChart | 🟡 MEDIUM |
| Error/loading states added | LedgerPage, BeneficiariesPage, DisputesPage, ProfilePage | 🟢 LOW |
| Conversions API naming fixed | conversions.api.ts, CurrencyConverter.tsx | 🟢 LOW |

---

## 🧪 Test Suite 1: Authentication Flows (9 Endpoints)

### Login User Flow
```
Entry: LoginPage.tsx
1. User enters email/password → auth.api.login()
2. Server returns auth token + user data
3. Context updates with user state → redirect to /dashboard
4. BrowserStorage: userId, token stored
5. Exit: User authenticated, sidebar visible
```
**Status**: ⏳ PENDING
**Risk**: High (gateway flow)

### Register User Flow
```
Entry: SignupPage.tsx
1. User fills form → auth.api.registerUser()
2. Server validates duplicate email
3. Redirect to VerifyOtpPage with email
4. User enters OTP → auth.api.verifyOtp()
5. Redirect to LoginPage
6. Exit: Account created, ready to login
```
**Status**: ⏳ PENDING
**Risk**: High (account creation)

### Email Verification Flow
```
Entry: Email link with token
1. Navigate to VerifyEmailPage with token param
2. Extract token → auth.api.verifyEmail(token)
3. Server marks email verified
4. Redirect to dashboard
5. Exit: Email verified, full access unlocked
```
**Status**: ⏳ PENDING
**Risk**: High (account activation)

### Password Reset Flow
```
Entry: LoginPage "Forgot Password?"
1. Enter email → auth.api.forgotPassword(email)
2. Server sends reset link
3. Click link → ResetPasswordPage with token
4. Enter new password → auth.api.resetPassword(token, newPassword)
5. Redirect to LoginPage
6. Exit: New password set, can login
```
**Status**: ⏳ PENDING
**Risk**: High (account security)

### Token Refresh Flow
```
Entry: Auto-triggered by axios interceptor
1. API call returns 401 (token expired)
2. Interceptor calls auth.api.refreshToken()
3. Server validates refresh token, returns new access token
4. Retry original request with new token
5. Exit: Request succeeds, user stays logged in
```
**Status**: ⏳ PENDING  
**Risk**: High (session persistence)

### Logout Flow
```
Entry: User clicks logout in Header
1. auth.api.logoutUser() called
2. Server invalidates refresh token
3. Clear AuthContext state
4. Clear localStorage tokens
5. Redirect to LoginPage
6. Exit: User logged out, back to public pages
```
**Status**: ⏳ PENDING
**Risk**: Medium (session cleanup)

---

## 🧪 Test Suite 2: Marketplace Flows (16 Endpoints: Sabits/Bids/Trades)

### Create Sabit Listing Flow
```
Entry: ActiveSabitPage.tsx → "Create Sabit" modal
1. User fills form (amount, rate, min/max) → sabits.api.create()
2. Server creates listing with PENDING status
3. Listing appears in "My Sabits" tab
4. Status changes to ACTIVE after confirmation
5. Exit: Listing live on marketplace
```
**Status**: ⏳ PENDING
**Risk**: High (revenue flow)

### Browse & Place Bid Flow
```
Entry: SabitMarketPage.tsx → View open listings
1. sabits.api.list() returns all active listings
2. User clicks listing → sabits.api.getById() for details
3. User enters bid amount → bids.api.place()
4. Server validates (amount within min/max, user not seller)
5. Bid appears in "My Bids" tab
6. Seller sees bid in "Received Bids" modal
7. Exit: Bid placed, awaiting seller action
```
**Status**: ⏳ PENDING
**Risk**: High (marketplace core)

### Accept Bid & Trade Initiation Flow
```
Entry: MySabitPage.tsx → "Received Bids" modal
1. Seller sees all bids for their listing → bids.api.listReceived()
2. Seller clicks "Accept" → bids.api.accept()
3. System creates trade record → trades.api.initiate()
4. Trade appears in TradesPage
5. Both parties get notifications → notifications.api.list()
6. Buyer enters PIN for payment confirmation
7. Exit: Trade initiated, awaiting buyer transfer confirmation
```
**Status**: ⏳ PENDING
**Risk**: High (critical exchange point)

### Complete Trade Flow
```
Entry: TradeDetailPage.tsx → Trade in progress
1. Buyer confirms transfer → trades.api.buyerConfirm()
2. Seller confirms receipt → trades.api.sellerConfirm()
3. System marks trade COMPLETED
4. Both parties redirected to Rating flow
5. Either party creates rating → ratings.api.create()
6. Exit: Trade complete, ratings recorded
```
**Status**: ⏳ PENDING
**Risk**: High (settlement)

### Cancel Bid/Trade/Sabit Flow
```
Entry: ActiveSabitPage, MySabitPage, TradeDetailPage
1. User clicks "Cancel" → bids.api.withdraw() / trades.api.cancel() / sabits.api.cancel()
2. Server validates user ownership
3. Status changes to CANCELLED
4. Involved parties notified
5. Funds released (if applicable)
6. Exit: Cancellation processed
```
**Status**: ⏳ PENDING
**Risk**: Medium (transaction reversal)

---

## 💳 Test Suite 3: Payment Flows (7 Endpoints: Deposits/Withdrawals)

### Deposit via Bank Transfer (NGN)
```
Entry: DepositPage.tsx → "Deposit NGN"
1. User enters amount → deposits.api.ngnInitiate()
2. Server generates unique bank reference
3. UI shows transfer instructions with reference
4. User transfers from their bank
5. Bank webhook triggers (backend)
6. Admin approves → admin.api.approveDeposit()
7. Funds appear in wallet → wallets.api.list()
8. Exit: Funds deposited
```
**Status**: ⏳ PENDING
**Risk**: High (financial)

### Deposit via Foreign Currency (File)
```
Entry: DepositPage.tsx → "Deposit Foreign"
1. User uploads proof document → deposits.api.foreign()
2. Server stores file reference
3. Admin reviews & approves file
4. Funds credited (manual admin action)
5. Appears in deposits.api.list()
6. Exit: Currency deposited
```
**Status**: ⏳ PENDING
**Risk**: High (compliance)

### Withdraw to Beneficiary
```
Entry: WithdrawalsPage.tsx
1. Conditionally call beneficiaries.api.list()
2. If no beneficiaries, redirects to BeneficiariesPage
3. User adds bank → beneficiaries.api.create()
4. Return to WithdrawalsPage
5. User enters amount, selects beneficiary → withdrawals.api.request()
6. Server validates balance ≥ amount
7. Withdrawal appears with PENDING status
8. Admin approves → admin.api.approveWithdrawal() (assumed)
9. Exit: Funds transferred to bank
```
**Status**: ⏳ PENDING
**Risk**: High (financial)

### View Transaction History
```
Entry: HistoryPage.tsx / DashboardPage.tsx (Ledger tab)
1. ledger.api.listEntries() returns all transactions
2. Filter by date/type
3. Each entry shows timestamp, amount, type, status
4. Click entry → ledger.api.listByWalletId() for details
5. Error handling: Show spinner on load, banner on error, empty state if no history
6. Exit: History displayed
```
**Status**: ⏳ PENDING
**Risk**: Low (read-only + Part 3 error states already added)

---

## 👤 Test Suite 4: Account & Profile Flows (7 Endpoints)

### Update Username
```
Entry: SettingsPage.tsx → Account section
1. User enters new username → account.api.updateUsername()
2. Server validates uniqueness
3. Success toast appears
4. Username updates in Header
5. ProfilePage reflects change
6. Exit: Username updated
```
**Status**: ⏳ PENDING
**Risk**: Low

### Set Transaction PIN
```
Entry: SettingsPage.tsx → Security section
1. User enters PIN → account.api.setTransactionPin()
2. Server stores hashed PIN
3. Future transactions require PIN verification
4. Exit: PIN configured
```
**Status**: ⏳ PENDING
**Risk**: Medium (security critical)

### Verify PIN During Transaction (Bid/Sell)
```
Entry: BidModal.tsx / SellModal.tsx
1. User enters transaction details
2. Modal appears asking for PIN → account.api.verifyTransactionPin()
3. Server validates PIN
4. If valid → transaction proceeds
5. If invalid → error toast, retry allowed
6. Exit: Transaction authorized
```
**Status**: ⏳ PENDING
**Risk**: Medium (security validation)

### Delete Account Flow
```
Entry: SettingsPage.tsx → Danger Zone
1. User clicks "Delete Account" → account.api.initiateAccountDeletion()
2. Verification email sent
3. User confirms deletion → account.api.confirmAccountDeletion()
4. Redirect to AccountDeletedPage
5. All user data marked for deletion
6. Exit: Account scheduled for deletion
```
**Status**: ⏳ PENDING
**Risk**: High (data sensitive)

### Email Change Flow
```
Entry: SettingsPage.tsx → Email section
1. User enters new email → account.api.initiateEmailChange()
2. Verification link sent to new email
3. User clicks link → account.api.confirmEmailChange()
4. Email updated in profile
5. Exit: Email changed, verified
```
**Status**: ⏳ PENDING
**Risk**: Medium (account security)

### View Profile & Wallet Balances
```
Entry: ProfilePage.tsx
1. account data + wallet balances → walletsApi.list()
2. Display with loading spinner (Part 3)
3. Error banner if API fails (Part 3)
4. Empty state if no wallets
5. Show profile info (username, email, KYC status)
6. Rating badges if rated by others
7. Exit: Profile displayed
```
**Status**: ⏳ PENDING
**Risk**: Low (Part 3 error states already added)

---

## 🛡️ Test Suite 5: Admin Portal Flows (25 Endpoints)

### Admin Accept Invite Flow (NEW - Part 2)
```
Entry: Email link → /admin/invite?token=...
1. AdminAcceptInvitePage extracts token
2. adminApi.acceptInvite(token) called on mount
3. Server validates invite token
4. Creates admin account
5. Redirect to AdminLoginPage
6. Admin can now login
7. Exit: Admin account activated
```
**Status**: ⏳ PENDING
**Risk**: 🔴 HIGH (NEW feature - Part 2)

### Admin Login Flow
```
Entry: AdminLoginPage
1. Admin enters email/password → admin-auth.api.login()
2. Server returns admin auth token
3. Redirect to AdminVerifyOtpPage
4. Admin enters OTP → admin-auth.api.verifyOtp()
5. Redirect to AdminDashboardPage
6. AdminAuthContext updates
7. Exit: Admin authenticated
```
**Status**: ⏳ PENDING
**Risk**: High (privileged access)

### View Admin Dashboard
```
Entry: AdminDashboardPage.tsx
1. admin.api.getDashboard() returns KPIs
2. admin.api.getAnalyticsImpact() returns metrics
3. Display charts: deposits, withdrawals, trades volume
4. Show all stats
5. Exit: Dashboard displayed
```
**Status**: ⏳ PENDING
**Risk**: Low (read-only)

### Manage Admins (Create Invite)
```
Entry: AdminAdminsPage.tsx
1. admin.api.listAdmins() shows current admins
2. Admin clicks "Invite Admin" → admin.api.createInvite(email)
3. Server sends invite link to email
4. New admin receives email with acceptance link
5. New admin clicks link → AdminAcceptInvitePage flow
6. Exit: New admin invited
```
**Status**: ⏳ PENDING
**Risk**: High (access control)

### Approve KYC Verification
```
Entry: AdminKycPage.tsx
1. admin.api.listKyc() shows pending KYCs
2. Admin reviews user documents
3. Admin approves → admin.api.approveKyc()
4. Status changes to APPROVED in user's profile
5. User can now trade on full platform
6. Exit: KYC approved
```
**Status**: ⏳ PENDING
**Risk**: High (compliance critical)

### Reject KYC / Suspend User
```
Entry: AdminKycPage.tsx / AdminUsersPage.tsx
1. admin.api.rejectKyc() / admin.api.suspendUser()
2. User notified via notification
3. User access restricted
4. User profile shows "suspended" status
5. Exit: User suspended
```
**Status**: ⏳ PENDING
**Risk**: High (user-impacting)

### Approve/Reject Deposits
```
Entry: AdminDepositsPage.tsx
1. admin.api.listDeposits() shows pending deposits
2. Admin verifies payment proof
3. Admin approves → admin.api.approveDeposit()
4. OR admin rejects → admin.api.rejectDeposit()
5. User receives notification
6. If approved, funds appear in wallet
7. Exit: Deposit processed
```
**Status**: ⏳ PENDING
**Risk**: High (financial)

### View & Resolve Disputes
```
Entry: AdminDisputesPage.tsx
1. admin.api.listDisputes() shows all disputes
2. Admin clicks dispute → disputes.api.getById()
3. Admin reviews details & messages
4. Admin resolves → disputes.api.resolve()
5. Both parties notified
6. Exit: Dispute resolved
```
**Status**: ⏳ PENDING
**Risk**: High (conflict resolution)

---

## ✅ Test Suite 6: Error & Edge Case Handling

### Network Error Handling
```
Scenario: API request times out
1. Page shows loading spinner
2. After timeout → error banner displays: "Network error, retrying..."
3. Automatic retry in 3 seconds
4. If retry fails → "Please refresh page" message
5. User can manually retry
6. Exit: Error handled gracefully
```
**Status**: ⏳ PENDING
**Risk**: Low (Part 3 added error UI)

### Empty State Handling
```
Scenario: No data returned from API
1. Ledger page with no transactions
2. Display: "No transactions yet"
3. Button to "Start trading"
4. Similar for: Beneficiaries, Disputes, Notifications
5. Exit: Empty state clear/helpful
```
**Status**: ⏳ PENDING
**Risk**: Low (Part 3 added empty states)

### Unauthorized Access (401)
```
Scenario: Token expired or invalid
1. Any API returns 401
2. Interceptor catches, calls refreshToken()
3. If refresh succeeds → retry request with new token
4. If refresh fails → redirect to LoginPage
5. Message: "Session expired, please login again"
6. Exit: User re-authenticated
```
**Status**: ⏳ PENDING
**Risk**: Medium (auth critical)

### Forbidden Access (403)
```
Scenario: User tries to access admin page without role
1. Attempt to navigate to /admin/*
2. AdminProtectedRoute checks role
3. If not admin → redirect to /dashboard
4. Toast message: "You don't have access to this page"
5. Exit: Access denied, redirected
```
**Status**: ⏳ PENDING
**Risk**: Medium (access control)

### Form Validation Errors
```
Scenario: User submits invalid form
1. Frontend validation catches errors
2. Red border on invalid fields
3. Tooltip shows error message
4. Submit button disabled
5. User corrects input → submit enabled
6. Exit: Validation working
```
**Status**: ⏳ PENDING
**Risk**: Low (UI feature)

### API Response Validation
```
Scenario: API returns unexpected response format
1. normalizeError() catches and logs error
2. User sees generic error message
3. Console logs full response for debugging
4. Exit: Invalid response handled safely
```
**Status**: ⏳ PENDING
**Risk**: Low (error envelope in place)

---

## 🚀 Test Suite 7: Cross-Feature Integration

### KYC Requirement Flow
```
1. New user registers → kyc.api.getStatus() returns NOT_SUBMITTED
2. User tries to trade → Modal: "Complete KYC first"
3. Redirect to KycPage → kyc.api.upload(documents)
4. Admin approves → admin.api.approveKyc()
5. User can now trade
6. Exit: KYC blocks unverified trades
```
**Status**: ⏳ PENDING
**Risk**: High (compliance gate)

### Conversion Rate Live Display
```
Entry: DashboardPage.tsx → Conversions section (Part 2 wire-up)
1. rates.api.list() gets fresh rates
2. ConversionsTrendBarChart displays 7-day data
3. convertedData processed correctly (Part 2 type fix)
4. Chart renders without errors
5. Exit: Chart displays conversion trends
```
**Status**: ⏳ PENDING
**Risk**: 🟡 MEDIUM (Part 2 new feature)

### Notification System Flow
```
1. Trade completed → Backend trigger
2. Notification appears in NotificationDropdown
3. notifications.api.list() retrieves unread count
4. User clicks notification → mark read via notifications.api.markRead()
5. Notification icon count decreases
6. User can mark all read → notifications.api.markAllRead()
7. Exit: Notifications working end-to-end
```
**Status**: ⏳ PENDING
**Risk**: Low (read-only mostly)

---

## 📋 Validation Checklist

### Pre-Testing (Environment)
- [ ] npm run build succeeds (0 errors) ✅ DONE
- [ ] All 23 API client files intact
- [ ] TypeScript compilation clean
- [ ] AuthContext/AdminAuthContext initialized
- [ ] Axios interceptors registered
- [ ] Protected routes functional

### Regression Suite (Parts 2-4 Changes)
- [ ] **Part 2 - Admin Invite**: Can accept invite, endpoint exists & called
- [ ] **Part 2 - Conversions Chart**: Chart wires to API, renders data
- [ ] **Part 3 - Error States**: 4 pages (Ledger, Beneficiaries, Disputes, Profile) show errors
- [ ] **Part 3 - Loading States**: All pages show spinner during fetch
- [ ] **Part 4 - Conversions API**: `.execute()` method exists, CurrencyConverter uses it

### Functional Testing (All 82 Endpoints)
- [ ] All 9 auth endpoints work (login, logout, refresh, etc.)
- [ ] All 7 account endpoints work (username, PIN, delete, email)
- [ ] All 4 wallet/ledger endpoints work
- [ ] All 7 deposit/withdrawal endpoints work
- [ ] All 6 beneficiary/KYC endpoints work
- [ ] All 10 rate/conversion/sabit endpoints work
- [ ] All 16 bid/trade endpoints work
- [ ] All 5 dispute/rating endpoints work
- [ ] All 3 notification endpoints work
- [ ] All 25 admin endpoints work

### E2E User Journeys
- [ ] Auth: Register → Email Verify → Login → Logout
- [ ] Marketplace: Browse Sabits → Place Bid → Accept → Trade → Rate
- [ ] Payment: Deposit NGN → Approve (Admin) → Withdraw
- [ ] Profile: Update Account → Set PIN → Change Email
- [ ] Admin: Accept Invite → Login → Approve KYC → Manage Users

### Error Scenarios
- [ ] Network timeout → Retry logic works
- [ ] 401 Unauthorized → Token refresh works
- [ ] 403 Forbidden → Access denied, redirect works
- [ ] Empty data → Empty states display
- [ ] Invalid form → Validation working
- [ ] API error → Error banner shows

---

## 🧬 Test Execution Order

### Phase 1: Critical Path (Must Pass)
1. Authentication flows (gateway to everything)
2. Admin invite acceptance (Part 2 new)
3. API connectivity (verify interceptors)

### Phase 2: Core Features
4. Marketplace flows (Sabits/Bids/Trades)
5. Payment flows (Deposits/Withdrawals)
6. Admin portal

### Phase 3: Polish
7. Error/empty states
8. Cross-feature integrations
9. Edge cases

---

## 📊 Success Criteria

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| Build | 0 TypeScript errors | ✅ PASS (Part 4) |
| Coverage | 82/83 endpoints working | ⏳ TESTING |
| Regression | No Part 2-4 changes broke existing | ⏳ TESTING |
| E2E | All user journeys complete | ⏳ TESTING |
| Error Handling | All error states display correctly | ⏳ TESTING |
| Performance | Page load < 2s initial, < 500ms subsequent | ⏳ TESTING |

---

## 🎯 Current Status: Phase 1 Starting

**Next Steps**:
1. ✅ Test authentication flows
2. ✅ Verify admin invite (Part 2)
3. ✅ Test API connectivity
4. ✅ Proceed to Phase 2

**Blockers**: None currently identified

---

**Test Plan Created**: 31 March 2026  
**Execution Date**: Starting now  
**Expected Duration**: 2-3 hours
