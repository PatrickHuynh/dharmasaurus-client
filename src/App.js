import { Container } from "react-bootstrap";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Home from "./components/Home";
import Definitions from "./components/Definitions";
import Login from "./components/Login";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Container fluid className="p-0 m-0">
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<Definitions />} />
          {/* <Route path="/about" element={<About />} /> */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
