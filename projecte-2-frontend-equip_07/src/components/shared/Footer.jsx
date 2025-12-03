export default function Footer() {

  return (
    <footer className="footer bg-light border-top py-3">
      <div className="container-fluid d-flex justify-content-between align-items-center px-4 px-md-5">
        <div className="d-flex align-items-center">
          <div
            className="text-white bg-primary p-1  rounded d-flex align-items-center justify-content-center me-2"
          >
            <i
              className="bi bi-chat-dots-fill"
              style={{ fontSize: "0.8rem" }}
            ></i>
          </div>
          <span className="fw-bold text-dark"><em><strong>Chatter</strong></em></span>
        </div>

        <div className="text-muted small d-none d-sm-block">
          © 2025 Chatter · Hecho con <span className="text-danger">❤️</span>
        </div>

        <div className="d-flex gap-3 text-muted">
          <a href="#" className="text-decoration-none text-muted hover-dark">
            <i className="bi bi-twitter-x" style={{ fontSize: "1.2rem" }}></i>
          </a>

          <a href="#" className="text-decoration-none text-muted hover-dark">
            <i className="bi bi-github" style={{ fontSize: "1.2rem" }}></i>
          </a>

          <a href="#" className="text-decoration-none text-muted hover-dark">
            <i className="bi bi-linkedin" style={{ fontSize: "1.2rem" }}></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
