import Footer from "../components/shared/Footer";

export default function AuthLayout({ children }) {
    return (
        <div className="d-flex flex-column min-vh-100 position-relative">
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{
                    backgroundImage: "url(/background.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "top center",
                    zIndex: -1,
                }}
            />

            <main
                className="d-flex flex-column flex-grow-1 justify-content-start align-items-center"
                style={{
                    paddingTop: "100px",
                    paddingBottom: "80px",
                    width: "100%",
                }}
            >
                {children}
            </main>

            <Footer />
        </div>
    );
}
