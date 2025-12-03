import { useContext, useEffect, useState } from "react";
import { UserAuth } from "../providers/AuthProvider";
import { getBioImageUrl } from "../utils/bioImage";
import { Link } from "react-router";

export default function UserKisses({ user }) {
    const { token } = useContext(UserAuth);
    const ruta_api = import.meta.env.VITE_API_URL;

    const [kisses, setKisses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user._id) {
            setKisses([]);
            setLoading(false);
            setError(null);
            return;
        }

        const controller = new AbortController();

        const fetchKisses = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${ruta_api}/users/${user._id}/kisses`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });

                const data = await res.json();
                if (data.success) {
                    setKisses(data.data.kisses || []);
                } else {
                    setKisses([]);
                    setError(data.message || "Error fetching user's kisses");
                }
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message || "Error fetching user's kisses");
            } finally {
                setLoading(false);
            }
        };

        fetchKisses();
        return () => controller.abort();
    }, [user._id, token, ruta_api]);

    return (
        <section>
            <div
                className="modal fade"
                id="viewUserKissesModal"
                tabIndex="-1"
                aria-labelledby="viewUserKissesModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-scrollable modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="viewUserKissesModalLabel">
                                Bios que han gustado a {`${user.nom} ${user.cognoms}`}
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {loading && (
                                <div className="d-flex justify-content-center py-3">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            {!loading && !error && kisses.length === 0 && (
                                <p className="text-secondary text-center">Este usuario aun no tiene likes/kisses.</p>
                            )}

                            {!loading && kisses.length > 0 && (
                                <div className="row g-3">
                                    {kisses.map((k) => {
                                        const bio = k.bioId;
                                        if (!bio) return null;
                                        return (
                                            <div key={k._id} className="col-12 col-md-6">
                                                <div className="card h-100 shadow-sm border-0">
                                                    <Link to={`/bios/${bio._id}`} className="text-decoration-none">
                                                        <img
                                                            src={getBioImageUrl(bio.image, bio.title)}
                                                            alt={bio.title}
                                                            className="card-img-top"
                                                            style={{ objectFit: "cover", height: 180 }}
                                                            loading="lazy"
                                                        />
                                                    </Link>
                                                    <div className="card-body d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <h6 className="m-0">
                                                                <Link to={`/bios/${bio._id}`} className="text-decoration-none text-dark">{bio.title}</Link>
                                                            </h6>
                                                            <div className="badge bg-primary">{bio.tags?.slice(0,3).map(t => `#${t}`).join(' ')}</div>
                                                        </div>
                                                        <div className="text-muted small">{new Date(k.createdAt).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}