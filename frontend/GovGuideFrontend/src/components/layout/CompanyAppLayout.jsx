import { Outlet } from "react-router-dom";
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";

const CompanyAppLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      <CompanySidebar />

      <div className="ms-[260px] flex min-h-screen min-w-0 flex-col">
        <CompanyTopbar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompanyAppLayout;
