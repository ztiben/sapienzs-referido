// export type Modality = 'inStore' | 'delivery'

// export const MODALITY_SHORT: Record<Modality, string> = {
//   inStore: 'is',
//   delivery: 'dl',
// }

// export const SHORT_TO_MODALITY: Record<string, Modality> = {
//   is: 'inStore',
//   dl: 'delivery',
// }

// export const MODALITY_LABEL: Record<Modality, string> = {
//   inStore: 'En tienda',
//   delivery: 'A domicilio',
// }

// export interface WhatsAppMessage {
//   from: string
//   type: 'text' | 'interactive' | 'button'
//   text?: { body: string }
//   interactive?: {
//     type: 'button_reply' | 'list_reply'
//     button_reply?: { id: string; title: string }
//     list_reply?: { id: string; title: string; description?: string }
//   }
// }

// export interface WhatsAppWebhookBody {
//   object: string
//   entry: Array<{
//     changes: Array<{
//       value: {
//         messages?: WhatsAppMessage[]
//         contacts?: Array<{ profile: { name: string } }>
//       }
//     }>
//   }>
// }
