export default function LiquidBackground() {
  return (
    <>
      {/* Static noise overlay — deliberately NOT mix-blend-mode: multiply.
          A blend mode on a full-viewport fixed layer forces the root stacking
          context to re-blend every scroll frame (measured 30fps at DPR 2);
          plain low-opacity paint is visually indistinguishable (Δ≈0.5/255)
          and composites for free. */}
      <div
        aria-hidden="true"
        className="grain fixed inset-0 z-[-2] pointer-events-none"
        style={{ opacity: 0.045 }}
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
