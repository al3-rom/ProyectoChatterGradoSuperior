import { useContext, useEffect, useState } from "react";
import { UserAuth, UserInfo } from "../providers/AuthProvider";
import { getBioImageUrl } from "../utils/bioImage";
import { Link } from "react-router";

export default function ListBios({ searchQuery, setSelectedBio, personalOnly = false }) {
    const { token } = useContext(UserAuth);
    const { userInfo } = useContext(UserInfo);

    const [bios, setBios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [liked, setLiked] = useState({});

    const getBios = async () => {
        setLoading(true);
        const url = new URL(`${import.meta.env.VITE_API_URL}/bios${personalOnly ? '/personal' : ''}`);
        url.searchParams.append("page", page);
        url.searchParams.append("limit", limit);
        if (searchQuery) url.searchParams.append("q", searchQuery);

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const response = await res.json();

        if (response.success) {
            setBios(response.data.results);
            setTotalPages(Math.ceil(response.data.total / limit));

            // Mostrar si tiene kiss
            const likedState = {};
            for (let bio of response.data.results) {
                likedState[bio._id] = !!bio.liked;
            }
            setLiked(likedState);
        } else {
            setBios([]);
        }

        setLoading(false);
    };

    useEffect(() => { setPage(1); }, [searchQuery]);
    useEffect(() => { getBios(); }, [searchQuery, page, personalOnly]);

    const nextPage = () => page < totalPages && setPage(p => p + 1);
    const prevPage = () => page > 1 && setPage(p => p - 1);

    // Kiss / Like
    const kiss = async (bioId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/bios/${bioId}/kisses`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const response = await res.json();

            if (response.success) {
                setLiked(prev => ({ ...prev, [bioId]: !prev[bioId] }));
            } else {
                console.error(response.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="py-3">
            {loading && (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-grow text-primary" role="status"></div>
                </div>
            )}

            {!loading && bios.length === 0 && (
                <p className="text-secondary text-center">
                    {personalOnly ? "No se encontraron bios personales." : "No se encontraron bios."}
                </p>
            )}

            <div className="row g-3">
                {bios.map(bio => (
                    <div key={bio._id} className="col-12 col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0 overflow-hidden position-relative">

                            {userInfo.email === bio.author.email && (
                                <div className="dropdown position-absolute" style={{ top: "10px", right: "10px", zIndex: 10 }}>
                                    <button className="btn btn-outline-primary btn-sm rounded-circle shadow" data-bs-toggle="dropdown">
                                        <i className="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <button className="dropdown-item" onClick={() => setSelectedBio(bio)} data-bs-toggle="modal" data-bs-target="#updateBioModal">Editar</button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item text-danger" onClick={() => setSelectedBio(bio)} data-bs-toggle="modal" data-bs-target="#deleteBioModal">Eliminar</button>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><button className="dropdown-item">Cancelar</button></li>
                                    </ul>
                                </div>
                            )}

                            <Link to={`/bios/${bio._id}`}>
                                <img
                                    src={getBioImageUrl(bio.image, bio.title)}
                                    alt={bio.title}
                                    className="card-img-top"
                                    style={{ objectFit: "cover", height: "200px" }}
                                    loading="lazy" />
                            </Link>

                            <div className="card-body d-flex flex-column justify-content-between">
                                <div className="text-truncate">
                                    <h5 className="card-title text-truncate mb-2">
                                        <Link to={`/bios/${bio._id}`} className="text-decoration-none text-dark">{bio.title}</Link>
                                    </h5>
                                    {bio.tags?.length > 0 && (
                                        <div className="d-flex flex-wrap gap-1 mt-2">
                                            {bio.tags.slice(0, 4).map((t, i) => <span key={i} className="badge bg-primary">#{t}</span>)}
                                            {bio.tags.length > 4 && <span className="badge bg-secondary">+{bio.tags.length - 4}</span>}
                                        </div>
                                    )}
                                </div>
                                <div className={`mt-3 d-flex ${userInfo.email !== bio.author.email ? "justify-content-between" : "justify-content-end"} align-items-center`}>
                                    {userInfo.email !== bio.author.email && (
                                        <button
                                            className="btn btn-light border btn-sm d-flex align-items-center gap-1"
                                            onClick={() => kiss(bio._id)}
                                            style={{ transition: "0.2s" }}
                                        >
                                            <i
                                                className={`bi ${liked[bio._id] ? "bi-heart-fill text-danger" : "bi-heart"}`}
                                                style={{
                                                    fontSize: "1.2rem",
                                                    transition: "0.2s",
                                                    transform: liked[bio._id] ? "scale(1.2)" : "scale(1)"
                                                }}
                                            ></i>
                                        </button>
                                    )}

                                    <Link
                                        to={bio.url}
                                        target="_blank"
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Abrir
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {!loading && totalPages > 1 && (
                <nav aria-label="Page navigation" className="mt-4">
                    <ul className="pagination justify-content-center gap-1">
                        <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={prevPage}><i className="bi bi-chevron-left"></i></button></li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                            <li key={p} className={`page-item ${p === page ? "active" : ""}`}><button className="page-link" onClick={() => setPage(p)}>{p}</button></li>
                        ))}
                        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={nextPage}><i className="bi bi-chevron-right"></i></button></li>
                    </ul>
                </nav>
            )}
        </section>
    );
}
