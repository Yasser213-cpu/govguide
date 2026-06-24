import LanguageSwitcher from "../LanguageSwitcher";

const AdminTopbar = () => {
  return (
    <header className="h-16 flex items-center justify-end px-6 gap-3 bg-[var(--background-secondary)]">
      <LanguageSwitcher />
    </header>
  );
};

export default AdminTopbar;
