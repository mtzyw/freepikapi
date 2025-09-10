type Releaser = () => void;

class Semaphore {
  private capacity: number;
  private queue: Array<() => void> = [];
  private inUse = 0;

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  async acquire(): Promise<Releaser> {
    if (this.inUse < this.capacity) {
      this.inUse += 1;
      let released = false;
      return () => {
        if (released) return;
        released = true;
        this.inUse -= 1;
        const next = this.queue.shift();
        if (next) next();
      };
    }
    return new Promise<Releaser>((resolve) => {
      const tryAcquire = () => {
        if (this.inUse < this.capacity) {
          this.inUse += 1;
          let released = false;
          resolve(() => {
            if (released) return;
            released = true;
            this.inUse -= 1;
            const next = this.queue.shift();
            if (next) next();
          });
        } else {
          this.queue.push(tryAcquire);
        }
      };
      this.queue.push(tryAcquire);
      const n = this.queue.shift();
      if (n) n();
    });
  }
}

// Global semaphores for transfers
const uploadSem = new Semaphore(Number(process.env.R2_UPLOAD_CONCURRENCY ?? 4));
const downloadSem = new Semaphore(Number(process.env.R2_DOWNLOAD_CONCURRENCY ?? 6));

export async function withUploadPermit<T>(fn: () => Promise<T>): Promise<T> {
  const release = await uploadSem.acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}

export async function withDownloadPermit<T>(fn: () => Promise<T>): Promise<T> {
  const release = await downloadSem.acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}

