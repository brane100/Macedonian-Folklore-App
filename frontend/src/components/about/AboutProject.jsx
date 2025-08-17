import React from 'react';
import './AboutProject.css';
import { useTranslation } from 'react-i18next';


const AboutProject = () => {
  const {t, i18n} = useTranslation();
  console.log('Current language:', i18n.language);

  return (
    <div className="about-project">
      <h2>{t('aboutProject.title')}</h2>
      <section>
        <h3>{t('aboutProject.lang')}</h3>
        <br />
        <h4>Folklore MK</h4>
        <p>{t('aboutProject.description')}</p>
        <h4>{t('aboutProject.missionLabel')}</h4>
        <p>{t('aboutProject.mission')}</p>
        <h4>{t('aboutProject.visionLabel')}</h4>
        <p>{t('aboutProject.vision')}</p>
      </section>
    </div>
  );
};

export default AboutProject;