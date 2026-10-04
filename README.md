# awasp

**Stream one GGUF from any Range+CORS URL into a bounded buffer, resumable from the
device's own cache.**

`aw` is short for Aither World. `awasp` is the *weight-streaming plane*: the part that
gets multi-gigabyte model weights onto a device that cannot hold them all at once.

## The problem

Downloading a model in a browser is not a download problem, it is a *peak memory*
problem. A naive loader materialises a whole tensor in one `ArrayBuffer` before it
touches the GPU — a 27B model's token embedding table is 171 MB, and the repack that
follows doubles it. On a desktop that is a shrug. On a phone the operating system
kills the tab, and a memory-killed worker posts no message and fires no error, so the
page simply stops forever with no exception anyone can debug.

The second half of the problem is *refusal timing*. Every browser runtime discovers
"this buffer is too big for this device" **after** it has spent the visitor's bytes
fetching it. The limit is knowable before the first byte: the adapter publishes
`maxBufferSize` and `maxStorageBufferBindingSize`, and a side-car manifest can publish
the largest tensor a file contains.

## What awasp does

| piece | what it is |
|---|---|
| `source` | HTTP Range transport with retry, a stall watchdog and per-request mirror failover |
| `cache` | OPFS primary (write-at-offset, resume by chunk hash), IndexedDB fallback |
| `manifest` | `<file>.wasp.json` — size, 32 MiB chunk hashes, `largestTensorGpuBytes`, block geometry |
| `sink-webgpu` | bounded streaming upload: at most two chunks in flight, ever |
| `sink-wasm` | the same chunks written to an OPFS file and handed to a wasm runtime as a Blob |
| `budget` | what this device can actually hold, from the adapter's own limits |

The manifest is the piece that moves the refusal **before** the first range GET:

```ts
const m = await fetchWaspManifest(weightsUrl)
const cap = deviceBudget(adapter).maxTensorBytes
if (m && m.largestTensorGpuBytes > cap) {
  // refuse here, having spent nothing
}
```

When no manifest is served, awasp says so out loud (`wasp: no manifest, unbounded
upload`) and falls back to the old behaviour. It never degrades silently — a loader
that quietly stops bounding memory is indistinguishable from one that never did.

## Status

`planned` as a standalone npm package; the implementation is real and shipping inside
the browser runtime today. This package is the published contract over it.

## Licence

BUSL-1.1. See `LICENSE`.
