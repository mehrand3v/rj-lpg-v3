import { ThemeProvider } from './components/ThemeProvider'
import { RouterProvider } from "react-router-dom";
import router from "@/router/appRouter";


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
