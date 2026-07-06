const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0'

/** Per-tenant Cloud API credentials (from a whatsapp-accounts doc, or env in test mode) */
export interface WhatsAppCredentials {
  accessToken: string
  phoneNumberId: string
}

/**
 * Sends a plain text message through the WhatsApp Cloud API.
 * Returns the WhatsApp message ID (wamid) of the sent message when available.
 */
export const sendTextMessage = async (
  credentials: WhatsAppCredentials,
  to: string,
  text: string,
): Promise<string | null> => {
  const { accessToken, phoneNumberId } = credentials

  const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WhatsApp API error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as { messages?: Array<{ id?: string }> }
  return data.messages?.[0]?.id ?? null
}
