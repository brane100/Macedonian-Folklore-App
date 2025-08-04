import React, { useState } from 'react';
import './Register.css';
import { Link } from 'react-router-dom';

export default function Register(props) {
    const [ime, setIme] = useState('');
    const [priimek, setPriimek] = useState('');
    const [email, setEmail] = useState('');
    const [geslo, setGeslo] = useState('');
    const [vloga, setVloga] = useState('navaden'); // Default role

    const createUser = async () => {
        try {
            const response = await fetch('http://localhost:3001/register', {
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
                props.history.push('/prijava');
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
            // Reset form fields on error
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
                    
                    {/* Email and password full width */}
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Е-пошта"
                            className="register-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Лозинка"
                            className="register-input"
                            value={geslo}
                            onChange={e => setGeslo(e.target.value)}
                        />
                    </div>
                    <button className="register-button" onClick={createUser}>
                        Регистрирај се
                    </button>
                </div>
                <Link to="/prijava">
                    Имаш сметка? Најави се
                </Link>
            </div>
        </div>
    );
}