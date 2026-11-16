import type { sk } from './sk'

/** Every text in the app has a key. The keys come from the Slovak file. */
export type MessageKey = keyof typeof sk

/** A complete set of texts for one language. A missing or extra key is a TypeScript error. */
export type Messages = Record<MessageKey, string>
