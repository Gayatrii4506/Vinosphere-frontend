import React from 'react';

export default function HeroLanding({ setShowCatalog }) {
  return (
    <div className="home-page-container">
      <section className="hero-landing">
        <div className="hero-landing-content">
          <span className="hero-tag">EXPERIENCE FINE WINE</span>
          <h1 className="hero-title">
            Exquisite Wines,<br />
            Unforgettable <span className="gold-text">Moments</span>
          </h1>
          <p className="hero-desc">
            A perfect blend of taste, art, and ambiance. Crafted to delight your senses with artisanal wine and cheese pairings.
          </p>
        </div>
      </section>

      <section className="featured-section fade-in">
        <div className="featured-container">
          <div className="featured-image">
            <img src="/images/featured-pairings.png" alt="Curated Indian Wine Pairings" />
          </div>
          <div className="featured-content">
            <span className="section-tag">CURATED SELECTIONS</span>
            <h2 className="section-title">Discover the Perfect Match</h2>
            <p className="section-desc">
              Whether you are enjoying a rich Paneer Makhani or a fragrant Vegetable Biryani, the right wine elevates the entire culinary experience. 
              Our AI Sommelier analyzes flavor profiles, spice levels, and regional ingredients to recommend matches that bring out the best in both your glass and your plate.
            </p>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowCatalog(true)}>
              EXPLORE OUR COLLECTION
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
