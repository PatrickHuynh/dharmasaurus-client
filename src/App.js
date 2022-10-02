import { Container } from "react-bootstrap";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Home from "./components/Home";
import Definitions from "./components/Definitions";
import Login from "./components/Login";
import Outlines from "./components/Outlines";
import LamRimChenMo from "./components/outlines/lrcm/LamRimChenMo";
import LogicReasons from "./components/outlines/logic/LogicReasons";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Container fluid className="p-0 m-0">
        <Routes>
          <Route path="/" element={<Definitions />} />
          <Route exact path="outlines" element={<Outlines />} />
          <Route exact path="outlines/lrcm" element={<LamRimChenMo />} />
          <Route exact path="outlines/logic\reasons" element={<LogicReasons />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
