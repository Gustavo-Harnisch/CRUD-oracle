// src/components/CardImageShow.jsx
import { Link } from "react-router-dom";

const CardImageShow = ({ image, alt, title, text, linkHref, linkLabel, onLinkClick }) => {
  const renderAction = () => {
    if (!linkHref && !onLinkClick) return null;

    const sharedClass = "btn btn-outline-primary btn-sm align-self-start";
    const label = linkLabel || "Ver mas";

    if (onLinkClick) {
      return (
        <button type="button" className={sharedClass} onClick={onLinkClick}>
          {label}
        </button>
      );
    }

    return (
      <Link className={sharedClass} to={linkHref}>
        {label}
      </Link>
    );
  };

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
        {renderAction()}
      </div>
    </div>
  );
};

export default CardImageShow;
