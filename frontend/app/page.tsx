"use client";

import { useState } from "react";
import { HomePage } from "@pages/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Hydrate } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function Home({ dehydratedState }: { dehydratedState: never }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Hydrate digunakan untuk memulihkan state dari SSR/SSG */}
      <Hydrate state={dehydratedState}>
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] w-full">
          <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
            <HomePage />
          </main>
        </div>
      </Hydrate>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
