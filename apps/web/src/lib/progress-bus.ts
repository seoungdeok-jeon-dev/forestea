/** Lightweight bus so non-React modules (e.g. fetchApi) can drive the top progress bar. */

type Handler = () => void;

const startHandlers = new Set<Handler>();
const doneHandlers = new Set<Handler>();
let activeCount = 0;

export function subscribeProgress(handlers: {
  onStart: Handler;
  onDone: Handler;
}): () => void {
  startHandlers.add(handlers.onStart);
  doneHandlers.add(handlers.onDone);
  return () => {
    startHandlers.delete(handlers.onStart);
    doneHandlers.delete(handlers.onDone);
  };
}

export function progressStart(): void {
  activeCount += 1;
  if (activeCount === 1) {
    for (const h of startHandlers) h();
  }
}

export function progressDone(): void {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount === 0) {
    for (const h of doneHandlers) h();
  }
}
