function FeatureCard({ title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">

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