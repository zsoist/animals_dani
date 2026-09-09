import type { Streak } from "@/lib/engine/types";
import { Icon } from "./icons";
export function StreakDisplay({
  streak,
  dates,
  today,
}: {
  streak: Streak;
  dates: string[];
  today: string;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 6 + i);
    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("es", {
        weekday: "short",
        timeZone: "UTC",
      })
        .format(date)
        .slice(0, 2),
    };
  });
  return (
    <section className="streak-display" aria-label="Tu racha de práctica">
      <div className="streak-title">
        <Icon name="fire" size={40} />
        <div>
          <strong>
            {streak.current} {streak.current === 1 ? "día" : "días"} de racha
          </strong>
          <span>
            {dates.includes(today)
              ? "¡Hoy ya cuidaste del refugio!"
              : "Completa una misión para encenderla."}
          </span>
        </div>
        <small>
          Récord
          <br />
          <b>{streak.best} {streak.best===1?"día":"días"}</b>
        </small>
      </div>
      <div className="week-days">
        {days.map((day, i) => (
          <div
            key={day.key}
            className={
              dates.includes(day.key)
                ? "day done"
                : i === 6
                  ? "day today"
                  : "day"
            }
          >
            <span>{day.label}</span>
            <b
              aria-label={`${day.key}: ${dates.includes(day.key) ? "completado" : "sin práctica"}`}
            >
              {dates.includes(day.key) ? (
                <Icon name="check" size={18} />
              ) : i === 6 ? (
                <Icon name="fire" size={17} />
              ) : (
                "·"
              )}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}
