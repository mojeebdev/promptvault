'use client';

export function HeroVideo() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Desktop */}
      <video
        className="hero-video-desktop"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/hero-bg-video-desktop.mp4"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
        }}
      />
      {/* Mobile */}
      <video
        className="hero-video-mobile"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/hero-bg-video-mobile.mp4"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
          display: 'none',
        }}
      />
      {/* Overlay gradient — from spec */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            to bottom,
            rgba(10,10,11,0.3) 0%,
            rgba(10,10,11,0.1) 40%,
            rgba(10,10,11,0.88) 100%
          )`,
          zIndex: 1,
        }}
      />
    </div>
  );
}
