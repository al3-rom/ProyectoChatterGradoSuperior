import { useParams, Link } from "react-router";
import { useEffect, useContext, useState } from "react";
import { UserAuth, UserInfo } from "../providers/AuthProvider";
import { useNavigate } from "react-router";
import { chatImg } from "../utils/chatImage";

export default function Chat() {
  const ruta_api = import.meta.env.VITE_API_URL;
  const { userInfo } = useContext(UserInfo);
  const { id } = useParams();
  const { token, setToken } = useContext(UserAuth);

  const [participantes, setParticipantes] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [creator, setCreator] = useState({});
  const [chatTitle, setChatTitle] = useState("");
  const [newChatTitle, setNewChatTitle] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState("");
  const [imgExist, setImgExist] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [eligiendoUser, setEligiendoUser] = useState(false);
  const [listaUsers, setListaUsers] = useState([]);

  let navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);

  const chatImages = chatImg(imgExist);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (userNotFound) {
      const timer = setTimeout(() => {
        setUserNotFound(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [userNotFound]);

  useEffect(() => {
    if (eligiendoUser) {
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
          if (data) {
            setListaUsers(data.data.users);
            setEligiendoUser(!eligiendoUser);
          }
        } catch (err) {
          console.error(err);
        }
      };

      listaUsers();
    }
  }, [eligiendoUser]);

  useEffect(() => {
    if (!token || !id) return;

    const iniciarSSE = async () => {
      const res = await fetch(`${ruta_api}/chats/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const data = decoder.decode(value);

        if (data.includes(id)) {
          const res = await fetch(`${ruta_api}/chats/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (data.data) {
            setMensajes(data.data.chat.messages);
            console.log(data.data);
          }
        }
      }
    };

    iniciarSSE();
  }, [id, token]);

  useEffect(() => {
    const findChat = async () => {
      try {
        const res = await fetch(`${ruta_api}/chats/${id}`, {
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
          setParticipantes(data.data.chat.participants);
          setMensajes(data.data.chat.messages);
          setCreator(data.data.chat.creator);
          setChatTitle(data.data.chat.title);
          setLoaded(!loaded);
          if (data.data.chat.image) {
            setImgExist(data.data.chat.image);
          }
        } else {
          console.log("Err en chat");
        }
      } catch (err) {
        console.log(err);
      }
    };

    findChat();
  }, []);

  const newAvatar = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      return console.log("Falta imagen de chat!");
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch(`${ruta_api}/chats/${id}/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("AcessToken");
          setToken("");
          return;
        }
        throw new Error("Error al enviar imagen");
      }

      const data = await res.json();
      if (data) {
        console.log(data);
        setImgExist(data.data.chat.image);
        setSelectedFile(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const cambiarTitulo = async (e) => {
    e.preventDefault();

    if (newChatTitle.length == 0) {
      return console.log("Falta nuevo titulo!");
    }

    try {
      const res = await fetch(`${ruta_api}/chats/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newChatTitle }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("AcessToken");
          setToken("");
          console.log("El token caduco");
          return;
        }
        throw new Error("Error al enviar mensajes");
      }

      const data = await res.json();
      if (data) {
        console.log(data);
        setNewChatTitle("");
        setChatTitle(data.data.chat.title);
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const leaveFromChat = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${ruta_api}/chats/${id}`, {
        method: "DELETE",
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
        throw new Error("Error al enviar mensajes");
      }

      const data = await res.json();
      if (data) {
        navigate("/chats");
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteParticipante = async (e, participanteEmail) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${ruta_api}/chats/${id}/participants/${participanteEmail}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("AcessToken");
          setToken("");
          console.log("El token caduco");
          return;
        }
        throw new Error("Error al eliminar el usuario");
      }

      const data = await res.json();
      if (data) {
        setParticipantes(data.data.chat.participants);
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const delImage = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${ruta_api}/chats/${id}/images`, {
        method: "DELETE",
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
        throw new Error("Error al eliminar el usuario");
      }

      const data = await res.json();
      if (data) {
        setImgExist(null);
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addMessage = async (e) => {
    e.preventDefault();

    if (mensaje.length == 0) {
      return console.log("Falta mensaje!");
    }

    const author = [{ author: { email: userInfo.email }, content: mensaje }];

    try {
      const res = await fetch(`${ruta_api}/chats/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(author),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("AcessToken");
          setToken("");
          console.log("El token caduco");
          return;
        }
        throw new Error("Error al enviar mensajes");
      }

      const data = await res.json();
      if (data) {
        console.log(data);
        setMensaje("");
        setMensajes(data.data.chat.messages);
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const delAllMessages = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${ruta_api}/chats/${id}/messages`, {
        method: "DELETE",
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
        throw new Error("Error al enviar mensajes");
      }

      const data = await res.json();
      if (data) {
        setMensajes(data.data.chat.messages);
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const delMessage = async (e, messageID) => {
    e.preventDefault();

    try {
      const res = await fetch(`${ruta_api}/chats/${id}/messages/${messageID}`, {
        method: "DELETE",
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
        throw new Error("Error al enviar mensajes");
      }

      const data = await res.json();
      if (data) {
        setMensajes(data.data.chat.messages);
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const searchUser = async (user) => {
    try {
      const res = await fetch(`${ruta_api}/users?q=${user}`, {
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
        return data;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addParticipante = async (e) => {
    e.preventDefault();

    if (!user) {
      return console.log("Falta email de usuario");
    }

    setAddingUser(true);
    setUserNotFound(false);

    try {
      const resSearch = await searchUser(user);

      if (resSearch && resSearch.data && resSearch.data.users.length > 0) {
        const usuarioExacto = resSearch.data.users.find(
          (u) => u.email === user
        );

        if (!usuarioExacto) {
          console.log("El usuario escrito no coincide exactamente con ninguno");
          setUserNotFound(true);
          setAddingUser(false);
          return;
        }

        const user_id = usuarioExacto._id;

        const payload = {
          participants: [
            {
              _id: user_id,
            },
          ],
        };

        const res = await fetch(`${ruta_api}/chats/${id}/participants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("AcessToken");
            setToken("");
            return;
          }

          throw new Error("Error al añadir usuario");
        }

        const data = await res.json();

       
        if (data && data.data && data.data.chat) {
          setParticipantes(data.data.chat.participants);
          setUser("");
          setAddingUser(false);
          setUserNotFound(false);
        }
      } else {
        setUserNotFound(true);
        setAddingUser(false);
        return;
      }
    } catch (err) {
      console.log(err);
      setAddingUser(false);
    }
  };

  return (
    <>
      {loaded ? (
        <section className="container mt-4 mb-4">
          <div className="card shadow-sm ">
            <Link to={"/chats"} className="btn btn-outline-info btn-sm p-2">
              Volver a chats
            </Link>
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center gap-3">
                <div>
                  {imgExist ? (
                    <>
                      <img
                        src={chatImages}
                        className="rounded-circle border"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                        }}
                        alt="chatImage"
                      />

                      {creator.email == userInfo.email && (
                        <form onSubmit={delImage}>
                          <button
                            type="submit"
                            className="btn btn-sm btn-danger badge rounded-pill"
                            title="Eliminar foto"
                          >
                            Eliminar avatar
                          </button>
                        </form>
                      )}
                    </>
                  ) : (
                    <div
                      className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <span>#</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="mb-0 text-primary">Titulo: {chatTitle}</h4>
                  <small className="text-muted">Admin: {creator.name}</small>
                </div>
              </div>

              <form onSubmit={leaveFromChat}>
                <button className="btn btn-outline-danger btn-sm" type="submit">
                  {creator.email == userInfo.email ? "Eliminar Chat" : "Salir"}
                </button>
              </form>
            </div>

            <div className="card-body bg-light border-bottom">
              <div className="row g-3">
                {creator.email == userInfo.email && (
                  <div className="col-md-6">
                    <h6 className="text-muted text-uppercase small fw-bold">
                      Configuración
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      <form
                        onSubmit={cambiarTitulo}
                        className="input-group input-group-sm"
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nuevo título"
                          value={newChatTitle}
                          onChange={(e) => setNewChatTitle(e.target.value)}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="submit"
                        >
                          Cambiar
                        </button>
                      </form>

                      <form
                        onSubmit={newAvatar}
                        className="input-group input-group-sm"
                      >
                        <input
                          type="file"
                          className="form-control"
                          accept="image/jpeg"
                          onChange={handleFileChange}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="submit"
                        >
                          Subir Foto
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                <div
                  className={
                    creator.email == userInfo.email
                      ? "col-md-6 border-start"
                      : "col-12"
                  }
                >
                  <h6 className="text-muted text-uppercase small fw-bold">
                    Participantes
                  </h6>
                  {participantes.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {participantes.map((participante) => (
                        <span
                          key={participante.id}
                          className="badge bg-white text-dark border d-flex align-items-center gap-2 p-2"
                        >
                          {participante.name}
                          {creator.email == userInfo.email && (
                            <form
                              onSubmit={(e) =>
                                deleteParticipante(e, participante.email)
                              }
                              className="d-inline"
                            >
                              <button
                                type="submit"
                                className="btn-close btn-close-dark"
                                style={{ fontSize: "0.6rem" }}
                              ></button>
                            </form>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <small className="text-secondary">
                      No hay participantes...
                    </small>
                  )}

                  {creator.email == userInfo.email && (
                    <form
                      onSubmit={addParticipante}
                      className="input-group input-group-sm"
                    >
                      <input
                        type="text"
                        className="form-control my-1"
                        placeholder="Email usuario"
                        value={user}
                        onChange={(e) => (
                          setUser(e.target.value),
                          setEligiendoUser(!eligiendoUser)
                        )}
                        list="lista-usuarios-sugeridos"
                      />
                      {listaUsers.length > 0 && (
                        <datalist id="lista-usuarios-sugeridos">
                          {listaUsers.map((usuario) => (
                            <option key={usuario._id} value={usuario.email}>
                              {usuario.name}
                            </option>
                          ))}
                        </datalist>
                      )}

                      <button className="btn btn-outline-primary" type="submit">
                        {addingUser ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Añadiendo...
                          </>
                        ) : (
                          "Add user"
                        )}
                      </button>
                    </form>
                  )}

                  {userNotFound && (
                    <div className="alert alert-danger" role="alert">
                      Usuario no encontrado!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className="card-body p-4"
              style={{
                height: "400px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
              }}
            >
              {mensajes.length >= 1 ? (
                <div className="d-flex flex-column">
                  {creator.email == userInfo.email && (
                    <div className="text-center mb-3">
                      <form onSubmit={delAllMessages}>
                        <button
                          type="submit"
                          className="btn btn-outline-danger  btn-sm text-decoration-none"
                        >
                          Limpiar historial
                        </button>
                      </form>
                    </div>
                  )}

                  {mensajes.map((mess) => {
                    const isMe = userInfo.email == mess.author.email;
                    return (
                      <div
                        key={mess._id}
                        className={`d-flex flex-column mb-3 ${
                          isMe ? "align-items-end" : "align-items-start"
                        }`}
                      >
                        <div className="d-flex align-items-end gap-2 max-w-75">
                          <div
                            className={`p-3 rounded-3 shadow-sm ${
                              isMe
                                ? "bg-primary text-white"
                                : "bg-white text-dark"
                            }`}
                            style={{ maxWidth: "80%", minWidth: "150px" }}
                          >
                            <div
                              className={`d-block fw-bold mb-1 ${
                                isMe ? "text-light" : "text-muted"
                              }`}
                              style={{ fontSize: "0.75rem" }}
                            >
                              {mess.author.name}
                            </div>
                            <p className="mb-0">{mess.content}</p>
                          </div>

                          {isMe && (
                            <form onSubmit={(e) => delMessage(e, mess._id)}>
                              <button
                                type="submit"
                                className="btn btn-sm text-muted p-0"
                                title="Borrar"
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-100 d-flex justify-content-center align-items-center text-muted">
                  <p>Todavía no hay mensajes.</p>
                </div>
              )}
            </div>

            <div className="card-footer bg-white py-3">
              <form onSubmit={addMessage} className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Escribe un mensaje..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
                <button className="btn btn-primary px-4" type="submit">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </section>
      ) : (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
}
