import { useState } from "react";
import Step1BasicInfo from "./Step1BasicInfo";
import Step2MediaUpload from "./Step2MediaUpload";
import Step3References from "./Step3References";
import Step4ReviewSubmit from "./Step4ReviewSubmit";
import './CreateContributionWizard.css';

export default function CreateContributionWizard() {
  const [step, setStep] = useState(1);

  // Globalno stanje (vse kar se bo vneslo)
  const [formData, setFormData] = useState({
    opis: "",
    jeAnonimen: false,
    regijaId: "",
    plesId: "",
    novPlesIme: "",
    media: [],
    referencaOpis: "",
    referencaUrl: "",
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Render glede na trenutni korak
  return (
    <div className="wizard-container" data-step={step}>
      {step === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} nextStep={nextStep} />}
      {step === 2 && <Step2MediaUpload formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <Step3References formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
      {step === 4 && <Step4ReviewSubmit formData={formData} prevStep={prevStep} />}
    </div>
  );
}