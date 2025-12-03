import Register from "../components/Register";
import Login from "../components/Login";
import { useState, useEffect } from "react";

export default function AuthPage() {
    const [isSelected, setIsSelected] = useState(() => {
        return localStorage.getItem("authForm") || "login";
    });

    useEffect(() => {
        localStorage.setItem("authForm", isSelected);
    }, [isSelected]);


    return (
        <section
            className="p-4 rounded shadow"
            style={{
                maxWidth: 500,
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
        >
            <div className="btn-group w-100 mb-4">
                <button
                    className={`btn btn-${isSelected === "login" ? "primary" : "outline-primary"}`}
                    onClick={() => setIsSelected("login")}
                >
                    Entra
                </button>

                <button
                    className={`btn btn-${isSelected === "register" ? "primary" : "outline-primary"}`}
                    onClick={() => setIsSelected("register")}
                >
                    Registra
                </button>
            </div>

            {isSelected === "login" ? <Login /> : <Register />}
        </section>
    );
}
