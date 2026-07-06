// const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0'

// function getConfig() {
//   const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
//   const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

//   if (!accessToken || !phoneNumberId) {
//     throw new Error('WhatsApp environment variables not configured')
//   }

//   return { accessToken, phoneNumberId }
// }

// async function sendRequest(phoneNumberId: string, accessToken: string, body: object) {
//   const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(body),
//   })

//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`)
//   }

//   return response.json()
// }

// export async function sendTemplateMessage(to: string, templateName: string, languageCode: string) {
//   const { accessToken, phoneNumberId } = getConfig()
//   return sendRequest(phoneNumberId, accessToken, {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'template',
//     template: { name: templateName, language: { code: languageCode } },
//   })
// }

// export async function sendTextMessage(to: string, text: string) {
//   const { accessToken, phoneNumberId } = getConfig()
//   return sendRequest(phoneNumberId, accessToken, {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'text',
//     text: { body: text },
//   })
// }

// export async function sendButtonMessage(
//   to: string,
//   bodyText: string,
//   buttons: Array<{ id: string; title: string }>,
// ) {
//   const { accessToken, phoneNumberId } = getConfig()
//   return sendRequest(phoneNumberId, accessToken, {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'interactive',
//     interactive: {
//       type: 'button',
//       body: { text: bodyText },
//       action: {
//         buttons: buttons.slice(0, 3).map((btn) => ({
//           type: 'reply' as const,
//           reply: { id: btn.id, title: btn.title.slice(0, 20) },
//         })),
//       },
//     },
//   })
// }

// export async function sendListMessage(
//   to: string,
//   bodyText: string,
//   buttonLabel: string,
//   sections: Array<{
//     title: string
//     rows: Array<{ id: string; title: string; description?: string }>
//   }>,
// ) {
//   const { accessToken, phoneNumberId } = getConfig()
//   return sendRequest(phoneNumberId, accessToken, {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'interactive',
//     interactive: {
//       type: 'list',
//       body: { text: bodyText },
//       action: {
//         button: buttonLabel.slice(0, 20),
//         sections,
//       },
//     },
//   })
// }
