import logo from "./logo.svg";
import WeatherApp from "./components/WeatherApp";
import "./App.css";

function App() {
  return (
    <div className="App bg-black text-green-600 min-h-[100vh]">
      <div className="app-container | max-w-[90%] mx-auto md:max-w-[60%] lg:max-w-[45%]">
        <WeatherApp />
      </div>
    </div>
  );
}

export default App;
