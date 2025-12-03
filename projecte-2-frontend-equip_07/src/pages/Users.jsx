import { useContext, useEffect, useState } from "react";
import { UserAuth } from "../providers/AuthProvider";
import { useSearchParams } from "react-router";
import { Link } from "react-router";

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nombreMail, setNombreMail] = useState("");
  const ruta_api = import.meta.env.VITE_API_URL;
  const userNotFound =
    "No hemos podido encontrar usuario con estas credencias!";
  const [hasSearched, setHasSearched] = useState(false);
  const [resultado, setResultado] = useState(0);
  const [users, setUsers] = useState([]);
  const { token } = useContext(UserAuth);
  const [userInfo, setUserInfo] = useState([]);

  useEffect(() => {
    const listaUsers = async () => {
      try {
        const res = await fetch(`${ruta_api}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("AcessToken");
            setToken("");
            console.log("El token caduco");
            return;
          }
          throw new Error("Error al buscar usuario");
        }

        const data = await res.json();

        setUsers(data.data.users);
        setResultado(data.data.users.length);
      } catch (err) {
        console.error(err);
      }
    };

    listaUsers();
  }, []);

  useEffect(() => {
    const parsedUsers = users.map((user) => ({
      id: user._id,
      nombre: user.nom,
      email: user.email,
      idiomas: user.idiomes[0] ? JSON.parse(user.idiomes[0]) : "No hay idiomas",
    }));

    setUserInfo(parsedUsers);
    console.log(parsedUsers);
  }, [users]);

  const buscarUsuarios = async (e) => {
    e.preventDefault();
    setHasSearched(true);

    if (nombreMail) {
      setSearchParams({ q: nombreMail });
    } else {
      setSearchParams({});
    }

    try {
      const res = await fetch(`${ruta_api}/users?q=${nombreMail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("AcessToken");
          setToken("");
          console.log("El token caduco");
          return;
        }
        throw new Error("Error al buscar usuario");
      }

      const data = await res.json();
      setUsers(data.data.users);
      setResultado(data.data.users.length);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <section className="m-auto container mt-4">
        <div className="d-flex py-4 flex-column container p-0 ">
          <div className="d-flex justify-content-between align-items-center">
            <h1>Usuarios</h1>
            <p className="text-secondary px-2">{resultado} resultados</p>
          </div>

          <div className="input-group mt-2 mb-2">
            <form
              onSubmit={buscarUsuarios}
              className="gap-2 d-flex flex-row w-100"
            >
              <input
                type="text"
                className="form-control mb-2 focus-ring focus-ring-primary"
                placeholder="Buscar por nombre, email..."
                aria-label="Buscar por nombre, email..."
                aria-describedby="basic-addon2"
                value={nombreMail}
                onChange={(e) => setNombreMail(e.target.value)}
              />
              <div className="input-group-append">
                <button className="btn btn-outline-primary px-5" type="submit">
                  Buscar
                </button>
              </div>
            </form>
          </div>

          <table className="table table-hover table-striped table-sm">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Email</th>
                <th scope="col">Idiomas</th>
              </tr>
            </thead>

            {resultado > 0 ? (
              <tbody>
                {userInfo.map((user) => (
                  <tr key={user.id} className="shadow-sm rounded ">
                    <td className="p-2">{user.nombre}</td>
                    <td>{user.email}</td>

                    <td>
                      {Array.isArray(user.idiomas) && user.idiomas.length > 0
                        ? user.idiomas.join(", ")
                        : "No hay idiomas"}
                    </td>
                    <td>
                      <Link
                        to={`/users/${user.id}`}
                        className="btn btn-outline-info btn-sm px-3 mx-2"
                      >
                        Ver info de usuario
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : hasSearched ? (
              userNotFound
            ) : (
              <div className="d-flex align-items-center">
                <strong role="status">Loading</strong>
                <div className="spinner-grow spinner-grow-sm mx-1" role="status">
                  <span className="visually-hidden" >Loading...</span>
                </div>
              </div>
            )}
          </table>
        </div>
      </section>
    </>
  );
}
