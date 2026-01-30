import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Leads from "./pages/leads";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        <nav style={{ marginBottom: 16 }}>
          <Link to="/leads">Leads</Link>
        </nav>

        <Routes>
          <Route path="/leads" element={<Leads />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
