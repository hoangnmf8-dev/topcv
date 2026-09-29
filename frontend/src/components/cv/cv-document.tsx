import type { CSSProperties, ReactNode } from "react";
import type { CVData, TemplateId, ThemeId } from "@/lib/cv-layout";
import { getTheme } from "@/lib/cv-layout";
import { Mail, MapPin, Phone, Globe, Linkedin, Github } from "lucide-react";

type Props = { data: CVData; template: TemplateId; theme: ThemeId };
export function CVDocument({ data, template, theme }: Props) {
  const palette = getTheme(theme);
  const accent = template === "creative" ? palette.accent : palette.ink;
  const single =
    template === "minimal" || template === "ats" || template === "classic";
  const dark = template === "modern";
  const creative = template === "creative";
  const sidebarRight = template === "sales" || template === "graduate";
  const style = {
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.7,
    fontFamily:
      template === "classic"
        ? "Georgia, 'Times New Roman', serif"
        : "Arial, sans-serif",
    background: "#fff",
    minHeight: "100%",
    overflowWrap: "anywhere",
  } satisfies CSSProperties;
  const name = data.personal.fullName || "HỌ VÀ TÊN";
  const initials = name
    .split(/\s+/)
    .slice(-2)
    .map((v) => v[0])
    .join("");
  const heading = (title: string) => (
    <h2
      style={{
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: single ? 1.8 : 1.2,
        textTransform: "uppercase",
        color: accent,
        marginBottom: 16,
        paddingBottom: 9,
        borderBottom: "1px solid " + palette.soft,
      }}
    >
      {title}
    </h2>
  );
  const section = (title: string, children: ReactNode) => (
    <section style={{ marginBottom: 30, breakInside: "avoid" }}>
      {heading(title)}
      {children}
    </section>
  );
  const avatar = (
    <div
      style={{
        width: 110,
        height: 130,
        flexShrink: 0,
        background: palette.soft,
        color: accent,
        display: "grid",
        placeItems: "center",
        borderRadius: creative ? "48px 48px 8px 8px" : 6,
        overflow: "hidden",
        fontSize: 34,
        fontWeight: 700,
      }}
    >
      {data.personal.avatar ? (
        <img
          src={data.personal.avatar}
          alt="Ảnh đại diện"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials
      )}
    </div>
  );
  const contacts = [
    [Phone, data.personal.phone],
    [Mail, data.personal.email],
    [MapPin, data.personal.address],
    [Github, data.personal.github],
    [Linkedin, data.personal.linkedin],
  ] as const;
  const contactBlock = (
    <div style={{ display: "grid", gap: 11 }}>
      {contacts
        .filter(([, value]) => value)
        .map(([Icon, value], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              fontSize: 12,
            }}
          >
            <Icon
              size={14}
              style={{ flexShrink: 0, marginTop: 3, opacity: 0.7 }}
            />
            <span>{value}</span>
          </div>
        ))}
    </div>
  );
  const education = (
    <div style={{ display: "grid", gap: 20 }}>
      {data.educations.map((edu) => (
        <div key={edu.id}>
          <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 5 }}>
            {edu.timeline}
          </p>
          <p style={{ fontWeight: 700 }}>{edu.school}</p>
          <p style={{ marginTop: 5 }}>{edu.degree}</p>
        </div>
      ))}
    </div>
  );
  const skills = (
    <div style={{ display: "grid", gap: 14 }}>
      {data.skills.map((skill) => (
        <div key={skill.id}>
          <p style={{ fontWeight: 600, fontSize: 12 }}>{skill.name}</p>
          {template !== "ats" && (
            <div
              style={{
                marginTop: 7,
                height: 3,
                background: dark ? "#ffffff30" : "#dfe5e9",
              }}
            >
              <div
                style={{
                  width: Math.max(0, Math.min(100, skill.level * 20)) + "%",
                  height: "100%",
                  background: dark ? "#fff" : accent,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
  const experiences = (
    <div>
      {data.experiences.map((exp, i) => (
        <article
          key={exp.id}
          style={{
            marginBottom: 26,
            paddingLeft: single ? 0 : 18,
            borderLeft: single ? undefined : "2px solid " + palette.soft,
            position: "relative",
            breakInside: "avoid",
          }}
        >
          {!single && (
            <span
              style={{
                position: "absolute",
                left: -5,
                top: 7,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: accent,
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 14, color: "#172c3e" }}>
              {exp.role}
            </h3>
            <span
              style={{ fontSize: 10, whiteSpace: "nowrap", color: "#64748b" }}
            >
              {exp.timeline}
            </span>
          </div>
          <p
            style={{
              fontWeight: 600,
              color: accent,
              marginTop: 3,
              marginBottom: 10,
            }}
          >
            {exp.company}
          </p>
          <ul
            style={{
              paddingLeft: 16,
              listStyleType: "disc",
              display: "grid",
              gap: 7,
            }}
          >
            {exp.bullets.filter(Boolean).map((text, j) => (
              <li key={j}>{text}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
  const header = (
    <header
      style={{
        padding: single ? "42px 46px 26px" : "38px 38px 28px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        borderTop:
          template === "ats" || template === "minimal"
            ? "0"
            : "7px solid " + accent,
        background: creative ? palette.soft : "#fff",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      {!single && !dark && avatar}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: template === "classic" ? "center" : "left",
        }}
      >
        <h1
          style={{
            fontSize: single ? 32 : 30,
            lineHeight: 1.22,
            fontWeight: 700,
            letterSpacing: template === "classic" ? 2 : 0.5,
            color: accent,
          }}
        >
          {name}
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 15,
            letterSpacing: 1,
            color: "#526579",
          }}
        >
          {data.personal.title || "Vị trí ứng tuyển"}
        </p>
        {single && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: template === "classic" ? "center" : "flex-start",
              gap: "5px 18px",
              marginTop: 16,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            {contacts
              .filter(([, value]) => value)
              .map(([, value], i) => (
                <span key={i}>{value}</span>
              ))}
          </div>
        )}
      </div>
      {dark && avatar}
    </header>
  );
  const intro = section(
    "Giới thiệu",
    <p style={{ whiteSpace: "pre-line" }}>{data.objective}</p>,
  );

  const chips = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {data.skills.map((skill) => (
        <span
          key={skill.id}
          style={{
            border: "1px solid " + palette.soft,
            padding: "7px 12px",
            borderRadius: 4,
            color: accent,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {skill.name}
        </span>
      ))}
    </div>
  );
  const identity = (size = 36) => (
    <>
      <h1
        style={{
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: -0.5,
        }}
      >
        {name}
      </h1>
      <p style={{ fontSize: 16, marginTop: 12 }}>
        {data.personal.title || "Vị trí ứng tuyển"}
      </p>
    </>
  );
  if (template === "executive")
    return (
      <div style={style}>
        <header
          style={{
            background: accent,
            color: "#fff",
            padding: "48px 48px 38px",
          }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: 4,
              marginBottom: 20,
              opacity: 0.7,
            }}
          >
            HỒ SƠ CHUYÊN MÔN
          </p>
          {identity(38)}
          <div
            style={{
              height: 3,
              width: 70,
              background: "#d7b880",
              marginTop: 28,
            }}
          />
        </header>
        <div style={{ padding: "28px 48px", borderBottom: "1px solid #ddd" }}>
          {contactBlock}
        </div>
        <main style={{ padding: "32px 48px" }}>
          {intro}
          {section("Kinh nghiệm & trách nhiệm", experiences)}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 35 }}
          >
            {section("Năng lực quản lý", chips)}
            {section("Học vấn", education)}
          </div>
        </main>
      </div>
    );
  if (template === "tech")
    return (
      <div style={{ ...style, background: "#f5f7fa" }}>
        <header
          style={{ padding: "40px", background: "#172536", color: "white" }}
        >
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#75d5bd",
              marginBottom: 16,
            }}
          >
            PROFILE / ENGINEERING
          </p>
          {identity(34)}
          <div style={{ marginTop: 24 }}>{contactBlock}</div>
        </header>
        <main style={{ padding: 32 }}>
          <section
            style={{
              padding: 24,
              background: "white",
              borderLeft: "4px solid " + accent,
              marginBottom: 24,
            }}
          >
            {heading("01 / Giới thiệu")}
            <p>{data.objective}</p>
          </section>
          <section
            style={{ padding: 24, background: "white", marginBottom: 24 }}
          >
            {heading("02 / Công nghệ & công cụ")}
            {chips}
          </section>
          <section
            style={{ padding: 24, background: "white", marginBottom: 24 }}
          >
            {heading("03 / Kinh nghiệm phát triển")}
            {experiences}
          </section>
          <section style={{ padding: 24, background: "white" }}>
            {heading("04 / Học vấn")}
            {education}
          </section>
        </main>
      </div>
    );
  if (template === "creative")
    return (
      <div style={{ ...style, background: "#fffdf9", padding: 40 }}>
        <header
          style={{
            position: "relative",
            padding: "32px 28px",
            background: palette.soft,
            borderRadius: "70px 6px 70px 6px",
            display: "flex",
            alignItems: "center",
            gap: 25,
            marginBottom: 32,
          }}
        >
          {avatar}
          <div style={{ color: accent }}>
            <p style={{ fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
              CREATIVE PROFILE
            </p>
            {identity(36)}
          </div>
        </header>
        <main
          style={{ display: "grid", gridTemplateColumns: "1fr 205px", gap: 32 }}
        >
          <div>
            {section("Một chút về tôi", <p>{data.objective}</p>)}
            {section(
              "Hành trình sáng tạo",
              <div>
                {data.experiences.map((exp, i) => (
                  <article key={exp.id} style={{ marginBottom: 26 }}>
                    <p
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: accent,
                        opacity: 0.5,
                      }}
                    >
                      0{i + 1}
                    </p>
                    <h3 style={{ fontWeight: 700, fontSize: 15 }}>
                      {exp.role}
                    </h3>
                    <p style={{ fontSize: 12, color: accent, margin: "5px 0" }}>
                      {exp.company} · {exp.timeline}
                    </p>
                    <ul style={{ listStyle: "disc", paddingLeft: 18 }}>
                      {exp.bullets.map((b, j) => (
                        <li key={j} style={{ marginTop: 8 }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>,
            )}
          </div>
          <aside style={{ paddingTop: 8 }}>
            {section("Liên hệ", contactBlock)}
            {section("Bộ công cụ", chips)}
            {section("Học vấn", education)}
          </aside>
        </main>
      </div>
    );
  if (template === "sales")
    return (
      <div style={style}>
        <header
          style={{
            padding: 40,
            borderLeft: "18px solid " + accent,
            display: "flex",
            gap: 28,
            alignItems: "center",
          }}
        >
          {avatar}
          <div style={{ color: accent }}>{identity(34)}</div>
        </header>
        <div
          style={{ padding: "20px 40px", background: accent, color: "#fff" }}
        >
          {contactBlock}
        </div>
        <main style={{ padding: "34px 40px" }}>
          {intro}
          <div
            style={{ padding: 22, background: palette.soft, marginBottom: 30 }}
          >
            {heading("Năng lực kinh doanh")}
            {chips}
          </div>
          {section("Kinh nghiệm & kết quả", experiences)}
          {section("Nền tảng học vấn", education)}
        </main>
      </div>
    );
  if (template === "graduate")
    return (
      <div style={{ ...style, padding: 42 }}>
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 110px",
            gap: 20,
            borderBottom: "3px solid " + accent,
            paddingBottom: 25,
          }}
        >
          <div style={{ color: accent }}>
            <p style={{ fontSize: 11, letterSpacing: 3, marginBottom: 14 }}>
              KHỞI ĐẦU SỰ NGHIỆP
            </p>
            {identity(32)}
          </div>
          {avatar}
        </header>
        <main style={{ paddingTop: 26 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginBottom: 8,
            }}
          >
            {section("Mục tiêu nghề nghiệp", <p>{data.objective}</p>)}
            {section("Thông tin liên hệ", contactBlock)}
          </div>
          <section
            style={{
              padding: 24,
              background: palette.soft,
              borderRadius: 8,
              marginBottom: 30,
            }}
          >
            {heading("Học vấn")}
            {education}
          </section>
          {section("Dự án & hoạt động", experiences)}
          {section("Kỹ năng", chips)}
        </main>
      </div>
    );
  if (template === "minimal")
    return (
      <div style={{ ...style, padding: "55px 48px" }}>
        <header
          style={{ paddingBottom: 30, borderBottom: "1px solid #cbd5e1" }}
        >
          {identity(40)}
          <div style={{ marginTop: 20 }}>{contactBlock}</div>
        </header>
        <main style={{ paddingTop: 35 }}>
          {[
            ["Giới thiệu", <p key="intro">{data.objective}</p>],
            ["Kinh nghiệm", experiences],
            ["Học vấn", education],
            ["Kỹ năng", chips],
          ].map(([label, content], i) => (
            <section
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "125px 1fr",
                gap: 25,
                marginBottom: 35,
              }}
            >
              <h2
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#64748b",
                  paddingTop: 3,
                }}
              >
                {label}
              </h2>
              <div>{content}</div>
            </section>
          ))}
        </main>
      </div>
    );

  if (single)
    return (
      <div style={style}>
        {header}
        <div style={{ padding: "30px 46px 40px" }}>
          {intro}
          {section("Kinh nghiệm làm việc", experiences)}
          {section("Học vấn", education)}
          {section(
            "Kỹ năng chuyên môn",
            <div
              style={{
                display: "grid",
                gridTemplateColumns: template === "ats" ? "1fr" : "1fr 1fr",
                gap: 20,
              }}
            >
              {skills}
            </div>,
          )}
        </div>
      </div>
    );
  const sideHeading = (text: string) => (
    <h2
      style={{
        fontSize: 13,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1.4,
        marginBottom: 17,
        paddingBottom: 10,
        borderBottom: dark ? "1px solid #ffffff40" : "1px solid #ccd8d5",
      }}
    >
      {text}
    </h2>
  );
  const sidebar = (
    <aside
      style={{
        padding: "32px 26px",
        background: dark
          ? accent
          : template === "tech"
            ? "#edf2f7"
            : palette.soft,
        color: dark ? "#fff" : accent,
        minWidth: 0,
      }}
    >
      <section style={{ marginBottom: 34 }}>
        {sideHeading("Thông tin liên hệ")}
        {contactBlock}
      </section>
      <section style={{ marginBottom: 34 }}>
        {sideHeading("Kỹ năng")}
        {skills}
      </section>
      <section>
        {sideHeading("Học vấn")}
        {education}
      </section>
    </aside>
  );
  const main = (
    <main style={{ padding: "32px 30px", minWidth: 0 }}>
      {intro}
      {section("Kinh nghiệm làm việc", experiences)}
    </main>
  );
  return (
    <div style={{ ...style, display: "flex", flexDirection: "column" }}>
      {header}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sidebarRight ? "1fr 245px" : "245px 1fr",
          flex: 1,
        }}
      >
        {sidebarRight ? (
          <>
            {main}
            {sidebar}
          </>
        ) : (
          <>
            {sidebar}
            {main}
          </>
        )}
      </div>
    </div>
  );
}
