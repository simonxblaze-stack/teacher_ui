import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import TeacherRoutes from "./routes/TeacherRoutes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <TeacherRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;