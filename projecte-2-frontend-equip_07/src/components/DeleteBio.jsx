import { useContext } from "react";
import { UserAuth } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";

export default function DeleteBio({ bio, bioId, onDeleted }) {
    const { token } = useContext(UserAuth);
    const { addToast } = useToast();

    const id = bioId || bio?._id;

    const handleDelete = async () => {
        if (!id) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bios/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Some APIs return 204 No Content for successful DELETE
            if (response.status === 204 || response.ok) {
                addToast("Bio eliminada correctamente", "success");
                if (onDeleted) onDeleted();
                return;
            }

            // Try to parse JSON body for error details
            let result = {};
            try {
                result = await response.json();
            } catch {
                // ignore JSON parse errors
            }

            const message = result?.message || `Error al eliminar bio (status ${response.status})`;
            throw new Error(message);
        } catch (err) {
            addToast(err.message || "Error al eliminar bio", "error");
        }
    };

    return (
        <section>
            <div
                className="modal fade"
                id="deleteBioModal"
                tabIndex="-1"
                aria-labelledby="deleteBioModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="deleteBioModalLabel">
                                Eliminar bio
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            ¿Estás seguro de que quieres eliminar esta bio? Esta acción no se puede deshacer.
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                                data-bs-dismiss="modal"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
