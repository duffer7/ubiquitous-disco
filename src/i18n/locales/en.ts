/**
 * English message catalogue — the single source of truth for every
 * user-facing string in the app.
 *
 * Structure: nested groups mirroring the UI (common, nav, auth, dashboard,
 * admin, validation, api, errors, metadata). Values are plain strings; a
 * handful of entries are functions that take interpolation params, e.g.
 * `welcomeBack: (name) => `Welcome back, ${name}``.
 *
 * To add a new language, copy this file to `src/i18n/locales/<locale>.ts`,
 * translate the values, and register it in `src/i18n/config.ts`. TypeScript
 * enforces that any new locale provides the exact same keys (see Messages
 * type in config.ts), so a missing translation is a compile-time error.
 */

const en = {
  common: {
    appName: "SaaS Dashboard",
    loading: "Loading",
    saveChanges: "Save changes",
    cancel: "Cancel",
    apply: "Apply",
    reset: "Reset",
    retry: "Try again",
    view: "View",
    actions: "Actions",
    none: "—",
    or: "or",
  },

  nav: {
    dashboard: "Dashboard",
    activity: "Activity",
    profile: "Profile",
    admin: "Admin",
    signOut: "Sign out",
  },

  roles: {
    client: "Client",
    admin: "Admin",
  },

  landing: {
    signIn: "Sign in",
    getStarted: "Get started",
    createAccount: "Create an account",
    heading: "Your product dashboard, ready to ship.",
    subheading:
      "Authentication, protected routes and a PostgreSQL-backed data layer — built on Next.js, TypeScript and Tailwind CSS.",
  },

  auth: {
    welcomeBackTitle: "Welcome back",
    welcomeBackSubtitle: "Sign in to access your dashboard.",
    createAccountTitle: "Create your account",
    createAccountSubtitle: "Get started in a few seconds.",
    forgotTitle: "Reset your password",
    forgotSubtitle: "Enter your email and we'll send you a reset link.",
    resetTitle: "Set a new password",
    resetSubtitle: "Choose a strong password you haven't used before.",
    resetLinkRequiredTitle: "Reset link required",
    resetLinkRequiredSubtitle: "This page needs a valid reset link.",
    resetLinkRequiredBodyStart: "Open the reset link from your email, or",
    resetLinkRequiredBodyEnd: ".",
    requestNewLink: "request a new one",
    backToSignIn: "Back to sign in",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createOne: "Create one",
    signInLink: "Sign in",
    pleaseSignIn: "Please sign in to continue.",
    forgotPassword: "Forgot password?",

    // Form field labels / hints
    fullNameLabel: "Full name",
    fullNamePlaceholder: "Ada Lovelace",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm new password",
    passwordHint: "At least 8 characters, including a letter and a number.",

    // Buttons
    signInButton: "Sign in",
    createAccountButton: "Create account",
    sendResetLink: "Send reset link",
    updatePassword: "Update password",

    // Feedback
    accountCreated: "Account created.",
    canNowSignInPrefix: "You can now",
    canNowSignInSuffix: ".",
    authCallbackFailed: "We couldn't verify that link. Please try signing in again.",
  },

  dashboard: {
    welcomeBack: (name: string) => `Welcome back, ${name}`,
    welcomeFallback: "there",
    snapshotSubtitle: "Here's a snapshot of your account.",
    forbidden: "You don't have permission to access that page.",

    accountStatus: "Account status",
    active: "Active",
    plan: "Plan",
    free: "Free",
    upgradeSoon: "Upgrade coming soon",
    memberSince: "Member since",

    recentActivity: "Recent activity",
    recentActivitySubtitle: "Your latest account events.",
    viewAll: "View all",
    activityError: "We couldn't load your activity. Please refresh.",
    noActivityTitle: "No activity yet",
    noActivityDescription:
      "Your account activity will appear here as you use the product.",

    // Activity page
    activityTitle: "Activity",
    activityPageSubtitle: "A chronological history of your account events.",
    eventsOne: "event",
    eventsMany: "events",
    activityLoadErrorTitle: "We couldn't load your activity",
    activityLoadErrorDescription:
      "Something went wrong while loading your history. Please refresh the page.",
    retry: "Retry",
    noMatchingActivityTitle: "No matching activity",
    noMatchingActivityDescription:
      "Try adjusting or clearing the filters to see more results.",
    clearFilters: "Clear filters",

    // Activity filters
    filterAction: "Action",
    filterActionPlaceholder: "e.g. signed_in",
    filterFrom: "From",
    filterTo: "To",

    // Profile page
    profileTitle: "Profile",
    profileSubtitle: "Manage your personal information and account details.",
    personalInformation: "Personal information",
    personalInformationSubtitle: "Update your profile details below.",
    accountSection: "Account",
    accountSectionSubtitle: "Managed by the system.",
    accountEmail: "Email",
    accountRole: "Role",
    accountMemberSince: "Member since",
    accountLastUpdated: "Last updated",

    // Profile form fields
    companyLabel: "Company",
    phoneLabel: "Phone",
    avatarUrlLabel: "Avatar URL",
    avatarUrlHint: "Optional. A link to your profile picture.",
  },

  admin: {
    overviewTitle: "Admin overview",
    overviewSubtitle: "Platform statistics and the latest activity across all users.",
    manageUsers: "Manage users",

    statTotalUsers: "Total users",
    statAdmins: "Admins",
    statClients: "Clients",
    statNew7: "New (7 days)",
    statNew30Hint: (n: number) => `${n} in the last 30 days`,
    statActive7: "Active (7 days)",
    statActive7Hint: "Users with activity",
    statAdminShare: "Admin share",

    newestUsers: "Newest users",
    viewAll: "View all",
    noUsersYet: "No users yet.",
    recentPlatformActivity: "Recent platform activity",
    noActivityYet: "No activity recorded yet.",

    // Users list
    usersTitle: "Users",
    usersSubtitle: "Search, filter and manage all registered accounts.",
    searchLabel: "Search",
    searchPlaceholder: "Name, email or company…",
    roleLabel: "Role",
    allRoles: "All roles",
    roleClients: "Clients",
    roleAdmins: "Admins",
    userCountOne: "user",
    userCountMany: "users",
    usersLoadErrorTitle: "We couldn't load users",
    usersLoadErrorDescription:
      "Something went wrong querying the directory. Please refresh the page.",
    noUsersMatchTitle: "No users match your filters",
    noUsersMatchDescription: "Try a different search term or clear the filters.",
    noUsersDirectoryTitle: "No users yet",
    noUsersDirectoryDescription: "Registered accounts will appear here.",

    // Table columns
    colUser: "User",
    colRole: "Role",
    colActivity: "Activity",
    colJoined: "Joined",
    colActions: "Actions",

    // User detail
    backToUsers: "← Back to users",
    editUser: "Edit user",
    editUserSubtitle: "Update account details and role.",
    totalActivity: "Total activity",
    totalActivityHint: "Recorded events",
    joined: "Joined",
    lastUpdated: "Last updated",
    recentActivity: "Recent activity",
    noActivityTitle: "No activity",
    noActivityDescription: "This user has no recorded events.",
    dangerZone: "Danger zone",
    deleteUser: "Delete user",
    deleteConfirmPrefix: "Permanently delete",
    deleteConfirmSuffix:
      "and all associated activity? This cannot be undone.",
    yesDelete: "Yes, delete",

    // User edit form fields
    roleClientOption: "Client",
    roleAdminOption: "Admin",

    // Messages (server action results)
    userUpdated: "User updated successfully.",
    roleUpdated: (role: string) => `Role updated to ${role}.`,
    userDeleted: (email: string) => `Deleted ${email}.`,
    invalidUserId: "Invalid user id.",
    userNoLongerExists: "That user no longer exists.",
    cannotDemoteLastAdmin: "You can't demote the last administrator.",
    cannotDeleteLastAdmin: "You can't delete the last administrator.",
    cannotDeleteSelf: "You can't delete your own account here.",
    emailInUse: "Another account already uses this email.",
    updateUserFailed: "We couldn't update this user. Please try again.",
  },

  errors: {
    genericTitle: "Something went wrong",
    dashboardMessage: "We couldn't load this page. Please try again.",
    adminMessage: "We couldn't load the admin panel. Please try again.",
    notFoundCode: "404",
    notFoundTitle: "Page not found",
    notFoundDescription: "The page you're looking for doesn't exist or has moved.",
    goHome: "Go home",
    skipToContent: "Skip to content",
  },

  pagination: {
    ariaLabel: "Pagination",
    previous: "Previous",
    next: "Next",
    pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
  },

  footer: {
    rights: (year: number) => `© ${year} SaaS Dashboard`,
  },

  validation: {
    emailRequired: "Email is required",
    emailInvalid: "Enter a valid email address",
    passwordRequired: "Password is required",
    passwordMin: "Password must be at least 8 characters",
    passwordMax: "Password must be at most 72 characters",
    passwordLetter: "Password must contain at least one letter",
    passwordNumber: "Password must contain at least one number",
    passwordsDoNotMatch: "Passwords do not match",
    fullNameMin: "Please enter your full name",
    fullNameMax: "Name is too long",
    companyMax: "Company name is too long",
    phoneMax: "Phone number is too long",
    phoneInvalid: "Enter a valid phone number",
    urlMax: "URL is too long",
    urlInvalid: "Enter a valid http(s) URL",
    roleInvalid: "Select a valid role",
    userIdInvalid: "Invalid user id",
  },

  api: {
    invalidJson: "Invalid JSON body.",
    invalidCredentials: "Invalid email or password.",
    validationFailed: "Validation failed.",
    invalidEmail: "Please enter a valid email.",
    authRequired: "Authentication required.",
    forbidden: "You don't have permission to do that.",
    tooManyRequests: "Too many requests. Please slow down and try again shortly.",
    accountExists: "An account with this email already exists.",
    resetSent: "If an account exists for that email, a reset link has been sent.",
    resetInvalid: "This reset link is invalid or has expired. Please request a new one.",
    resetMissingToken: "Missing reset token.",
    passwordUpdated: "Password updated. You can now sign in.",
  },

  // Server action messages (auth)
  action: {
    accountExists: "An account with this email already exists.",
    invalidCredentials: "Invalid email or password.",
    profileUpdateFailed: "We couldn't update your profile. Please try again.",
    profileUpdated: "Your profile has been updated.",
    missingResetToken: "Missing reset token.",
    resetInvalid: "This reset link is invalid or has expired. Please request a new one.",
  },

  metadata: {
    signIn: "Sign in",
    register: "Create account",
    forgotPassword: "Forgot password",
    resetPassword: "Set a new password",
    dashboard: "Dashboard",
    activity: "Activity",
    profile: "Profile",
    admin: "Admin",
    adminUsers: "Users · Admin",
    adminUser: "User · Admin",
    titleTemplate: "%s · SaaS Dashboard",
    description: "Client and admin dashboard for an early-stage SaaS product.",
  },

  // Human labels for activity actions ("auth.signed_in" → key below)
  activityActions: {
    signed_in: "Signed in",
    signed_out: "Signed out",
    password_reset: "Password reset",
    created: "Created",
    updated: "Updated",
    user_updated: "User updated",
    user_role_changed: "User role changed",
    user_deleted: "User deleted",
  } as Record<string, string>,
} as const;

export default en;
