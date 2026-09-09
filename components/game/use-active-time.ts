"use client";
import { useEffect, useRef, useState } from "react";
import { ActiveClock } from "@/lib/engine/active-clock";
export function useActiveTime(key: string, paused: boolean) {
  const clock = useRef(new ActiveClock());
  const [seconds, setSeconds] = useState(0);
  useEffect(() => { clock.current.reset(performance.now()); }, [key]);
  useEffect(() => {
    const current = clock.current;
    const sync = () => current.sync(performance.now(), !paused && document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    const tick = setInterval(() => setSeconds(Math.floor(current.read(performance.now()) / 1000)), 1000);
    return () => { current.sync(performance.now(), false); clearInterval(tick); document.removeEventListener("visibilitychange", sync); };
  }, [key, paused]);
  return { seconds, read: () => clock.current.read(performance.now()), reset: () => clock.current.reset(performance.now()) };
}
