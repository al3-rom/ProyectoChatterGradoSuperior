import { useParams, Link } from "react-router";
import { useEffect, useContext, useState } from "react";
import { UserAuth } from "../providers/AuthProvider";
import { getAvatarUrl } from "../utils/avatar";
import UserKisses from "../components/UserKisses";

export default function User() {
  const { id } = useParams();
  const { token } = useContext(UserAuth);
  const ruta_api = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [idiomasUser, setIdiomasUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const avatarUrl = getAvatarUrl(user);



  useEffect(() => {
    const aboutUser = async () => {
      try {
        const res = await fetch(`${ruta_api}/users/${id}`, {
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

        if (data) {
          setUser(data.data.user);
          setLoading(false);

          try {
            const idiomesArr = data.data.user.idiomes || [];
            if (Array.isArray(idiomesArr) && idiomesArr.length > 0) {
              const parsed = JSON.parse(idiomesArr[0]);
              setIdiomasUser(Array.isArray(parsed) ? parsed : []);
            } else {
              setIdiomasUser([]);
            }
          } catch {
            setIdiomasUser([]);
          }

        }

      } catch (err) {
        console.error(err);
      }
    };

    aboutUser();
  }, [id, ruta_api, token]);




  return (
    <><section className="m-auto container my-4">
      <Link to="/users" className="btn btn-primary btn-sm">
        Volver atras
      </Link>
      <div>
        Info sobre usuario
      </div>
      {loading ? ("Cargando") : (
        <div className="container shadow m-auto p-4 border rounded d-flex flex-column gap-2">
          <div className="d-flex justify-content-between ">
            <img
              src={avatarUrl}
              className="img-fluid rounded-circle"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
              alt="Avatar"
            />
          </div>

          <div>
            <h4>
              Nombre: <span className="text-secondary">{user.nom}</span>
            </h4>
            <h4>
              Email: <span className="text-secondary">{user.email}</span>
            </h4>
            <h4>
              {idiomasUser.length >= 1 ? (
                <>
                  Idiomas:{" "}
                  <span className="text-secondary">{idiomasUser.join(", ")}</span>
                </>
              ) : (
                "No hay idiomas"
              )}

            </h4>
            <h4>
              Descripcion:{" "}
              <span className="text-secondary">{user.descripcio}</span>
            </h4>
            <h4>
              Fecha de nacimiento:{" "}
              <span className="text-secondary">
                {new Date(user.dataNaixement).toLocaleDateString()}
              </span>
            </h4>

            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#viewUserKissesModal">Ver likes</button>

          </div>
        </div>

      )}

    </section>

      {user && <UserKisses user={user} />}
    </>
  );

}