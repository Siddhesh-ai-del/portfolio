// Ambient page background — three stacked fixed layers, all pointer-events-none
// and aria-hidden so they never enter the accessibility tree or hit-testing.
// Everything sits at negative z-index, which is why App renders this component
// before <main>: the layers paint behind all content without forcing any
// section to opt out of the root stacking context. Pure decoration, so the
// component owns no state and never re-renders meaningfully.

export default function LiquidBackground() {
  return (
    <>
      {/* z-[-2] grain layer — Static noise overlay.
          Deliberately NOT mix-blend-mode: multiply.
          A blend mode on a full-viewport fixed layer forces the root stacking
          context to re-blend every scroll frame (measured 30fps at DPR 2);
          plain low-opacity paint is visually indistinguishable (Δ≈0.5/255)
          and composites for free. */}
      <div
        aria-hidden="true"
        className="grain fixed inset-0 z-[-2] pointer-events-none"
        style={{ opacity: 0.045 }}
      />
      {/* z-[-3] deepest layer — top-center white wash that lifts the hero area
          so dark text keeps contrast against the paper base. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[-3] pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(250,247,240,0) 55%)',
        }}
      />
      {/* z-[-1] topmost background layer — faint bronze wash in the bottom-right
          corner for warmth; sits above grain so it isn't mottled by the noise. */}
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
