import { Link } from "react-router-dom";
import { FiArrowRight, FiCpu } from "react-icons/fi";

export default function AiAssistantCard() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/20 p-3">
          <FiCpu size={26} />
        </div>

        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>

          <p className="opacity-90">
            Get personalized company recommendations.
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-xl leading-7 text-white/90">
        Tell us what service you need and our AI will recommend the best
        companies based on your request.
      </p>

      <Link
        to="/user/ai-assistant"
        className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition"
      >
        Start Now
        <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
