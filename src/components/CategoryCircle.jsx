import { Link } from "react-router-dom";

const CategoryCircle = ({ name, image, slug }) => {
  return (
    <Link to={`/shop?category=${slug}`} className="flex flex-col items-center gap-2 group">
      <div className="category-circle">
        <img src={image} alt={name} className="w-16 h-16 object-contain" />
      </div>
      <span className="text-xs font-medium text-foreground text-center group-hover:text-primary transition-colors">
        {name}
      </span>
    </Link>
  );
};

export default CategoryCircle;
