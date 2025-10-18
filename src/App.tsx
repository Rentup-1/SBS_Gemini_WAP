import { Routes, Route } from "react-router-dom";
import GemeniExtraction from "./pages/GemeniExtraction";
import Layout from "./components/layout/Layout";
import { MessageList } from './components/messages';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MessageList />} />
        <Route path="/extraction" element={<GemeniExtraction />} />
      </Route>
    </Routes>
  );
}
