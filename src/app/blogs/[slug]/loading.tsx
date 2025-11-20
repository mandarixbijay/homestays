import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { BlogDetailSkeleton } from "@/components/blog/BlogSkeletons";

export default function Loading() {
  return (
    <div className="bg-background min-h-screen font-manrope">
      <Navbar />
      <BlogDetailSkeleton />
      <Footer />
    </div>
  );
}
