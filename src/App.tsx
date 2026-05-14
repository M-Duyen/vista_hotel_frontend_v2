import "./index.css";
import "./App.css";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { NotificationProvider } from "./context/NotificationContextAPI";
import { useAuthStore } from "./stores/authStore";

function App() {
  useEffect(() => {
    // Load auth state from localStorage on app startup
    useAuthStore.getState().loadFromStorage();
  }, []);

  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}

export default App;
