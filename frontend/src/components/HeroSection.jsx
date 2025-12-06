// src/components/HeroSection.jsx
const HeroSection = ({
  backgroundImage,
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  primaryOnClick,
  minHeight = "calc(100vh - 5.5rem)",
  overlayOpacity = 0.5,
}) => {
  return (
    <section
      className="position-relative text-white d-flex align-items-center justify-content-center text-center"
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
            {primaryHref || primaryOnClick ? (
              <button
                type="button"
                className="btn btn-light fw-semibold"
                onClick={primaryOnClick}
              >
                {primaryLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
