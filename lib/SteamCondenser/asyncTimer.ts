/**
 * Return a promise that resolves after some time.
 * 
 * Not: there's no way to abort the timer.
 * 
 * @param time miliseconds
 */
export async function wait(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Return a promise that rejects after some time or when a promise resolve/rejects
 * 
 * @param prom Promise that resolve/rejects when job is done
 * @param time miliseconds
 */
export async function doWithin<T>(prom: Promise<T>, time: number): Promise<T> {
  let done = false;
  let timeout: NodeJS.Timeout;
  return new Promise((resolve, reject) => {
    new Promise(timerResolve => timeout = setTimeout(timerResolve, time))
      .then(() => {
        if (!done) {
          done = true;
          clearTimeout(timeout);
          reject(new Error("Timed out."));
        }
      });
      prom.then((val: T) => {
        if (!done) {
          done = true;
          clearTimeout(timeout);
          resolve(val);
        }
      })
      .catch((error) => reject(error));
  });
}
