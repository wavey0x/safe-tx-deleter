import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ToastStack from "./components/ToastStack";
import HomePage from "./pages/HomePage";
import SafeQueuePage from "./pages/SafeQueuePage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <div>
      <Header />
      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/safe/:chainKey/:safeAddress" element={<SafeQueuePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      <ToastStack />
    </div>
  );
};

export default App;
