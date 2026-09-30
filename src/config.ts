const configuredBaseUrl = import.meta.env.VITE_VERIFICATION_BASE_URL?.trim()

/**
 * Preview defaults to the current managed Preview origin. Before production,
 * set VITE_VERIFICATION_BASE_URL to https://passport.pulselore.studio.
 */
export const verificationBaseUrl = configuredBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
