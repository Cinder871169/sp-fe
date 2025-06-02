import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const code = new URLSearchParams(window.location.search).get("code");
console.log("Code from URL:", code);

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={code ? <Dashboard code={code} /> : <Login />}
        />
        <Route path="/callback" element={<Dashboard code={code} />} />
      </Routes>
    </Router>
  );
}

export default App;
