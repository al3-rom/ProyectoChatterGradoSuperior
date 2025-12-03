import { useState, useContext, useEffect } from "react";
import { Link } from "react-router";
import { UserAuth, UserInfo } from "../providers/AuthProvider";
import { useToast } from '../providers/ToastProvider';

export default function Chats() {
  const ruta_api = import.meta.env.VITE_API_URL;
  const [nombreChat, setNombreChat] = useState("");
  const chatNotFound = "No hemos podido encontrar chat con este titulo!";
  const chatLoading = "Cargando chats...";
  const [newChatName, setNewChatName] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { token } = useContext(UserAuth);
  const { userInfo } = useContext(UserInfo);
  const [chats, setChats] = useState([]);
  const { addToast } = useToast();

  const allChats = async () => {
    try {
      const res = await fetch(`${ruta_api}/chats`, {
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
      if(data) {
        setChats(data.data.chats);
      } else {
        console.log("ERR en chats")
      }
      
    } catch (err) {
      console.log(err);
    }
  };

  const renderChat = () => {
    const participantes = new Set();

    chats.map((chat) => {
      participantes.add(chat.participants);
      if (chat.creator.id == userInfo._id || participantes.has(userInfo._id)) {
        setChats[chat];
      }
    });
  };

  const deleteChat = async (e, chatId) => {
    e.preventDefault();
    if (!chatId) {
      return console.log("Falta ID del chat!");
    }

    try {
      const res = await fetch(`${ruta_api}/chats/${chatId}`, {
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
        throw new Error("Error al buscar usuario");
      }

      const data = await res.json();
      if (data) {
        console.log(data)
          if (typeof data.data != "string") {
            addToast(data.message || 'Chat eliminado con exito!', 'success')
          } else {
            addToast(data.data || "Has salido del chat", 'success')
          }
      }

      allChats();
    } catch (err) {
      console.log(err);
    }
  };

  //Cargar chats mios y donde participo
  useEffect(() => {
    allChats();
  }, []);

  useEffect(() => {
    renderChat();
  }, [chats]);

  ////

  const crearChat = async (e) => {
    e.preventDefault();

    if (!newChatName) {
      return console.log("Falta el nombre del chat");
    }

    try {
      const res = await fetch(`${ruta_api}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newChatName }),
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
      if (!res.ok) {
        console.log("No se ha podido crear el chat");
      }

      if (data) {
        allChats();
        setNewChatName("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Meter a otro archivo
  const buscarChat = async (e) => {
    e.preventDefault();
    setHasSearched(true);

    try {
      const res = await fetch(`${ruta_api}/chats?q=${nombreChat}`, {
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
        setChats(data.data.chats);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <section className="m-auto container mt-4">
        <div className="d-flex py-2 flex-column container p-0 ">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h1>Chats</h1>
          </div>

          <div className="border p-3 rounded mb-2">
            <div className="input-group mt-2 mb-2">
              <h3>Crear chat del grupo</h3>
              <form
                onSubmit={crearChat}
                className="gap-2 d-flex flex-row w-100"
              >
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Nombre del chat"
                  aria-label="Nombre del chat"
                  aria-describedby="basic-addon2"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
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

          <div className="input-group mt-2 mb-2">
            <form onSubmit={buscarChat} className="gap-2 d-flex flex-row w-100">
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Buscar chats por nombre..."
                aria-label="Buscar chats por nombre..."
                aria-describedby="basic-addon2"
                value={nombreChat}
                onChange={(e) => setNombreChat(e.target.value)}
              />
              <div className="input-group-append">
                <button className="btn btn-outline-primary px-5" type="submit">
                  Buscar
                </button>
              </div>
            </form>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Listado de chats</h4>
              {chats.length >= 1 && (
                <span className="badge bg-primary">
                  {chats.length} chat{chats.length !== 1 && "s"}
                </span>
              )}
            </div>

            <div className="card-body p-0">
              {chats.length >= 1 ? (
                <ul className="list-group list-group-flush">
                  {chats.map((chat) => (
                    <li
                      key={chat._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="me-3">
                        <h6 className="mb-1">{chat.title}</h6>
                        <small className="text-secondary">Participantes: {chat.participants.length+1}</small>
                      </div>

                      
                      <form onSubmit={(e) => deleteChat(e, chat._id)}>
                        <Link to={`/chats/${chat._id}`} className="btn btn-outline-info btn-sm px-3 mx-2">Abrir chat</Link>
                        <button
                          className="btn btn-outline-danger btn-sm px-3"
                          type="submit"
                        >
                          Eliminar
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : hasSearched ? (
                <div className="p-4 text-center text-muted">
                  <p className="mb-0">{chatNotFound}</p>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">
                  <div
                    className="spinner-border spinner-border-sm mb-2"
                    role="status"
                  />
                  <p className="mb-0">{chatLoading}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
