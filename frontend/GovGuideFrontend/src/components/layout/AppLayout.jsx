import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { usePageLoadingState } from "../../context/PageLoadingContext";
import PageTransitionOverlay from "./PageTransitionOverlay";

const AppLayout = () => {
  const isPageLoading = usePageLoadingState();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background-secondary)]">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />

        <main className="relative flex-1 overflow-y-auto p-6 md:p-8">
          {isPageLoading && <PageTransitionOverlay />}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
