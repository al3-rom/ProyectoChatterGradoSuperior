import { useContext, useState, useRef, useEffect } from "react";
import { UserAuth, UserInfo } from "../providers/AuthProvider";
import { useTagInput } from "../utils/tags";
import { useToast } from "../providers/ToastProvider";

export default function EditBio({ bio, onUpdated }) {
    const { token } = useContext(UserAuth);
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        URL: "",
        tags: [],
        image: null,
    });
    const [errors, setErrors] = useState({});

    const {
        tags,
        inputValue: tagInput,
        removeTag,
        handleInputChange: handleTagInputChange,
        handleInputKeyDown: handleTagKeyDown,
        setTags
    } = useTagInput([]);

    const initialDataRef = useRef(null);

    useEffect(() => {
        if (!bio) return;

        const initialData = {
            title: bio.title || "",
            URL: bio.url || "",
            image: null
        };

        setFormData(initialData);

        let parsedTags = [];

        if (bio.tags) {
            if (Array.isArray(bio.tags)) {
                // массив из одного JSON
                if (
                    bio.tags.length === 1 &&
                    typeof bio.tags[0] === "string" &&
                    bio.tags[0].trim().startsWith("[")
                ) {
                    try {
                        parsedTags = JSON.parse(bio.tags[0]);
                    } catch {
                        parsedTags = [];
                    }
                } else {
                    // нормальный массив строк
                    parsedTags = bio.tags.map(t => String(t));
                }
            } else if (typeof bio.tags === "string") {
                // одинарная строка
                try {
                    parsedTags = JSON.parse(bio.tags);
                } catch {
                    parsedTags = bio.tags.split(",").map(t => t.trim()).filter(Boolean);
                }
            }
        }

        setTags(parsedTags);

        initialDataRef.current = { ...initialData, tags: parsedTags };
    }, [bio, setTags]);


    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setFormData(prev => ({ ...prev, image: files[0] || null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "El titulo es obligatorio";
        if (!formData.URL.trim()) newErrors.URL = "La URL es obligatoria";

        const URLRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
        if (formData.URL && !URLRegex.test(formData.URL)) newErrors.URL = "URL no válido";

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            addToast("Por favor, corrige los errores del formulario", "error");
            return;
        }

        try {
            const data = {
                title: formData.title,
                url: formData.URL,
                tags
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/bios/${bio._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!result.success) throw new Error(result.message || "Error al modificar bio");

            addToast("Bio modificada correctamente", "success");

            if (formData.image) {
                const imageData = new FormData();
                imageData.append("image", formData.image);

                const imgResp = await fetch(`${import.meta.env.VITE_API_URL}/bios/${bio._id}/photos`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: imageData
                });

                const imgResult = await imgResp.json();
                if (!imgResult.success) throw new Error(imgResult.message || "Error al subir imagen");
            }
            // close bootstrap modal programmatically (if bootstrap is available)
            try {
                const modalEl = document.getElementById("updateBioModal");
                if (modalEl) {
                    // Prefer Bootstrap's getOrCreateInstance when available
                    if (window.bootstrap && window.bootstrap.Modal) {
                        const Modal = window.bootstrap.Modal;
                        const modalInst = (Modal.getOrCreateInstance && Modal.getOrCreateInstance(modalEl)) || Modal.getInstance(modalEl) || new Modal(modalEl);
                        modalInst.hide();
                    } else {
                        // fallback: click any element that dismisses the modal
                        const btn = modalEl.querySelector('[data-bs-dismiss="modal"]');
                        if (btn) btn.click();
                        else {
                            // last resort: remove modal classes/backdrop
                            modalEl.classList.remove('show');
                            modalEl.style.display = 'none';
                            const backdrop = document.querySelector('.modal-backdrop');
                            if (backdrop) backdrop.remove();
                        }
                    }
                }
            } catch {
                // ignore modal hiding errors
            }

            if (onUpdated) onUpdated();

        } catch (err) {
            addToast(err.message || "Error al modificar bio", "error");
        }
    };
    return (
        <section>
            <div className="modal fade" id="updateBioModal" tabIndex="-1" aria-labelledby="updateBioModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="updateBioModalLabel">Modificar bio</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form id="updateBioForm" onSubmit={handleSubmit}>
                                {/* Titulo */}
                                <div className="mb-3">
                                    <label className="form-label">Titulo</label>
                                    <input
                                        type="text"
                                        className="form-control focus-ring focus-ring-primary"
                                        name="title"
                                        onChange={handleChange}
                                        value={formData.title}
                                    />
                                    {errors.title && <div className="text-danger">{errors.title}</div>}
                                </div>

                                {/* URL */}
                                <div className="mb-3">
                                    <label className="form-label">URL</label>
                                    <input
                                        type="text"
                                        className="form-control focus-ring focus-ring-primary"
                                        name="URL"
                                        onChange={handleChange}
                                        value={formData.URL}
                                    />
                                    {errors.URL && <div className="text-danger">{errors.URL}</div>}
                                </div>

                                {/* Tags */}
                                <div className="mb-3">
                                    <label className="form-label">Tags (opcional)</label>
                                    <input
                                        type="text"
                                        className="form-control focus-ring focus-ring-primary"
                                        placeholder="Escribe un tag y pulsa coma o Enter"
                                        value={tagInput}
                                        onChange={handleTagInputChange}
                                        onKeyDown={handleTagKeyDown}
                                    />
                                    <div className="mt-2 d-flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <span key={index} className="badge bg-primary p-2">
                                                #{tag}
                                                <button
                                                    type="button"
                                                    className="ms-2 btn-close btn-close-white"
                                                    style={{ transform: "scale(0.7)" }}
                                                    onClick={() => removeTag(tag)}
                                                ></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Image */}
                                <div className="mb-3">
                                    <label htmlFor="image" className="form-label">Foto (opcional)</label>
                                    <input type="file"
                                        className="form-control focus-ring focus-ring-primary"
                                        id="image"
                                        name="image"
                                        accept="image/jpeg"
                                        onChange={handleChange}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" form="updateBioForm" className="btn btn-primary">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}