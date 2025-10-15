import Header from "@/components/home/Header";
import HeroBanner from "@/components/home/HeroBanner";
import PrincipalMessage from "@/components/home/PrincipalMessage";
import Academics from "@/components/home/Academics";
import Faculty from "@/components/home/Faculty";
import Admission from "@/components/home/Admission";
import NoticeBoard from "@/components/home/NoticeBoard";
import Contact from "@/components/home/Contact";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner />
        <PrincipalMessage />
        <Academics />
        <Faculty />
        <Admission />
        <NoticeBoard />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
