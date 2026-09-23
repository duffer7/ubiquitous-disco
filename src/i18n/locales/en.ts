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
    appName: "Orbit",
    tagline: "Control your product universe.",
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
    dashboard: "Command Center",
    activity: "Activity Signals",
    profile: "Profile",
    admin: "Operations Hub",
    signOut: "Sign out",
  },

  roles: {
    client: "Member",
    admin: "Operator",
  },

  landing: {
    signIn: "Sign in",
    getStarted: "Get started",
    createAccount: "Create an account",
    eyebrow: "Customer Operations Platform",
    heading: "Customer operations in one powerful dashboard.",
    subheading:
      "Orbit helps SaaS teams manage users, monitor activity, and keep customer data organized through a clean, production-ready command center.",
    ctaGetStarted: "Get started",
    ctaExplore: "Explore the Command Center",
    featureUsersTitle: "User management",
    featureUsersBody:
      "Organize customer accounts, update profiles, and maintain records from one centralized workspace.",
    featureActivityTitle: "Activity monitoring",
    featureActivityBody:
      "Follow sign-ins, profile updates and account actions to understand engagement in real time.",
    featureSecureTitle: "Secure authentication",
    featureSecureBody:
      "Built-in registration, password recovery and protected routes designed for modern applications.",
    featureAdminTitle: "Administrative control",
    featureAdminBody:
      "Search users, manage accounts and access operational insights from an intuitive Operations Hub.",
    trustedBy: "Built for modern SaaS teams",
    seoParagraph1:
      "Orbit is a modern customer operations platform built for SaaS products that need a simple and scalable way to manage users and business processes.",
    seoParagraph2:
      "From a single workspace, teams can monitor customer activity, manage accounts, review operational metrics, and maintain full visibility across their user base. Orbit combines authentication, user administration, and activity monitoring into a clean and intuitive dashboard designed for growing businesses.",
    seoParagraph3:
      "Whether you are launching a new SaaS product or managing an expanding customer base, Orbit provides the tools needed to organize users, improve operational efficiency, and maintain a consistent customer experience.",
  },

  auth: {
    welcomeBackTitle: "Welcome back",
    welcomeBackSubtitle: "Access your customer operations center.",
    createAccountTitle: "Create your Orbit workspace",
    createAccountSubtitle: "Start managing customer operations in minutes.",
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
    accountCreated: "Workspace created.",
    canNowSignInPrefix: "You can now",
    canNowSignInSuffix: ".",
    authCallbackFailed: "We couldn't verify that link. Please try signing in again.",
  },

  dashboard: {
    welcomeBack: (name: string) => `Welcome back, ${name}`,
    welcomeFallback: "there",
    snapshotSubtitle: "Monitor users, activity and growth from a single place.",

    // Product Pulse — the headline metric of the Command Center.
    pulseTitle: "Product Pulse",
    pulseSubtitle: "A live read on the health of your customer universe.",
    pulseScore: "Pulse Score",
    pulseActive: "Active",
    pulseSteady: "Steady",
    pulseAtRisk: "At risk",
    pulseHint: (score: number) => `${score}/100 · recalculated live`,

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
    noActivityTitle: "No activity yet.",
    noActivityDescription:
      "Once customers start interacting with your platform, events and insights will appear here.",

    // Activity page
    activityTitle: "Activity Signals",
    activityPageSubtitle: "Follow sign-ins, updates and engagement across your universe.",
    eventsOne: "signal",
    eventsMany: "signals",
    activityLoadErrorTitle: "We couldn't load your activity",
    activityLoadErrorDescription:
      "Something went wrong while loading your history. Please refresh the page.",
    retry: "Retry",

    noMatchingActivityTitle: "Nothing found in this sector",
    noMatchingActivityDescription:
      "Try adjusting or clearing the filters to see more results.",
    clearFilters: "Clear filters",

    // Activity filters
    filterAction: "Action",
    filterActionPlaceholder: "e.g. signed_in",
    filterFrom: "From",
    filterTo: "To",

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
    overviewTitle: "Operations Hub",
    overviewSubtitle: "Manage users and keep your product healthy.",
    manageUsers: "Manage users",

    statTotalUsers: "Members",
    statAdmins: "Operators",
    statClients: "Members",
    statNew7: "New (7 days)",
    statNew30Hint: (n: number) => `${n} in the last 30 days`,
    statActive7: "Active (7 days)",
    statActive7Hint: "Members with activity",
    statAdminShare: "Operator share",
    statAvgPulse: "Avg Pulse Score",
    statAvgPulseHint: "Product health",

    newestUsers: "Newest members",
    viewAll: "View all",
    noUsersYet: "No members yet.",
    recentPlatformActivity: "Recent platform activity",
    noActivityYet: "No activity recorded yet.",

    // Users list
    usersTitle: "Customer Directory",
    usersSubtitle: "Search, filter and manage every account in your universe.",
    searchLabel: "Search",
    searchPlaceholder: "Name, email or company…",
    roleLabel: "Role",
    allRoles: "All roles",
    roleClients: "Members",
    roleAdmins: "Operators",
    userCountOne: "member",
    userCountMany: "members",
    usersLoadErrorTitle: "We couldn't load users",
    usersLoadErrorDescription:
      "Something went wrong querying the directory. Please refresh the page.",
    noUsersMatchTitle: "Nothing found in this sector",
    noUsersMatchDescription: "Try a different search term or clear the filters.",
    noUsersDirectoryTitle: "Your universe is empty",
    noUsersDirectoryDescription:
      "Add your first customer and begin building your product ecosystem.",

    // Table columns
    colUser: "Member",
    colRole: "Role",
    colActivity: "Activity",
    colPulse: "Pulse",
    colJoined: "Joined",
    colActions: "Actions",

    // User detail
    backToUsers: "← Back to directory",
    editUser: "Edit member",
    editUserSubtitle: "Update account details and role.",
    totalActivity: "Total activity",
    totalActivityHint: "Recorded events",
    joined: "Joined",
    lastUpdated: "Last updated",
    recentActivity: "Recent activity",
    noActivityTitle: "No activity",
    noActivityDescription: "This member has no recorded events.",
    dangerZone: "Danger zone",
    deleteUser: "Delete member",
    deleteConfirmPrefix: "Permanently delete",
    deleteConfirmSuffix:
      "and all associated activity? This cannot be undone.",
    yesDelete: "Yes, delete",

    // User edit form fields
    roleClientOption: "Member",
    roleAdminOption: "Operator",

    // Messages (server action results)
    userUpdated: "Member updated successfully.",
    roleUpdated: (role: string) => `Role updated to ${role}.`,
    userDeleted: (email: string) => `Deleted ${email}.`,
    invalidUserId: "Invalid member id.",
    userNoLongerExists: "That member no longer exists.",
    cannotDemoteLastAdmin: "You can't demote the last operator.",
    cannotDeleteLastAdmin: "You can't delete the last operator.",
    cannotDeleteSelf: "You can't delete your own account here.",
    emailInUse: "Another account already uses this email.",
    updateUserFailed: "We couldn't update this member. Please try again.",
  },

  errors: {
    genericTitle: "Something went wrong",
    dashboardMessage: "We couldn't load this page. Please try again.",
    adminMessage: "We couldn't load the Operations Hub. Please try again.",
    notFoundCode: "404",
    notFoundTitle: "This sector is uncharted",
    notFoundDescription:
      "The page you're looking for could not be found. Return to the Orbit Command Center and continue exploring your customer universe.",
    goHome: "Return to Command Center",
    skipToContent: "Skip to content",
  },

  pagination: {
    ariaLabel: "Pagination",
    previous: "Previous",
    next: "Next",
    pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
  },

  footer: {
    rights: (year: number) => `© ${year} Orbit`,
    blurb:
      "Orbit is a customer operations platform designed for SaaS businesses. The platform combines user management, authentication, activity monitoring, and operational insights to help teams manage customer relationships more effectively and scale their products with confidence.",
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
    signIn: "Login",
    register: "Create Account",
    forgotPassword: "Reset Password",
    resetPassword: "Reset Password",
    dashboard: "Command Center",
    activity: "Activity Signals",
    profile: "Account Settings",
    admin: "Operations Hub",
    adminUsers: "Customer Directory",
    adminUser: "Customer Profile",
    titleTemplate: "%s | Orbit",
    description:
      "Orbit is a modern customer operations platform for SaaS teams. Manage users, monitor activity, control access, and gain operational insights from a single dashboard.",
    // Per-page meta descriptions for SEO.
    descriptionSignIn:
      "Securely access your Orbit workspace and manage customers, accounts, and business operations from anywhere.",
    descriptionRegister:
      "Create your Orbit account and gain access to a modern customer operations platform designed for SaaS businesses.",
    descriptionForgotPassword:
      "Recover access to your Orbit account securely and return to managing customer operations without interruption.",
    descriptionResetPassword:
      "Set a new password and return to your Orbit customer operations workspace.",
    descriptionDashboard:
      "Track customer activity, monitor business operations, and manage user engagement through the Orbit Command Center.",
    descriptionActivity:
      "Review recent user events, account actions, and platform activity within Orbit's activity monitoring center.",
    descriptionProfile:
      "Manage personal account information, update preferences, and secure your Orbit workspace.",
    descriptionAdmin:
      "Manage platform users, review operational insights, and oversee customer activity through Orbit's Operations Hub.",
    descriptionAdminUsers:
      "Browse, search, and manage customer accounts from a centralized user administration interface.",
    descriptionAdminUser:
      "View detailed customer information, account activity, and engagement insights within the Orbit platform.",
  },

  // Human labels for activity actions ("auth.signed_in" → key below)
  activityActions: {
    signed_in: "Signed in",
    signed_out: "Signed out",
    password_reset: "Password reset",
    created: "Created",
    updated: "Updated",
    user_updated: "Member updated",
    user_role_changed: "Role changed",
    user_deleted: "Member deleted",
  } as Record<string, string>,
} as const;

export default en;
