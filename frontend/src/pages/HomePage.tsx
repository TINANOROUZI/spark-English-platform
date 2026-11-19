import BackgroundDecor from "../components/BackgroundDecor";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../sections/Hero";
import Courses from "../sections/Courses";
import Activities from "../sections/Activities";
import Ages from "../sections/Ages";
import Teachers from "../sections/Teachers";
import Pricing from "../sections/Pricing";
import Faq from "../sections/Faq";
import Contact from "../sections/Contact";
import MessageForm from "../sections/MessageForm";

export default function HomePage() {
  return (
    <>
      <BackgroundDecor />
      <Navbar />
      <main>
        <Hero /><Courses /><Activities /><Ages /><Teachers /><Pricing /><Faq /><Contact /><MessageForm />
      </main>
      <Footer />
    </>
  );
}
