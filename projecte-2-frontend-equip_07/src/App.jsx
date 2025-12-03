import { Routes, Route, Navigate } from "react-router";
import { useState, useEffect } from "react";
import { UserAuth, UserInfo } from "./providers/AuthProvider";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import { fetchUserData } from "./utils/fetchUserData";
import Page from "./components/Page";
import {
  AuthPage, Dashboard, Profile, EditProfile, UpdatePassword,
  NotFoundPage, Users, Bios, Bio, Chats,Chat, User
} from "./pages";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      const userInfo = await fetchUserData(token);
      setUserInfo(userInfo);
      setLoading(false);
    };

    obtenerUser();
  }, [token]);


  if (loading) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-grow text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <UserAuth.Provider value={{ token, setToken }}>
      <UserInfo.Provider value={{ userInfo, setUserInfo }}>
        <Routes>

          {/* Auth */}
          <Route
            path="/auth"
            element={
              !token ? (
                <AuthLayout>
                  <Page title="Login">
                    <AuthPage />
                  </Page>
                </AuthLayout>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* App pages */}
          {token && (
            <Route path="/" element={<AppLayout />}>

              <Route index element={<Navigate to="/dashboard" replace />} />

              <Route
                path="dashboard"
                element={
                  <Page title="Dashboard">
                    <Dashboard />
                  </Page>
                }
              />

              <Route
                path="users"
                element={
                  <Page title="Usuarios">
                    <Users />
                  </Page>
                }
              />

              <Route
                path="users/:id"
                element={
                  <Page title="User">
                    <User />
                  </Page>
                }
              />

              <Route
                path="chats"
                element={
                  <Page title="Chats">
                    <Chats />
                  </Page>
                }
              />

              <Route
                path="chats/:id"
                element={
                  <Page title="Chat">
                    <Chat />
                  </Page>
                }
              />

              <Route
                path="profile"
                element={
                  <Page title="Perfil">
                    <Profile />
                  </Page>
                }
              />

              <Route
                path="profile/edit"
                element={
                  <Page title="Editar Perfil">
                    <EditProfile />
                  </Page>
                }
              />

              <Route
                path="profile/password"
                element={
                  <Page title="Cambiar Contraseña">
                    <UpdatePassword />
                  </Page>
                }
              />

              <Route
                path="bios"
                element={
                  <Page title="Bios">
                    <Bios />
                  </Page>
                }
              />

              <Route
                path="bios/:id"
                element={
                  <Page title="Bio">
                    <Bio />
                  </Page>
                }
              />

              <Route
                path="*"
                element={
                  <Page title="Página no encontrada">
                    <NotFoundPage />
                  </Page>
                }
              />
            </Route>
          )}

          {!token && <Route path="*" element={<Navigate to="/auth" replace />} />}
        </Routes>
      </UserInfo.Provider>
    </UserAuth.Provider>
  );
}
