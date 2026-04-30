import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ApiRequestError } from "@/lib/api";
import { useThemeStore } from "@/store/theme";

type ProvidersProps = {
  children: React.ReactNode;
};

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  const setResolvedTheme = useThemeStore((s) => s.setResolvedTheme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    function sync() {
      const isDark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", isDark);
      setResolvedTheme(isDark ? "dark" : "light");
    }

    sync();

    if (theme === "system") {
      mq.addEventListener("change", sync);
      return () => mq.removeEventListener("change", sync);
    }
  }, [theme, setResolvedTheme]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (count, error) => {
              if (
                error instanceof ApiRequestError &&
                (error.status === 401 || error.status === 400)
              ) {
                return false;
              }
              return count < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
