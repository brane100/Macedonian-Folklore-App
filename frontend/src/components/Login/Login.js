import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../contexts/AuthContext';

export default function Login(props) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
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

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            const response = await fetch('http://localhost:3001/uporabnik/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Check if login was actually successful
                if (data.success !== false && data.user) {
                    login(data.user); // Update auth state
                    navigate('/'); // Redirect to home page on successful login
                } else {
                    // Handle cases where response is ok but login failed
                    alert(data.message || 'Невалидни податоци за најавување');
                }
            } else {
                // Handle HTTP error responses
                try {
                    const errorData = await response.json();
                    console.error('Login failed:', errorData.message);
                    
                    // Provide specific error messages based on the response
                    if (response.status === 401) {
                        alert('Невалидна е-пошта или лозинка. Проверете ги вашите податоци.');
                    } else if (response.status === 404) {
                        const shouldRegister = window.confirm(
                            'Корисникот не е пронајден. Дали сакате да се регистрирате сега?'
                        );
                        if (shouldRegister) {
                            navigate('/registracija');
                            return;
                        }
                    } else if (response.status === 400) {
                        alert('Потребни се е-пошта и лозинка.');
                    } else {
                        alert(errorData.message || 'Грешка при најавување');
                    }
                } catch (parseError) {
                    // If response doesn't contain JSON
                    alert('Грешка при најавување. Обидете се повторно.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Мрежна грешка. Проверете ја вашата интернет врска и обидете се повторно.');
        } finally {
            setIsLoggingIn(false);
        }
    };


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
                                handleLogin()
                            }
                        }}
                        className="login-button"
                        disabled={validation || isLoggingIn}
                        style={{
                            opacity: validation || isLoggingIn ? 0.5 : 1,
                            cursor: validation || isLoggingIn ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoggingIn ? 'Се најавувам...' : 'Најави се'}
                    </button>
                </div>
                <Link to="/registracija">
                    Немаш сметка? Регистрирај се
                </Link>
            </div>
        </div>
    )
}