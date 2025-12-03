import { useContext, useEffect, useState } from "react";
import { UserAuth } from "../providers/AuthProvider";
import { getAvatarUrl } from "../utils/avatar";
import { Link } from "react-router";

export default function BioKisses({ bio }) {
    const { token } = useContext(UserAuth);
    const ruta_api = import.meta.env.VITE_API_URL;

    const [kisses, setKisses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!bio) {
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
                const res = await fetch(`${ruta_api}/bios/${bio._id}/kisses`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });

                const data = await res.json();
                if (data.success) {
                    setKisses(data.data.kisses || []);
                } else {
                    setKisses([]);
                    setError(data.message || "Error fetching kisses");
                }
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message || "Error fetching kisses");
            } finally {
                setLoading(false);
            }
        };

        fetchKisses();
        return () => controller.abort();
    }, [bio, token, ruta_api]);

    return (
        <section>
            <div
                className="modal fade"
                id="viewBioKissesModal"
                tabIndex="-1"
                aria-labelledby="viewBioKissesModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="viewBioKissesModalLabel">
                                Likes/Kisses
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
                                <p className="text-secondary text-center">No hay likes/kisses aun.</p>
                            )}

                            {!loading && kisses.length > 0 && (
                                <ul className="list-group">
                                    {kisses.map((k) => {
                                        const author = k.author || {};
                                        const avatarUrl = getAvatarUrl(author);
                                        return (
                                            <li key={k._id} className="list-group-item d-flex align-items-center gap-3">
                                                <img
                                                    src={avatarUrl}
                                                    alt={`${author.nom || ""} avatar`}
                                                    className="rounded-circle"
                                                    style={{ width: 48, height: 48, objectFit: "cover" }}
                                                />
                                                <div className="flex-grow-1">
                                                    <div>
                                                        <Link to={`/users/${author._id}`} className="text-decoration-none">
                                                            <strong>{(author.nom || "") + (author.cognoms ? " " + author.cognoms : "")}</strong>
                                                        </Link>
                                                    </div>
                                                    <div className="text-muted small">{author.email}</div>
                                                </div>
                                                <div className="text-muted small">{new Date(k.createdAt).toLocaleString()}</div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}