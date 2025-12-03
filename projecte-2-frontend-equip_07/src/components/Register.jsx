import { useState } from "react";
import { useTagInput } from "../utils/tags";

const emptyForm = {
    name: "",
    surname: "",
    birthDate: "",
    description: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
};

export default function Register() {
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const {
        tags: languages,
        inputValue: langInput,
        removeTag: removeLanguage,
        handleInputChange: handleLangInputChange,
        handleInputKeyDown: handleLangKeyDown
    } = useTagInput([]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            setFormData(prev => ({ ...prev, avatar: files[0] || null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
        if (!formData.surname.trim()) newErrors.surname = "El apellido es obligatorio";
        if (!formData.email.trim()) newErrors.email = "El email es obligatorio";
        if (!formData.password) newErrors.password = "La contraseña es obligatoria";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Email no válido";

        if (formData.password && formData.password.length < 6)
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";

        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Las contraseñas no coinciden";

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const data = new FormData();
        data.append("nom", formData.name);
        data.append("cognoms", formData.surname);
        data.append("dataNaixement", formData.birthDate);
        data.append("descripcio", formData.description);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("idiomes", JSON.stringify(languages));
        if (formData.avatar) data.append("avatar", formData.avatar);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: "POST",
            body: data,
        });
        const result = await response.json();
        console.log(result);
    };


    return (
        <div className="container border rounded p-4" style={{ maxWidth: "500px" }}>
            <h2 className="mb-4 text-center">Regístrate</h2>

            <form onSubmit={handleSubmit}>


                {/* NOMBRE */}
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        onChange={handleChange}
                        value={formData.name}
                    />
                    {errors.name && <div className="text-danger">{errors.name}</div>}
                </div>

                {/* APELLIDO */}
                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input
                        type="text"
                        className="form-control"
                        name="surname"
                        onChange={handleChange}
                        value={formData.surname}
                    />
                    {errors.surname && <div className="text-danger">{errors.surname}</div>}
                </div>

                {/* FECHA */}
                <div className="mb-3">
                    <label className="form-label">Fecha de nacimiento</label>
                    <input
                        type="date"
                        className="form-control"
                        name="birthDate"
                        onChange={handleChange}
                        value={formData.birthDate}
                    />
                </div>

                {/* DESCRIPCION */}
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        name="description"
                        rows="3"
                        onChange={handleChange}
                        value={formData.description}
                    ></textarea>
                </div>

                {/* EMAIL */}
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        onChange={handleChange}
                        value={formData.email}
                    />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                </div>

                {/* PASSWORD */}
                <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        onChange={handleChange}
                        value={formData.password}
                    />
                    {errors.password && <div className="text-danger">{errors.password}</div>}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-3">
                    <label className="form-label">Confirmación de contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        onChange={handleChange}
                        value={formData.confirmPassword}
                    />
                    {errors.confirmPassword && (
                        <div className="text-danger">{errors.confirmPassword}</div>
                    )}
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

                {/* Avatar */ }
                <div className="mb-3">
                    <label htmlFor="avatar" className="form-label">Avatar (opcional)</label>
                    <input type="file" className="form-control" id="avatar" name="avatar" accept="image/jpeg" onChange={handleChange} />
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-4">Registrar</button>
            </form >
        </div >
    );
}