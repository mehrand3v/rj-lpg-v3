import { useTheme } from "@/components/ThemeProvider";

function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Current Theme: {theme}</h1>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded"
          onClick={() => setTheme("light")}
        >
          Light Mode
        </button>
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded"
          onClick={() => setTheme("dark")}
        >
          Dark Mode
        </button>
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded"
          onClick={() => setTheme("system")}
        >
          System Mode
        </button>
      </div>
    </div>
  );
}

export default Home;
