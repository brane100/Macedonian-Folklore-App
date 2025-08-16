import React from 'react';
import './AboutProject.css';
import { useTranslation } from 'react-i18next';


export default function AboutProject() {
  const { t } = useTranslation();

  return (
    <div className="about-project">
      <h2>{t('aboutProject.title')}</h2>
      <section>
        <h3>{t('aboutProject.lang')}</h3>
        <h4>{t('aboutProject.title')}</h4>
        <p>{t('aboutProject.description')}</p>
        <h4>{t('aboutProject.missionLabel')}</h4>
        <p>{t('aboutProject.mission')}</p>
        <h4>{t('aboutProject.visionLabel')}</h4>
        <p>{t('aboutProject.vision')}</p>
      </section>
    </div>
  );
}
