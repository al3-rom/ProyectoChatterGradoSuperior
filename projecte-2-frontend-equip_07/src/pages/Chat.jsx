import { useParams } from "react-router";
import { useEffect, useContext, useState } from "react";
import { UserAuth, UserInfo } from "../providers/AuthProvider";
import { useNavigate } from "react-router";

export default function Chat() {
  const ruta_api = import.meta.env.VITE_API_URL;
  const { userInfo } = useContext(UserInfo);
  const { id } = useParams();
  const { token } = useContext(UserAuth);
  const [participantes, setParticipantes] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [creator, setCreator] = useState({});
  const [chatTitle, setChatTitle] = useState("");
  const [newChatTitle, setNewChatTitle] = useState("");
  const [mensaje, setMensaje] = useState("");
  const chatLoading = "Cargando chat...";
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState("");
  let navigate = useNavigate();

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

        // Decodificamos lo que llega (convertimos bytes a texto)
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
        } else {
          console.log("Err en chat");
        }
      } catch (err) {
        console.log(err);
      }
    };

    findChat();
  }, []);

  

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
        body: JSON.stringify({"title": newChatTitle}),
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
        }
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
        navigate("/chats")
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
      const res = await fetch(`${ruta_api}/chats/participants/${participanteEmail}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
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
        setParticipantes(data.data.chat.participants);
      } else {
        console.log("Err en chat");
      }
    } catch (err) {
      console.log(err);
    }
  };

  

  const addMessage = async (e) => {
    e.preventDefault();
              console.log(creator)
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

    const res = await searchUser(user);
    if (res.data) {
      const user_id = res.data.users[0]._id;

      const payload = {
        participants: [
          {
            _id: user_id,
          },
        ],
      };

      try {
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
            console.log("El token caduco");
            return;
          }
          throw new Error("Error al añadir usuario");
        }

        const data = await res.json();
        if (data) {
          console.log(data);
          setParticipantes(data.data.chat.participants);
          setUser("");
        } else {
          console.log("Err en chat");
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("No he encontrado user");
    }
  };

  return (
    <>
      {loaded ? (
        <section className="m-auto container mt-4">
          <div className="d-flex py-2 flex-column container p-0 ">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h1>{chatTitle}</h1>
              <div>
                {creator.email == userInfo.email && (
                <div className="input-group mt-2 mb-2">
                <form
                  onSubmit={cambiarTitulo}
                  className="gap-2 d-flex flex-row w-100"
                >
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Nuevo titulo"
                    aria-label="Nuevo titulo"
                    aria-describedby="basic-addon2"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-primary px-3"
                      type="submit"
                    >
                      Poner nuevo titulo
                    </button>
                  </div>
                </form>
              </div>
              )}
              </div>

              <div className="input-group mt-2 mb-2">
                <form
                  onSubmit={leaveFromChat}
                  className="gap-2 d-flex flex-row w-100"
                >
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-primary px-3"
                      type="submit"
                    >
                      {creator.email == userInfo.email ? ('Eliminar chat') : ('Salir del chat')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div>
              <h2>Participantes</h2>
              <p>{creator.name} - Admin</p>
              <div>
                {participantes.map((participante) => (
                  <div key={participante.id}>
                    <p>{participante.name} - Participante</p>
                    {creator.email == userInfo.email && (
                      <div className="input-group mt-2 mb-2">
                      <form
                        onSubmit={(e) => deleteParticipante(e, participante.email)}
                        className="gap-2 d-flex flex-row w-100"
                      >
                        <div className="input-group-append">
                          <button
                            className="btn btn-outline-primary px-3"
                            type="submit"
                          >
                            Eleminar usuario
                          </button>
                        </div>
                      </form>
                    </div>
                    )}
                  </div>
                ))}
              </div>
              {creator.email == userInfo.email && (
                <div className="input-group mt-2 mb-2">
                <form
                  onSubmit={addParticipante}
                  className="gap-2 d-flex flex-row w-100"
                >
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Añadir usuario"
                    aria-label="Añadir usuario"
                    aria-describedby="basic-addon2"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-primary px-3"
                      type="submit"
                    >
                      Añadir usuario
                    </button>
                  </div>
                </form>
              </div>
              )}
              
            </div>

            <div className="border p-3 rounded mb-2">
              <h2 className="">Mensajes del chat</h2>
              
              {mensajes.length >= 1 ? (
                
                <div className="m-4">
                  {creator.email == userInfo.email && (
                    <div className="input-group mt-2 mb-2">
                    <form
                      onSubmit={delAllMessages}
                      className="gap-2 d-flex flex-row w-100"
                    >
                      <div className="input-group-append">
                        <button
                          className="btn btn-outline-primary px-5"
                          type="submit"
                        >
                          Eliminar todos los mensajes
                        </button>
                      </div>
                    </form>
                  </div>
                  )}
                  {mensajes.map((mess) => (
                    <div key={mess._id} className="d-flex flex-row">
                      <p>{mess.author.name}</p>:<p>{mess.content} </p>
                      {userInfo.email == mess.author.email && (
                          <div className="input-group mt-2 mb-2">
                            <form
                              onSubmit={(e) => delMessage(e, mess._id)}
                              className="gap-2 d-flex flex-row w-100"
                            >
                              <div className="input-group-append">
                                <button
                                  className="btn btn-outline-primary px-5"
                                  type="submit"
                                >
                                  Eliminar mensaje
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <h3 className="m-4">No hay mensajes</h3>
              )}
              <div className="input-group mt-2 mb-2">
                <form
                  onSubmit={addMessage}
                  className="gap-2 d-flex flex-row w-100"
                >
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Mensaje"
                    aria-label="Mensaje"
                    aria-describedby="basic-addon2"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-primary px-5"
                      type="submit"
                    >
                      Crear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      ) : (
        chatLoading
      )}
    </>
  );
}
