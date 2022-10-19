import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext } from "react";
import { UserContext, ObjectsContext } from "./utils/Contexts";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Definitions from "./components/Definitions";
import Maps from "./components/Maps";
import Pics from "./components/Pics";

function App() {
  const [user, setUser] = useState(false);
  const [objects, setObjects] = useState([]);

  return (
    <ObjectsContext.Provider value={{ objects, setObjects }}>
      <UserContext.Provider value={{ user, setUser }}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route exact path="definitions" element={<Definitions />} />
            <Route exact path="maps" element={<Maps />} />
            <Route exact path="pics" element={<Pics />} />
          </Routes>
        </BrowserRouter>
      </UserContext.Provider>
    </ObjectsContext.Provider>
  );
}

export default App;
