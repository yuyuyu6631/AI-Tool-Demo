import Header from "@/src/app/components/Header";
import Footer from "@/src/app/components/Footer";
import { Skeleton } from "@/src/app/components/ui/skeleton";

export default function ToolDetailLoading() {
  return (
    <div className="page-shell">
      <Header currentPath="/tools" currentRoute="/tools" />
      <main>
        <section className="bg-[var(--bg-subtle)]">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="panel-base rounded-lg p-5 md:p-7">
                <div className="flex flex-col gap-5 md:flex-row">
                  <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
                  <div className="w-full space-y-4">
                    <Skeleton className="h-10 w-2/3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                </div>
              </div>
              <aside className="space-y-3">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </aside>
            </div>
          </div>
        </section>
        <section className="py-8">
          <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 sm:px-6 xl:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
            <div className="space-y-6">
              {[0, 1, 2].map((item) => (
                <div key={item} className="panel-base rounded-lg p-5 md:p-6">
                  <Skeleton className="h-7 w-40" />
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
