import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Hero */}

      <section className="flex-1 flex items-center justify-center px-10">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10 items-center">
          {/* Left Content */}

          <div>
            <h1 className="text-6xl font-bold text-slate-800 mb-6">
              React + Firebase
            </h1>
          </div>

          {/* Right Signup Card */}

          <div className="bg-white rounded-2xl shadow-xl p-10">
            <h2 className="text-4xl font-bold mb-4">Join Us Today</h2>

            <p className="text-gray-500 mb-8">
              Create your account and explore our Firebase powered application.
            </p>

            <Link
              to="/signup"
              className="block w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="bg-slate-900 text-white text-center py-6">
        <p>React Firebase Demo App © 2026</p>
      </footer>
    </div>
  );
}

export default Home;
