function FeatureCard({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {title}
      </h3>

      <p className="text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
