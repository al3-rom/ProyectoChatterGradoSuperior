import { Link } from "react-router";
import { UserInfo } from "../providers/AuthProvider";
import { useContext, useState } from "react";
import { getAvatarUrl } from "../utils/avatar";
import { Logout } from "../utils/logout";

export default function Dashboard() {
  const { userInfo } = useContext(UserInfo);

  if (!userInfo) {
    return <div className="p-5 text-center">Cargando perfil...</div>;
  }

  if(userInfo.idiomes[0] >= 3) {
    var idiomas = userInfo.idiomes[0] 
  }

  const avatarUrl = getAvatarUrl(userInfo);

  return (
    <section className="m-auto container my-4">
      <div className="d-flex py-2 justify-content-between container p-0">
        <h1>Panel</h1>
        <div>
          <button
            className="btn btn-outline-danger m-1 p-2 "
            onClick={Logout}
          >
            Cerrar seccion
          </button>
        </div>
      </div>
      <div className="container shadow m-auto p-4 border rounded d-flex flex-column gap-2">
        <div className="d-flex justify-content-between ">
          <h2>Bienvenido!</h2>
          <img
            src={avatarUrl}
            className="img-fluid rounded-circle"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
            alt="Avatar"
          />
        </div>

        <div>
          <h4>
            Nombre: <span className="text-secondary">{userInfo.nom}</span>
          </h4>
          <h4>
            Email: <span className="text-secondary">{userInfo.email}</span>
          </h4>
          <h4>
            {idiomas ? (
              <>
              Idiomas:{" "}
            <span className="text-secondary">{idiomas.join(", ")}</span>
              </>
            ) : (
              "No hay idiomas"
            )}
            
          </h4>
          <h4>
            Descripcion:{" "}
            <span className="text-secondary">{userInfo.descripcio}</span>
          </h4>
          <h4>
            Fecha de nacimiento:{" "}
            <span className="text-secondary">
              {new Date(userInfo.dataNaixement).toLocaleDateString()}
            </span>
          </h4>
          <p className="text-secondary">ID: {userInfo._id}</p>
        </div>
      </div>
      <div className="container mt-4 p-2 ">
        <div className="row gap-4">
          <div className="shadow col rounded p-4">
            <h2 className="mb-4">Gestiona tus Bios</h2>
            <p >Crea, edita y revisa tus bios y tus kisses.</p>
            <Link to="/bios" className="btn btn-primary w-100  mx-auto mt-4">Entrar a Bios</Link>
          </div>
          <div className="shadow col rounded p-4">
            <h2 className="mb-4">Chats y mensajes</h2>
            <p >Crea chats de grupo y envia mensajes.</p>
            <Link to="/chats" className="btn btn-primary w-100 p-2 mx-auto mt-4">Entrar a Chats</Link>
          </div>
          <div className="shadow col rounded p-4">
            <h2 className="mb-4">Busqueda de usuarios</h2>
            <p >Lista y busca otros usuarios por nombre o email.</p>
            <Link to="/users" className="btn btn-primary w-100 p-2 mx-auto mt-4">Entrar a Usuarios</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
