import React, { useState } from 'react';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    
    const [ime, setIme] = useState('');
    const [priimek, setPriimek] = useState('');
    const [email, setEmail] = useState('');
    const [geslo, setGeslo] = useState('');
    const [vloga, setVloga] = useState('navaden');
    const navigate = useNavigate();
    
    // Add validation state
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle email field blur (when user switches away from field)
    const handleEmailBlur = () => {
        if (email.trim() === '') {
            setEmailError('');
        } else if (!validateEmail(email)) {
            setEmailError('Невалиден формат на е-пошта');
        } else {
            setEmailError('');
        }
    };

    // Handle password field blur and real-time validation
    const handlePasswordChange = (value) => {
        setGeslo(value);
        if (value.length > 0 && value.length < 8) {
            setPasswordError('Лозинката мора да содржи најмалку 8 карактери');
        } else {
            setPasswordError('');
        }
    };

    const validation = emailError || passwordError || !ime.trim() || !priimek.trim() || !email.trim() || !geslo.trim()

    const createUser = async () => {
        try {
            const response = await fetch('http://localhost:3001/uporabnik/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ime,
                    priimek,
                    email,
                    geslo,
                    vloga
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                navigate('/prijava');
            } else {
                alert(data.message || 'Registration failed.');
                setIme('');
                setPriimek('');
                setEmail('');
                setGeslo('');
                setVloga('navaden');
            }
        } catch (error) {
            alert('An error occurred during registration.');
            console.error('Registration error:', error);
            setIme('');
            setPriimek('');
            setEmail('');
            setGeslo('');
            setVloga('navaden');
        }
    };

    return(
        <div className="register-container">
            {/* Macedonian folklore floating elements */}
            <div className="floating-element">🎵</div>
            <div className="floating-element">⛰️</div>
            <div className="floating-element">🌾</div>
            <div className="floating-element">🌻</div>
            <div className="floating-element">💃</div>
            <div className="floating-element">🕺</div>

            <div className="register-card">
                <h2 className="register-title">Регистрација</h2>
                <div className="register-form">
                    {/* Name fields side by side */}
                    <div className="name-row">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Име"
                                className="register-input"
                                value={ime}
                                onChange={e => setIme(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Презиме"
                                className="register-input"
                                value={priimek}
                                onChange={e => setPriimek(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Email field with validation */}
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Е-пошта"
                            className={`register-input ${emailError ? 'error' : ''}`}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onBlur={handleEmailBlur} // Validate when user leaves field
                            style={{
                                borderColor: emailError ? '#dc3545' : '#ffd700'
                            }}
                        />
                        {emailError && (
                            <div style={{
                                color: '#dc3545',
                                fontSize: '12px',
                                marginTop: '5px',
                                fontWeight: '500'
                            }}>
                                {emailError}
                            </div>
                        )}
                    </div>

                    {/* Password field with validation */}
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Лозинка"
                            className={`register-input ${passwordError ? 'error' : ''}`}
                            value={geslo}
                            onChange={e => handlePasswordChange(e.target.value)}
                            style={{
                                borderColor: passwordError ? '#dc3545' : '#ffd700'
                            }}
                        />
                        {passwordError && (
                            <div style={{
                                color: '#dc3545',
                                fontSize: '12px',
                                marginTop: '5px',
                                fontWeight: '500'
                            }}>
                                {passwordError}
                            </div>
                        )}
                        {/* Password strength indicator */}
                        {geslo.length > 0 && (
                            <div style={{
                                fontSize: '12px',
                                marginTop: '5px',
                                color: geslo.length >= 8 ? '#28a745' : '#ffc107'
                            }}>
                                {geslo.length >= 8 ? '✓ Добра јачина на лозинка' : `${8 - geslo.length} карактери преостануваат`}
                            </div>
                        )}
                    </div>

                    <button
                        className="register-button"
                        onClick={() => {
                            // Only proceed if no validation errors
                            if (!validation) {
                                createUser();
                            }
                        }}
                        disabled={ validation }
                        style={{
                            opacity: validation ? 0.6 : 1,
                            cursor: validation ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Регистрирај се
                    </button>
                </div>
                <Link to="/prijava"> Имаш сметка? Најави се </Link>
            </div>
        </div>
    );
}