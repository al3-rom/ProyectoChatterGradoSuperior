export const Logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("User");
        window.location.reload();
    };