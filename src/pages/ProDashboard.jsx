import FeatureCard from "../components/FeatureCard";

function ProDashboard() {
  const features = [
    {
      title: "View Projects",
      description: "Access all projects"
    },
    {
      title: "Create Project",
      description: "Create advanced projects"
    },
    {
      title: "Advanced Analytics",
      description: "Detailed analytics"
    },
    {
      title: "Export Reports",
      description: "Download reports"
    },
    {
      title: "Priority Support",
      description: "Premium support"
    }
  ];

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">
        Pro Dashboard
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

export default ProDashboard;
