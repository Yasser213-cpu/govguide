import { Outlet } from "react-router-dom";
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";

const CompanyAppLayout = () => {
  return (
    <div className="flex min-h-screen bg-[var(--background-secondary)]">
      <CompanySidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <CompanyTopbar />

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompanyAppLayout;
