import { useContext, useState, useRef } from "react";
import { UserAuth } from "../providers/AuthProvider";
import { useTagInput } from "../utils/tags";
import { useToast } from "../providers/ToastProvider";

const emptyForm = {
  title: "",
  URL: "",
  image: null,
};

export default function AddBio({ onCreated }) {
  const { token } = useContext(UserAuth);
  const { addToast } = useToast();

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const {
    tags,
    inputValue: tagInput,
    removeTag,
    handleInputChange: handleTagInputChange,
    handleInputKeyDown: handleTagKeyDown,
    setTags
  } = useTagInput([]);

  const initialDataRef = useRef(emptyForm);

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
      const data = new FormData();
      data.append("title", formData.title);
      data.append("url", formData.URL);
      tags.forEach(tag => data.append("tags[]", tag));
      if (formData.image) data.append("image", formData.image);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bios`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        addToast("Bio creada correctamente", "success");

        // очистка формы
        setFormData(emptyForm);
        setErrors({});
        setTags([]);
        initialDataRef.current = emptyForm;

        // уведомляем родителя (ListBios) об обновлении
        if (onCreated) onCreated();
      } else {
        addToast(result.message || "Error al crear bio", "error");
      }
    } catch (err) {
      addToast(err.message || "Error al crear bio", "error");
    }
  };

  return (
    <section>
      <div className="modal fade" id="addBioModal" tabIndex="-1" aria-labelledby="addBioModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="addBioModalLabel">Crear bio</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="addBioForm" onSubmit={handleSubmit}>
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
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" form="addBioForm" className="btn btn-primary">Crear bio</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
