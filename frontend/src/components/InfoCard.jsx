import { memo } from "react";
import { Link } from "react-router-dom";

const InfoCard = memo(
  ({ title, text, image, linkHref, linkLabel, footer, bodyClassName = "" }) => {
    return (
      <div className="card h-100 shadow-sm">
        {image && (
          <img
            src={image}
            className="card-img-top"
            alt={title}
            style={{ objectFit: "cover", maxHeight: "180px" }}
          />
        )}

        <div className={`card-body d-flex flex-column ${bodyClassName}`.trim()}>
          <h5 className="card-title">{title}</h5>
          {text && <p className="card-text flex-grow-1">{text}</p>}

          {linkHref && linkLabel && (
            <Link to={linkHref} className="btn btn-outline-primary btn-sm align-self-start">
              {linkLabel}
            </Link>
          )}

          {footer}
        </div>
      </div>
    );
  },
);

InfoCard.displayName = "InfoCard";

export default InfoCard;
