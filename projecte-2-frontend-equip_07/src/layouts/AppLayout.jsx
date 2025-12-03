import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { Outlet } from "react-router";

export default function AppLayout() {
    return (
        <div className="d-flex flex-column min-vh-100 mt-5">
            <Header />
            <main className="flex-grow-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
