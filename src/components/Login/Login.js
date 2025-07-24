import './Login.css';

export default function Login(props) {
    return(
        <div className="login-container">
            {/* Macedonian folklore floating elements */}
            <div className="floating-element">�</div>
            <div className="floating-element">⛰️</div>
            <div className="floating-element">🌾</div>
            
            <div className="login-card">
                <h2 className="login-title">Добредојдовте</h2>
                <div className="login-form">
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="Корисничко име" 
                            className="login-input"
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            placeholder="Лозинка" 
                            className="login-input"
                        />
                    </div>
                    <button 
                        onClick={props.onLogin}
                        className="login-button"
                    >
                        Најави се
                    </button>
                </div>
            </div>
        </div>
    )
}