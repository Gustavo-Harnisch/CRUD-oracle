// src/components/HeroSection.jsx
const HeroSection = ({
  backgroundImage,
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  minHeight = "calc(100vh + var(--nav-offset, 70px))",
  overlayOpacity = 0.5,
}) => {
  return (
    <section
      className="hero-section position-relative text-white d-flex align-items-center justify-content-center text-center"
      style={{
        minHeight,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />

      <div className="position-relative px-3">
        <div
          className="p-4 p-md-5 rounded-4 shadow"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
        >
          <h1 className="display-4 fw-bold mb-3">{title}</h1>
          {subtitle && <p className="lead mb-4">{subtitle}</p>}
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            {primaryHref && (
              <a href={primaryHref} className="btn btn-light fw-semibold">
                {primaryLabel}
              </a>
            )}
            {secondaryHref && (
              <a href={secondaryHref} className="btn btn-outline-light">
                {secondaryLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
