export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Blob 1 — soft muted lavender/purple, mid-left */}
      <div
        style={{
          position: 'absolute',
          top: '28%',
          left: '-10%',
          width: '580px',
          height: '520px',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: '#7c5cbf',
          filter: 'blur(105px)',
          opacity: 0.2,
        }}
      />
      {/* Blob 2 — calm slate blue, top-right */}
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          right: '-8%',
          width: '560px',
          height: '500px',
          borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
          background: '#3b6fb6',
          filter: 'blur(105px)',
          opacity: 0.2,
        }}
      />
      {/* Blob 3 — warm muted amber, ~80% across width, shifted down toward edge */}
      <div
        style={{
          position: 'absolute',
          bottom: '0%',
          right: '18%',
          width: '540px',
          height: '480px',
          borderRadius: '50% 50% 60% 40% / 40% 60% 50% 60%',
          background: '#b87333',
          filter: 'blur(105px)',
          opacity: 0.2,
        }}
      />
    </div>
  );
}

