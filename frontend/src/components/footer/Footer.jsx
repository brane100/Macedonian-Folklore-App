import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer style={{ padding: '2rem', backgroundColor: '#dc3545', color: 'white', textAlign: 'center' }}>
      <p>🏛️ Македонски фолклор © 2024</p>
      <small>{t('common.language')}: 🇲🇰 🇸🇮 🇺🇸</small>
    </footer>
  );
}