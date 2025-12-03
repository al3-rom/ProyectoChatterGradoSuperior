import { jwtDecode } from "jwt-decode";

export const fetchUserData = async (token) => {

      const ruta_api = import.meta.env.VITE_API_URL;

      try {

        const decoded = jwtDecode(token);
        const idUser = decoded.user; 
        
        const res = await fetch(`${ruta_api}/users/${idUser}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {

            if(res.status === 401) {
                localStorage.removeItem("accessToken");
                setToken("");
                console.log("El token caduco");
                return;
            }
            throw new Error("Error al buscar user");
        }

        const data = await res.json();

        let userInfo = data.data.user

        return userInfo

      } catch (err) {
        console.error(err);
      }
};

