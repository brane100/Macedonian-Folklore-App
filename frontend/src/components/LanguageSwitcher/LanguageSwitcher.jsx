import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
    { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' }
  ];

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex(lang => lang.code === i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex].code);
  };

  return (
    <button
      onClick={cycleLanguage}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
      title={getCurrentLanguage().name}
      aria-label={`Current language: ${getCurrentLanguage().name}. Click to cycle languages.`}
    >
      {getCurrentLanguage().flag}
    </button>
  );
};

export default LanguageSwitcher;
