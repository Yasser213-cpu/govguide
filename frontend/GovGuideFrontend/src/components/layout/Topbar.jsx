import RtlToggle from "./RtlToggle";

const Topbar = () => {
  return (
    <header className="topbar">
      <h3>Dashboard</h3>

      <div className="topbar-actions">
        <RtlToggle />
      </div>
    </header>
  );
};

export default Topbar;
