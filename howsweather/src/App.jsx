import logo from "./logo.svg";
import WeatherApp from "./components/WeatherApp";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <div className="App bg-black text-white min-h-[100vh]">
      <div className="app-container | ">
        <WeatherApp />
      </div>
    </div>
  );
}

export default App;
