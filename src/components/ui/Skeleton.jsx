import { memo } from "react";

const shimmer = { animation: "shimmer 1.5s infinite" };
const base = { backgroundColor: "var(--border)", borderRadius: 6, ...shimmer };

export const SkeletonBar = memo(({ width = "60%", height = 14, style }) => (
  <div style={{ ...base, width, height, ...style }} />
));

export const SkeletonCircle = memo(({ size = 32, style }) => (
  <div style={{ ...base, width: size, height: size, borderRadius: "50%", ...style }} />
));

export const SkeletonBlock = memo(({ width = "100%", height = 80, style }) => (
  <div style={{ ...base, width, height, ...style }} />
));

export function SkeletonCard({ children, count = 1 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} style={{ padding: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
      {children}
    </div>
  ));
}

export function SkeletonRow({ avatar = true, lines = 2 }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      {avatar && <SkeletonCircle size={36} />}
      <div style={{ flex: 1 }}>
        <SkeletonBar width="50%" height={13} style={{ marginBottom: 6 }} />
        {lines > 1 && <SkeletonBar width="70%" height={11} style={{ marginBottom: 4 }} />}
        {lines > 2 && <SkeletonBar width="30%" height={11} />}
      </div>
    </div>
  );
}

export function SkeletonAvatar() {
  return <div style={{ width: 40, height: 40, borderRadius: 10, ...base }} />;
}
