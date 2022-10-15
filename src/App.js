import { Container } from "react-bootstrap";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Home from "./components/Home";
import Definitions from "./components/Definitions";
import Login from "./components/Login";
import Maps from "./components/Maps";
import LamRimChenMo from "./components/maps/lrcm/LamRimChenMo";
import LogicReasons from "./components/maps/logic/LogicReasons";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route exact path="definitions" element={<Definitions />} />
        <Route exact path="maps" element={<Maps />} />
        <Route exact path="maps/lrcm" element={<LamRimChenMo />} />
        <Route exact path="maps/logic\reasons" element={<LogicReasons />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
