import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Programs from '@/components/Programs';
import News from '@/components/News';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Programs />
        <Stats />
        <News />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
