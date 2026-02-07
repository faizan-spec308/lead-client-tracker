import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Leads from "./pages/leads"; // NOTE: match your actual file name (leads.jsx)
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import ClientsPage from "./pages/Clients";

function Nav() {
  const { isAuthed, logout } = useAuth();
  

  return (
    <nav style={{ display: "flex", gap: 12, padding: 16 }}>
      {isAuthed ? (
        <>
          <Link to="/leads">Leads</Link>
          <Link to="/clients">Clients</Link>
          <button onClick={logout}>Logout</button>
          
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/leads" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/leads"
          element={
            <PrivateRoute>
              <Leads />
            </PrivateRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <ClientsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
