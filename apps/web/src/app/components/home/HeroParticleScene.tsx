"use client";

export default function HeroParticleScene() {
  return (
    <div className="home-orb-layer" data-testid="hero-particle-scene" aria-hidden="true">
      <span className="home-orb home-orb--gold" />
      <span className="home-orb home-orb--orange" />
      <span className="home-orb home-orb--cyan" />
      <span className="home-orb home-orb--violet" />
    </div>
  );
}
