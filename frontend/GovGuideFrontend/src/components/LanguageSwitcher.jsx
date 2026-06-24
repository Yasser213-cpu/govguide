import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: "en", label: "English", flag: "🇬🇧" },
        { code: "ar", label: "العربية", flag: "🇸🇦" },
    ];

    const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];

    const handleLanguageChange = (languageCode) => {
        i18n.changeLanguage(languageCode);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-primary)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)] transition-colors duration-200"
                title="Change Language"
            >
                <span className="text-sm font-medium">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className={`absolute top-full mt-2 bg-[var(--background-primary)] border border-[var(--border)] rounded-lg shadow-lg z-50 min-w-max ${ document.documentElement.dir === "rtl"
                        ? "left-0"
                        : "right-0" }`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-2 transition-colors duration-150 ${i18n.language === lang.code
                                    ? "bg-[var(--primary-light)] text-[var(--primary)]"
                                    : "text-[var(--text-primary)] hover:bg-[var(--background-secondary)]"
                                } first:rounded-t-lg last:rounded-b-lg`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium">{lang.label}</span>
                            {i18n.language === lang.code && (
                                <span className="ml-auto text-[var(--primary)]">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
