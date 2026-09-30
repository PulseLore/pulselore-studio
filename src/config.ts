const configuredBaseUrl = import.meta.env.VITE_VERIFICATION_BASE_URL?.trim()

/** One production QR destination; preview can override it only for local QA. */
export const verificationBaseUrl = configuredBaseUrl || 'https://passport.pulselore.studio'
