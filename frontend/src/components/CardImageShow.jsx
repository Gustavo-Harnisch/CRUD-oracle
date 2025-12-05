// src/components/CardImageShow.jsx
const CardImageShow = ({ image, alt, title, text, linkHref, linkLabel }) => {
  return (
    <div
      className="card h-100 card-image-show mx-auto"
      style={{
        width: "18rem",
        maxWidth: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <img src={image} className="card-img-top" alt={alt || title} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text flex-grow-1">{text}</p>
        {linkHref && (
          <a className="btn btn-cta align-self-start" href={linkHref}>
            {linkLabel || "Ver más"}
          </a>
        )}
      </div>
    </div>
  );
};

export default CardImageShow;
