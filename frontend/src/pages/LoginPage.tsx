import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { SpinnerButton } from "../components";
import showPasswordImage from "../assets/icons/password-show.png";
import hidePasswordImage from "../assets/icons/password-hide.png";
import "./LoginPage.css";

function LoginPage() {
    const { authenticate, errorMessage } = useAuth();
    const navigate = useNavigate();
    const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const passwordIcon: string = isPasswordShown
        ? showPasswordImage
        : hidePasswordImage;

    const handlePasswordShow = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsPasswordShown(!isPasswordShown);
    };

    const handleLogin = async () => {
        const isAuthenticated = await authenticate(username, password);
        if (isAuthenticated) {
            navigate("/");
        }
    };

    return (
        <div className="page">
            <div className="login-panel">
                <h1>Login</h1>
                <form>
                    <input
                        type="text"
                        placeholder="Username"
                        maxLength={32}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <div id="password-input">
                        <input
                            type={isPasswordShown ? "text" : "password"}
                            placeholder="Password"
                            maxLength={32}
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                        <button onClick={handlePasswordShow}>
                            <img
                                src={passwordIcon}
                                alt={isPasswordShown ? "show" : "hide"}
                            />
                        </button>
                    </div>
                    <p className="password-error">{errorMessage}</p>
                    <SpinnerButton
                        id="login-button"
                        onClick={handleLogin}
                        spinnerColor="#808080"
                        spinnerSize={20}
                        speedMultiplier={0.6}
                    >
                        Login
                    </SpinnerButton>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
