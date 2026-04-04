export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid var(--border2)`,
      borderTopColor: 'var(--gold)',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  );
}
