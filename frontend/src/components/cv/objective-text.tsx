import { stripBullet } from "@/lib/content-limits";

export function ObjectiveText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 1 || lines.some((line) => /^[-*•]\s/.test(line))) {
    return (
      <ul className={className} style={{ listStyle: "disc", paddingLeft: 18 }}>
        {lines.map((line, index) => (
          <li key={index} style={{ marginTop: 4 }}>
            {stripBullet(line)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className={className} style={{ whiteSpace: "pre-line" }}>
      {text}
    </p>
  );
}
