import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./provider/AuthProvider.jsx";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
