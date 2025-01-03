import "../components-css/LoginForm.css";
import { ChangeEvent, FormEvent, useState } from "react";
import logo from "../assets/mintLogo1.svg";

function LoginForm() {
    const [details, setDetails] = useState({
        email_username: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8081/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(details),
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem("token", data.token);
                console.log(data.userId, data.token);
                forward(data.userId);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    function forward(userId: string) {
        window.location.href = "http://localhost:5173/";
    }

    return (
        <div id="body">
            <div>
                <img src={logo} alt="" id="loginLogo" />
            </div>
            <div className="container">
                <div className="header">
                    <div className="text">Login</div>
                    <div className="underline"></div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="inputs" onSubmit={handleSubmit}>
                    <div className="input">
                        <input
                            type="text"
                            placeholder="Email / Username"
                            name="email_username"
                            value={details.email_username}
                            onChange={handleCheck}
                            required
                        />
                    </div>

                    <div className="input">
                        <input
                            placeholder="Password"
                            type="password"
                            name="password"
                            value={details.password}
                            onChange={handleCheck}
                            required
                        />
                    </div>
                    <div className="submit-container">
                        <button type="submit" className="submit">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
