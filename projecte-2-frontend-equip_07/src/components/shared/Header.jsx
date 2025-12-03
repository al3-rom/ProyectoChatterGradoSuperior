import { Link, useLocation } from "react-router";
import { UserInfo } from "../../providers/AuthProvider";
import { useContext } from "react";
import { getAvatarUrl } from "../../utils/avatar";
import { Logout } from "../../utils/logout";

export default function Header() {
    const location = useLocation();
    const { userInfo } = useContext(UserInfo);

    if (!userInfo) {
        return <div className="p-5 text-center">Cargando perfil...</div>;
    }

    const { nom, cognoms } = userInfo;
    const avatarUrl = getAvatarUrl(userInfo);

    return (
        <header>
            <nav className="fixed-top navbar navbar-expand-lg bg-body-tertiary shadow-sm">
                <div className="container-fluid" style={{ paddingLeft: "4vw", paddingRight: "4vw" }}>
                    <Link to="/" className="navbar-brand fw-bold text-primary"><em><strong>Chatter</strong></em></Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarText"
                        aria-controls="navbarText"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarText">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                            <li className="nav-item">
                                <Link
                                    to="/dashboard"
                                    className={location.pathname === "/dashboard" ? "nav-link text-primary" : "nav-link"}
                                >
                                    Dashboard
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link
                                    to="/bios"
                                    className={location.pathname === "/bios" ? "nav-link text-primary" : "nav-link"}
                                >
                                    Bios
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link
                                    to="/chats"
                                    className={location.pathname === "/chats" ? "nav-link text-primary" : "nav-link"}
                                >
                                    Chats
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link
                                    to="/users"
                                    className={location.pathname === "/users" ? "nav-link text-primary" : "nav-link"}
                                >
                                    Usuarios
                                </Link>
                            </li>
                        </ul>

                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item dropdown d-flex align-items-center">
                                <Link to="/profile">
                                <img
                                    src={avatarUrl}
                                    alt={`${nom} ${cognoms}`}
                                    className="rounded-circle me-2"
                                    width={35}
                                    height={35}
                                    style={{ objectFit: "cover" }}
                                />
                                </Link>

                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Hola, {nom}!
                                </a>

                                <ul className="dropdown-menu dropdown-menu-end shadow">
                                    <li>
                                        <Link to="/profile" className="dropdown-item">
                                            Mi perfil
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/profile/edit" className="dropdown-item">
                                            Editar perfil
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/profile/password" className="dropdown-item">
                                            Cambiar contraseña
                                        </Link>
                                    </li>

                                    <li><hr className="dropdown-divider" /></li>

                                    <li>
                                        <button className="dropdown-item text-danger" onClick={Logout}>
                                            Salir
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
