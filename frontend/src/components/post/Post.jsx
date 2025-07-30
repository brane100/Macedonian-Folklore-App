import { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Post.css';

function Prispevek(props) {
    const initialState = {
        ime_plesa: '',
        tip_plesa: '',
        kratka_zgodovina: '',
        opis_tehnike: '',
        besedilo_opis: '',
        je_anonimen: false,
        regija: '',
    };

    const [state, setState] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const regije = [
        'Скопски регион',
        'Пелагониски регион', 
        'Источен регион',
        'Југоисточен регион',
        'Југозападен регион',
        'Вардарски регион',
        'Североисточен регион',
        'Полошки регион'
    ];

    const tipoviPlesa = [
        'Оро',
        'Женско оро',
        'Машко оро',
        'Соборно оро',
    ];

    const onInputChange = (event) => {
        const { target: { name, value, type, checked } } = event;
        setState(prevState => ({ 
            ...prevState, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const onFileChange = (event) => {
        const { target: { name, files } } = event;
        setState(prevState => ({ 
            ...prevState, 
            [name]: files[0] || null 
        }));
    };

    const createPrispevek = async () => {
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            
            // Add all form fields to FormData
            Object.keys(state).forEach(key => {
                if (state[key] !== null && state[key] !== '') {
                    if (key === 'slika' || key === 'posnetek' || key === 'dokument') {
                        if (state[key]) {
                            formData.append(key, state[key]);
                        }
                    } else {
                        formData.append(key, state[key]);
                    }
                }
            });

            const response = await api.post('/prispevki', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setMessage('✅ Прispevокот е успешно додаден!');
                // Reset form after successful submission
                setState(initialState);
                // Reset file inputs
                const fileInputs = document.querySelectorAll('input[type="file"]');
                fileInputs.forEach(input => input.value = '');
                
                // Navigate to success page after 2 seconds
                setTimeout(() => {
                    navigate('/prispevki');
                }, 2000);
            }
        } catch (err) {
            console.error('Грешка при додавање на прispevok:', err);
            setMessage(`❌ Грешка: ${err.response?.data?.msg || 'Не можев да го додадам прispevокот'}`);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return state.ime_plesa && 
               state.tip_plesa && 
               state.kratka_zgodovina && 
               state.opis_tehnike && 
               state.besedilo_opis && 
               state.regija;
    };

    return (
        <div className='create-prispevek'>
            <div className='prispevek-container'>
                <div className='prispevek-header'>
                    <h1>🏛️ Додај нов прispevок за македонски фолклор</h1>
                    <p>Споделете ја вашата љубов кон македонската традиција</p>
                </div>

                <div className='prispevek-form'>
                    {/* Име на плесот */}
                    <div className='form-group'>
                        <label htmlFor="ime_plesa">
                            🎭 Име на плесот/традицијата *
                        </label>
                        <input 
                            id="ime_plesa"
                            name="ime_plesa"
                            type='text' 
                            placeholder='на пр. Тешкото' 
                            value={state.ime_plesa}
                            onChange={onInputChange}
                            required
                        />
                    </div>

                    {/* Тип на плес */}
                    <div className='form-group'>
                        <label htmlFor="tip_plesa">
                            🎪 Тип на плес/традиција *
                        </label>
                        <select
                            id="tip_plesa"
                            name="tip_plesa"
                            value={state.tip_plesa}
                            onChange={onInputChange}
                            required
                        >
                            <option value="">Изберете тип</option>
                            {tipoviPlesa.map(tip => (
                                <option key={tip} value={tip}>{tip}</option>
                            ))}
                        </select>
                    </div>

                    {/* Регија */}
                    <div className='form-group'>
                        <label htmlFor="regija">
                            🗺️ Регија *
                        </label>
                        <select
                            id="regija"
                            name="regija"
                            value={state.regija}
                            onChange={onInputChange}
                            required
                        >
                            <option value="">Изберете регија</option>
                            {regije.map(regija => (
                                <option key={regija} value={regija}>{regija}</option>
                            ))}
                        </select>
                    </div>

                    {/* Кратка историја */}
                    <div className='form-group'>
                        <label htmlFor="kratka_zgodovina">
                            📜 Кратка историја *
                        </label>
                        <textarea 
                            id="kratka_zgodovina"
                            name="kratka_zgodovina"
                            placeholder='Опишете го потеклото и историјата на оваа традиција...'
                            value={state.kratka_zgodovina}
                            onChange={onInputChange}
                            rows="4"
                            required
                        />
                    </div>

                    {/* Опис на техника */}
                    <div className='form-group'>
                        <label htmlFor="opis_tehnike">
                            💃 Опис на техника *
                        </label>
                        <textarea 
                            id="opis_tehnike"
                            name="opis_tehnike"
                            placeholder='Опишете ги чекорите, движењата и техниките...'
                            value={state.opis_tehnike}
                            onChange={onInputChange}
                            rows="4"
                            required
                        />
                    </div>

                    {/* Детален опис */}
                    <div className='form-group'>
                        <label htmlFor="besedilo_opis">
                            📝 Детален опис *
                        </label>
                        <textarea 
                            id="besedilo_opis"
                            name="besedilo_opis"
                            placeholder='Додајте детален опис, значење, кога се игра, специјални прилики...'
                            value={state.besedilo_opis}
                            onChange={onInputChange}
                            rows="6"
                            required
                        />
                    </div>

                    {/* File uploads */}
                    <div className="file-upload-section">
                        <h3>📎 Додатни материјали</h3>
                        
                        {/* Слика */}
                        <div className='form-group'>
                            <label htmlFor="slika">
                                🖼️ Слика
                            </label>
                            <input
                                id="slika"
                                name="slika"
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="file-input"
                            />
                            <small>Поддржани формати: JPG, PNG, GIF (макс. 5MB)</small>
                        </div>

                        {/* Поснеток */}
                        <div className='form-group'>
                            <label htmlFor="posnetek">
                                🎥 Видео поснеток
                            </label>
                            <input
                                id="posnetek"
                                name="posnetek"
                                type="file"
                                accept="video/*"
                                onChange={onFileChange}
                                className="file-input"
                            />
                            <small>Поддржани формати: MP4, AVI, MOV (макс. 50MB)</small>
                        </div>

                        {/* Документ */}
                        <div className='form-group'>
                            <label htmlFor="dokument">
                                📄 Документ
                            </label>
                            <input
                                id="dokument"
                                name="dokument"
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={onFileChange}
                                className="file-input"
                            />
                            <small>Поддржани формати: PDF, DOC, DOCX, TXT (макс. 10MB)</small>
                        </div>
                    </div>

                    {/* Анонимност */}
                    <div className='form-group checkbox-group'>
                        <label className="checkbox-label">
                            <input
                                name="je_anonimen"
                                type="checkbox"
                                checked={state.je_anonimen}
                                onChange={onInputChange}
                            />
                            <span className="checkmark"></span>
                            🕶️ Сакам овој прispevок да биде анонимен
                        </label>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Submit button */}
                    <div className="form-actions">
                        <button 
                            onClick={createPrispevek}
                            className="submit-btn"
                            disabled={loading || !isFormValid()}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Се додава...
                                </>
                            ) : (
                                <>
                                    🎭 Додај прispevок
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Prispevek;