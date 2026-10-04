/**
 * awasp — Aither World Aitherium Streaming Plane.
 *
 * Stream one GGUF from any Range+CORS URL into a bounded buffer, resumable from
 * the device's own cache.
 *
 * THIS FILE IS A RE-EXPORT AND NOTHING ELSE, on purpose.
 *
 * The runtime that does the work is ONE tree — the browser inference runtime the
 * monorepo keeps canonical and mirrors into the SDK package by a sync lane. A
 * second hand-written copy of a loader is the exact failure this whole family of
 * gates exists to prevent: two copies of "how many bytes may be in flight" drift,
 * and the drift is silent until a phone is killed for memory mid-load. So awasp
 * ships the NAME and the contract, and imports the implementation rather than
 * restating it.
 *
 * WHAT IT DOES ALONE, for a stranger:
 *
 *   import { openWaspSource, uploadStreaming, deviceBudget } from '@aitherium/awasp'
 *
 *   const budget = await deviceBudget(adapter)          // what this device can hold
 *   const src = await openWaspSource({ urls: [weightsUrl] })
 *   await uploadStreaming(device, src.fetchRange, tensor, { budget })
 *
 * Nothing above needs an account, a server, or a sibling package: any host that
 * answers HTTP Range with CORS is a weight source.
 */

export * from '@aitherium/awkit/webml/bonsai/wasp';
