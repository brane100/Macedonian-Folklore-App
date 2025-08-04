import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';


export default function Login(props) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

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

    const validation = emailError || password.trim() === '' || password.length < 8

    const login = async () => {
        try {
            const response = await fetch('http://localhost:3001/uporabnik/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (response.ok) {
                // const data = await response.json();
                navigate('/'); // Redirect to home page on successful login
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Грешка при најавување');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Грешка при најавување');
        }
    }


    return (
        <div className="login-container">
            {/* Macedonian folklore floating elements */}
            <div className="floating-element">💃</div>
            <div className="floating-element">🎶</div>
            <div className="floating-element">⛰️</div>
            <div className="floating-element">🌾</div>

            <div className="login-card">
                <h2 className="login-title">Добредојдовте</h2>
                <div className="login-form">
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Е-пошта"
                            className={`login-input ${emailError ? 'error' : ''}`}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onBlur={handleEmailBlur}
                            style={{
                                borderColor: emailError ? '#dc3545' : ''
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
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Лозинка"
                            className="login-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (!validation) {
                                // Proceed with login
                                login()
                            }
                        }}
                        className="login-button"
                        disabled={validation}
                        style={{
                            opacity: validation ? 0.5 : 1,
                            cursor: validation ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Најави се
                    </button>
                </div>
                <Link to="/registracija">Немаш сметка? Регистрирај се </Link>
            </div>
        </div >
    )
}