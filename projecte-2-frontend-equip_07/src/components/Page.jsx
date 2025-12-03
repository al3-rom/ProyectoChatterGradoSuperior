import { useEffect } from "react";

const APP_NAME = "Chatter";

export default function Page({ title, children }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} – ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
  }, [title]);

  return children;
}
