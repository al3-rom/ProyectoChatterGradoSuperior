import { useEffect, useState } from "react";
import AddBio from "../components/AddBio";
import EditBio from "../components/EditBio";
import DeleteBio from "../components/DeleteBio";
import ListBios from "../components/ListBios";
import { useSearchParams } from "react-router";

export default function Bios() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [reload, setReload] = useState(false);
  const [selectedBio, setSelectedBio] = useState(null);
  const [isSelected, setIsSelected] = useState('all');


  // Сохраняем input при изменении URL
  useEffect(() => {
    setInputValue(searchParams.get("q") || "");
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Debounce: обновляем searchQuery и URL через 500мс после последнего ввода
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);

      if (inputValue) {
        setSearchParams({ q: inputValue });
      } else {
        setSearchParams({});
      }
    }, 500); // задержка 500мс

    return () => clearTimeout(handler); // очистка таймера при новом вводе
  }, [inputValue, setSearchParams]);

  const handleCreated = () => {
    setReload(prev => !prev);
  };

  return (
    <div className="container my-5 d-flex flex-column gap-3">
      <section className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0">Bios</h2>
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#addBioModal"
          >
            Crear bio
          </button>
        </div>

        <div className="d-flex">
          <div className="input-group">
            <input
              name="search"
              className="form-control focus-ring focus-ring-primary"
              type="search"
              placeholder="Buscar una bio.."
              aria-label="Buscar"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              className="btn btn-outline-primary"
              onClick={() => setSearchQuery(inputValue)}
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      <AddBio onCreated={handleCreated} />

      <EditBio bio={selectedBio} onUpdated={handleCreated} />
      <DeleteBio
        bio={selectedBio}
        bioId={selectedBio?._id}
        onDeleted={() => {
          setReload(prev => !prev);
          setSelectedBio(null);
        }}
      />

      <div className="btn-group w-100">
        <button
          className={`btn btn-${isSelected === "all" ? "primary" : "outline-primary"}`}
          onClick={() => setIsSelected("all")}
        >
          Todos
        </button>

        <button
          className={`btn btn-${isSelected === "personal" ? "primary" : "outline-primary"}`}
          onClick={() => setIsSelected("personal")}
        >
          Personales
        </button>
      </div>

      <ListBios
      searchQuery={searchQuery}
      key={reload}
      setSelectedBio={setSelectedBio}
      personalOnly={isSelected === "personal"} />

    </div>
  );
}
