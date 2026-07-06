export interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  verifyToken: string
  appSecret: string
}

/**
 * Reads and validates the WhatsApp Cloud API environment variables.
 * Throws if any is missing so misconfiguration fails loudly at the call site.
 */
export const getWhatsAppConfig = (): WhatsAppConfig => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  const appSecret = process.env.WHATSAPP_APP_SECRET

  if (!accessToken || !phoneNumberId || !verifyToken || !appSecret) {
    throw new Error(
      'WhatsApp environment variables not configured (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET)',
    )
  }

  return { accessToken, phoneNumberId, verifyToken, appSecret }
}
