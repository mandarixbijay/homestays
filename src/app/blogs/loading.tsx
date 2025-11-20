import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { BlogCardSkeleton, FeaturedBlogSkeleton } from "@/components/blog/BlogSkeletons";

export default function Loading() {
  return (
    <div className="bg-background min-h-screen font-manrope">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section Skeleton */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#214B3F]/5 to-[#D1AA5A]/5">
            <div className="absolute inset-0 bg-[url('/images/topography.svg')] opacity-5"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-20">
            <div className="text-center max-w-5xl mx-auto space-y-8">
              <div className="space-y-6">
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-full mx-auto" />
                <div className="space-y-4">
                  <div className="h-16 w-3/4 bg-gray-200 animate-pulse rounded mx-auto" />
                  <div className="h-16 w-2/3 bg-gray-200 animate-pulse rounded mx-auto" />
                </div>
                <div className="h-6 w-1/2 bg-gray-100 animate-pulse rounded mx-auto" />
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="h-14 bg-gray-200 animate-pulse rounded-2xl" />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 w-24 bg-gray-200 animate-pulse rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Blogs Skeleton */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-10 w-64 bg-gray-200 animate-pulse rounded mx-auto mb-4" />
              <div className="h-6 w-96 bg-gray-100 animate-pulse rounded mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <FeaturedBlogSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Grid Skeleton */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-full" />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
