import { useContext, useEffect, useState } from "react";
import { UserAuth, UserInfo } from "../providers/AuthProvider";
import { getBioImageUrl } from "../utils/bioImage";
import { useParams, Link, useNavigate } from "react-router";
import EditBio from "../components/EditBio";
import DeleteBio from "../components/DeleteBio";
import BioKisses from "../components/BioKisses";

export default function Bio() {
    const { token } = useContext(UserAuth);
    const { userInfo } = useContext(UserInfo);
    const { id } = useParams();

    const [bio, setBio] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getBio = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/bios/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const response = await res.json();

            if (response.success) {
                setBio(response.data.bio);
            } else {
                setBio(null);
            }
        } catch (err) {
            console.error(err);
            setBio(null);
        }

        setLoading(false);
    };

    useEffect(() => {
        getBio();
    }, [id, token]);

    useEffect(() => {
        if (bio?.title) {
            document.title = `${bio.title} – Chatter`;
        }
    }, [bio]);


    if (loading)
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-grow text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );

    if (!bio)
        return (
            <p className="text-center text-secondary mt-5">
                No bio found.
            </p>
        );

    return (
        <section className="container my-5 d-flex flex-column gap-4">

            <div>
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(-1)}>
                    <i className="bi bi-chevron-left"></i> Volver
                </button>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden position-relative">

                <div className="dropdown position-absolute" style={{ top: "10px", right: "10px", zIndex: 10 }}>
                    <button className="btn btn-outline-primary btn-sm rounded-circle shadow" data-bs-toggle="dropdown">
                        <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                            <button className="dropdown-item" onClick={() => setSelectedBio(bio)} data-bs-toggle="modal" data-bs-target="#viewBioKissesModal">Ver likes</button>
                        </li>
                        {userInfo.email === bio.author.email && (
                            <>
                                <li>
                                    <button className="dropdown-item" onClick={() => setSelectedBio(bio)} data-bs-toggle="modal" data-bs-target="#updateBioModal">Editar</button>
                                </li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={() => setSelectedBio(bio)} data-bs-toggle="modal" data-bs-target="#deleteBioModal">Eliminar</button>
                                </li>
                            </>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item">Cancelar</button></li>
                    </ul>
                </div>

                <img
                    src={getBioImageUrl(bio.image, bio.title)}
                    alt={bio.title}
                    className="card-img-top"
                    style={{
                        objectFit: "cover",
                        minHeight: "280px",
                        maxHeight: "420px"
                    }}
                    loading="lazy"
                />

                <div className="card-body">

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                        <div>
                            <h2 className="mb-2">{bio.title}</h2>

                            {bio.tags?.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {bio.tags.slice(0, 6).map((t, i) => (
                                        <span key={i} className="badge bg-primary">
                                            #{t}
                                        </span>
                                    ))}
                                    {bio.tags.length > 6 && (
                                        <span className="badge bg-secondary">
                                            +{bio.tags.length - 6}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="ms-md-auto">
                            <Link
                                to={bio.url}
                                target="_blank"
                                className="btn btn-outline-primary btn-lg"
                            >
                                Abrir
                            </Link>
                        </div>

                    </div>

                    <EditBio bio={bio} onUpdated={getBio} />
                    <DeleteBio bio={bio} onDeleted={() => navigate('/bios')} />

                    <BioKisses bio={bio} />

                </div>

            </div>

        </section>
    );
}
