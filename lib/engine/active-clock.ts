/** Clock measures active intervals only; callers supply a monotonic time. */
export class ActiveClock {
  private elapsed = 0;
  private since: number | null = null;
  sync(now: number, active: boolean) {
    this.elapsed = this.read(now);
    this.since = active ? now : null;
  }
  read(now: number) {
    return Math.round(this.elapsed + (this.since === null ? 0 : Math.max(0, now - this.since)));
  }
  reset(now: number) {
    this.elapsed = 0;
    if (this.since !== null) this.since = now;
  }
}
