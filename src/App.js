import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { UserContext } from "./utils/UserContext";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Definitions from "./components/Definitions";
import Maps from "./components/Maps";
import Pics from "./components/Pics";

function App() {
  const [user, setUser] = useState(false);

  return (
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
  );
}

export default App;
