import Header from "@/components/home/Header";
import HeroBanner from "@/components/home/HeroBanner";
import PrincipalMessage from "@/components/home/PrincipalMessage";
import NoticeBoard from "@/components/home/NoticeBoard";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner />
        <PrincipalMessage />
        <NoticeBoard />
      </main>
      <Footer />
    </div>
  );
}
