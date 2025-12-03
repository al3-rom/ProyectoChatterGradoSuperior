import { UserInfo } from "../providers/AuthProvider";
import { useContext } from "react";
import { getAvatarUrl } from "../utils/avatar";
import { Link } from "react-router";

export default function Profile() {
    const { userInfo } = useContext(UserInfo);

    if (!userInfo) {
        return <div className="p-5 text-center">Cargando perfil...</div>;
    }

    const { _id, nom, cognoms, email, dataNaixement, descripcio } = userInfo;
    const languages = JSON.parse(userInfo.idiomes?.[0] || "[]");
    const avatarUrl = getAvatarUrl(userInfo);

    return (
        <div className="container my-5">
            <section className="card shadow-sm p-4">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="m-0">Mi perfil</h2>

                    <div className="d-flex gap-2">
                        <Link to="/profile/edit" className="btn btn-primary btn-sm">
                            Editar perfil
                        </Link>
                        <Link to="/profile/password" className="btn btn-outline-secondary btn-sm">
                            Cambiar contraseña
                        </Link>
                    </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                    <img
                        src={avatarUrl}
                        alt={`${nom} ${cognoms}`}
                        className="rounded-circle me-3 border"
                        width={110}
                        height={110}
                        style={{ objectFit: "cover" }}
                    />
                    <div>
                        <h3 className="m-0">{nom} {cognoms}</h3>
                        <small className="text-muted">ID: {_id}</small>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <h6 className="text-uppercase text-muted mb-1">Email</h6>
                        <p className="fw-semibold">{email}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                        <h6 className="text-uppercase text-muted mb-1">Fecha de nacimiento</h6>
                        <p className="fw-semibold">
                            {new Date(dataNaixement).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="col-md-6 mb-3">
                        <h6 className="text-uppercase text-muted mb-1">Idiomas</h6>
                        <p className="fw-semibold">{languages.join(", ")}</p>
                    </div>

                    <div className="col-md-12 mb-3">
                        <h6 className="text-uppercase text-muted mb-1">Descripción</h6>
                        <p className="fw-semibold">{descripcio || "—"}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
