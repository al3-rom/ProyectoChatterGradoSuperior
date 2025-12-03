import { useState, useEffect, useContext, useRef } from "react";
import { UserInfo, UserAuth } from "../providers/AuthProvider";
import { fetchUserData } from "../utils/fetchUserData";
import { useToast } from "../providers/ToastProvider";
import { useTagInput } from "../utils/tags";

export default function EditProfile() {
    const { userInfo, setUserInfo } = useContext(UserInfo);
    const { token } = useContext(UserAuth);
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        description: "",
        avatar: null,
        languages: [],
    });
    const [errors, setErrors] = useState({});

    const {
        tags: languages,
        inputValue: langInput,
        removeTag: removeLanguage,
        handleInputChange: handleLangInputChange,
        handleInputKeyDown: handleLangKeyDown,
        setTags: setLanguages
    } = useTagInput([]);


    const initialDataRef = useRef(null);

    /* Poner datos del usuario */
    useEffect(() => {
        if (!userInfo) return;

        const initialData = {
            name: userInfo.nom || "",
            surname: userInfo.cognoms || "",
            description: userInfo.descripcio || "",
            avatar: null
        };

        setFormData(initialData);

        const initialLanguages = Array.isArray(userInfo.idiomes)
            ? JSON.parse(userInfo.idiomes[0])
            : [];
        setLanguages(initialLanguages);

        initialDataRef.current = { ...initialData, languages: initialLanguages };
    }, [userInfo]);


    /* Controlar si hay cambios para llamar beforeunload */
    const isFormDirty = () => {
        if (!initialDataRef.current) return false;
        const current = { ...formData };
        const initial = { ...initialDataRef.current };

        if ((current.avatar && !initial.avatar) || (!current.avatar && initial.avatar)) return true;
        if (current.name !== initial.name) return true;
        if (current.surname !== initial.surname) return true;
        if (current.description !== initial.description) return true;
        if (JSON.stringify(languages) !== JSON.stringify(initial.languages)) return true;

        return false;
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isFormDirty()) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            setFormData((prev) => ({ ...prev, avatar: files[0] || null }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
        if (!formData.surname.trim()) newErrors.surname = "El apellido es obligatorio";
        if (!formData.description.trim()) newErrors.description = "La descripcion es obligatoria";
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

        const data = new FormData();
        data.append("nom", formData.name);
        data.append("cognoms", formData.surname);
        data.append("descripcio", formData.description);
        data.append("idiomes", JSON.stringify(languages));
        if (formData.avatar) data.append("avatar", formData.avatar);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            });

            const result = await response.json();

            if (!result.success) {
                addToast(result.message || "Error al guardar perfil", "error");
                return;
            }

            const updatedUser = await fetchUserData(token);
            setUserInfo(updatedUser);

            initialDataRef.current = { ...formData, avatar: null };

            addToast("Perfil actualizado correctamente", "success");
        } catch (err) {
            addToast(err.message || "Error al guardar perfil", "error");
        }
    };

    if (!userInfo) {
        return <div className="p-5 text-center">Cargando perfil...</div>;
    }

    return (
        <section className="container my-4 border rounded pt-2 pb-4" style={{ maxWidth: "600px" }}>
            <h1 className="mb-4 text-center">Editar perfil</h1>
            <form onSubmit={handleSubmit}>
                {/* Nombre */}
                <div className="mb-3">
                    <label className="form-label" htmlFor="name">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        onChange={handleChange}
                        value={formData.name}
                    />
                    {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                </div>

                {/* Apellido */}
                <div className="mb-3">
                    <label className="form-label" htmlFor="surname">Apellido</label>
                    <input
                        type="text"
                        className="form-control"
                        id="surname"
                        name="surname"
                        onChange={handleChange}
                        value={formData.surname}
                    />
                    {errors.surname && <div className="text-danger mt-1">{errors.surname}</div>}
                </div>

                {/* Descripción */}
                <div className="mb-3">
                    <label className="form-label" htmlFor="description">Descripción</label>
                    <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        onChange={handleChange}
                        value={formData.description}
                    ></textarea>
                    {errors.description && <div className="text-danger mt-1">{errors.description}</div>}
                </div>

                {/* Idiomas */}
                <div className="mb-3">
                    <label className="form-label">Idiomas</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Escribe un idioma y pulsa coma o Enter"
                        value={langInput}
                        onChange={handleLangInputChange}
                        onKeyDown={handleLangKeyDown}
                    />
                    <div className="mt-2 d-flex flex-wrap gap-2">
                        {languages.map((lang, index) => (
                            <span key={index} className="badge bg-primary p-2">
                                {lang}
                                <button
                                    type="button"
                                    className="ms-2 btn-close btn-close-white"
                                    style={{ transform: "scale(0.7)" }}
                                    onClick={() => removeLanguage(lang)}
                                ></button>
                            </span>
                        ))}
                    </div>
                </div>


                {/* Avatar */}
                <div className="mb-3">
                    <label className="form-label" htmlFor="avatar">Avatar (opcional)</label>
                    <input
                        type="file"
                        className="form-control"
                        id="avatar"
                        name="avatar"
                        accept="image/*"
                        onChange={handleChange}
                        aria-describedby="avatarHelp"
                    />
                    <div id="avatarHelp" className="form-text">
                        Si quieres añadir o cambiar tu avatar adjunta un fichero
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-4">
                    Guardar cambios
                </button>
            </form>
        </section>
    );
}
