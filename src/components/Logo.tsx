import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 96, showText = false, className = "" }: LogoProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: showText ? 10 : 0,
      }}
    >
      <Image
        src="/logo.jpeg"
        alt="Fraber CrossFit"
        width={size}
        height={size}
        priority
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      />
      {showText ? (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: "1.35rem",
              letterSpacing: "0.06em",
              color: "var(--fraber-primary)",
            }}
          >
            FRABER
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--fraber-accent)",
            }}
          >
            CrossFit
          </p>
        </div>
      ) : null}
    </div>
  );
}
