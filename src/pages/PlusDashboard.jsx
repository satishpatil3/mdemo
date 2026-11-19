import FeatureCard from "../components/FeatureCard";

function PlusDashboard() {
  const features = [
    {
      title: "View Projects",
      description: "Access available projects"
    },
    {
      title: "Create Project",
      description: "Create basic projects"
    },
    {
      title: "Basic Reports",
      description: "View project reports"
    }
  ];

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">
        Plus Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </>
  );
}

export default PlusDashboard;
