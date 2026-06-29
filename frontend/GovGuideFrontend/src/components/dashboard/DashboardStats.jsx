import { FiClock, FiCheckCircle, FiFileText } from "react-icons/fi";

export default function DashboardStats({ active, pending, completed }) {
  const stats = [
    {
      title: "Active Requests",
      value: active,
      icon: FiFileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending",
      value: pending,
      icon: FiClock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Completed",
      value: completed,
      icon: FiCheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6 transition-all duration-300 hover:border-[var(--primary)] hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.title}
                </p>

                <h2 className="mt-3 text-4xl font-bold">{item.value}</h2>
              </div>

              <div className={`rounded-xl p-3 ${item.bg}`}>
                <Icon className={`text-2xl ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
