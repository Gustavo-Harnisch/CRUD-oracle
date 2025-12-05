import { memo } from "react";
import InfoCard from "./InfoCard";

const CardGrid = memo(({ items = [], colClass = "col-md-4", gapClass = "g-3" }) => {
  if (!items.length) return null;

  return (
    <div className={`row ${gapClass}`}>
      {items.map((item, index) => (
        <div
          className={colClass}
          key={item.key ?? item.id ?? item.title ?? index}
        >
          <InfoCard {...item} />
        </div>
      ))}
    </div>
  );
});

CardGrid.displayName = "CardGrid";

export default CardGrid;
