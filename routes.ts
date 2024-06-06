/**
 * An array of routes that are accessible to the public
 * These routes do not require middleware
 * @type {string[]}
 */

export const publicRoutes = [
  "/",
  "/auth/new-verification"
]

/**
 * An array of routes that are accessible to the public
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */

export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password"
]

/**
 * The prefix for all API authentication routes
 * @type {string}
 */

export const apiAuthPrefix = "/api/auth"

/**
 * The default redirect path after a user logs in
 * @type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = "/settings"