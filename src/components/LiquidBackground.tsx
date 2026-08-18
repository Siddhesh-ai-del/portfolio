export default function LiquidBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="grain fixed inset-0 z-[-2] pointer-events-none"
        style={{ opacity: 0.045, mixBlendMode: 'multiply' }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[-3] pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(250,247,240,0) 55%)',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          background:
            'radial-gradient(140% 120% at 85% 110%, rgba(161,94,44,0.05) 0%, transparent 55%)',
        }}
      />
    </>
  );
}
