import { useState, useEffect, useContext, useRef } from "react";
import { UserInfo, UserAuth } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";

export default function UpdatePassword() {
    const { userInfo } = useContext(UserInfo);
    const { token } = useContext(UserAuth);
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [errors, setErrors] = useState({});

    const initialDataRef = useRef(formData);

    const isFormDirty = () => {
        if (!initialDataRef.current) return false;
        return (
            formData.currentPassword !== initialDataRef.current.currentPassword ||
            formData.newPassword !== initialDataRef.current.newPassword ||
            formData.confirmNewPassword !== initialDataRef.current.confirmNewPassword
        );
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
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.currentPassword.trim()) newErrors.currentPassword = "La contraseña actual es obligatoria";
        if (!formData.newPassword.trim()) newErrors.newPassword = "La nueva contraseña es obligatoria";
        if (!formData.confirmNewPassword.trim()) newErrors.confirmNewPassword = "La confirmación contraseña es obligatoria";
        if (formData.newPassword !== formData.confirmNewPassword) newErrors.confirmNewPassword = "Las contraseñas no coinciden";
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
            // Пример отправки данных
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPass: formData.currentPassword,
                    newPass: formData.newPassword,
                }),
            });

            const result = await response.json();
            if (!result.success) {
                addToast(result.message || "Error al guardar contraseña", "error");
                return;
            }

            initialDataRef.current = { ...formData };
            addToast("Contraseña actualizada correctamente", "success");
            setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        } catch (err) {
            addToast(err.message || "Error al guardar contraseña", "error");
        }
    };

    if (!userInfo) {
        return <div className="p-5 text-center">Cargando perfil...</div>;
    }

    return (
        <section className="container my-4 border rounded pt-2 pb-4" style={{ maxWidth: "600px" }}>
            <h1 className="mb-4 text-center">Cambiar contraseña</h1>
            <form onSubmit={handleSubmit}>
                {/* Contraseña actual */}
                <div className="mb-3">
                    <label htmlFor="currentPassword">Contraseña actual</label>
                    <input
                        type="password"
                        className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                    />
                    {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                </div>

                {/* Nueva contraseña */}
                <div className="mb-3">
                    <label htmlFor="newPassword">Nueva contraseña</label>
                    <input
                        type="password"
                        className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                    />
                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                </div>

                {/* Confirmación nueva contraseña */}
                <div className="mb-3">
                    <label htmlFor="confirmNewPassword">Confirmación de contraseña</label>
                    <input
                        type="password"
                        className={`form-control ${errors.confirmNewPassword ? "is-invalid" : ""}`}
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                    />
                    {errors.confirmNewPassword && <div className="invalid-feedback">{errors.confirmNewPassword}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-4">
                    Guardar cambios
                </button>
            </form>
        </section>
    );
}
