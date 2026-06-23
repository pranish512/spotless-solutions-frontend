import { Link } from "react-router-dom";

const CategoryCircle = ({ name, image, slug }) => {
  return (
    <Link to={`/shop?category=${slug}`} className="flex flex-col items-center gap-2 group">
      {/* Gradient-tinted circle + a light image filter keep mixed-source icons
          (uploaded vs. local) on a consistent tone. */}
      <div className="category-circle bg-gradient-to-br from-primary/10 via-card to-secondary/10">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-110"
            style={{ filter: "saturate(1.08) contrast(1.03) drop-shadow(0 2px 6px rgb(0 0 0 / 0.08))" }}
          />
        ) : (
          <span className="text-2xl font-display font-bold text-primary/60">
            {(name || "?").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-xs font-medium text-foreground text-center group-hover:text-primary transition-colors">
        {name}
      </span>
    </Link>
  );
};

export default CategoryCircle;
