import BackgroundDecor from "../components/BackgroundDecor.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../sections/Hero.jsx";
import Courses from "../sections/Courses.jsx";
import Activities from "../sections/Activities.jsx";
import Ages from "../sections/Ages.jsx";
import Teachers from "../sections/Teachers.jsx";
import Pricing from "../sections/Pricing.jsx";
import Faq from "../sections/Faq.jsx";
import Contact from "../sections/Contact.jsx";
import MessageForm from "../sections/MessageForm.jsx";

export default function HomePage() {
  return (
    <>
      <BackgroundDecor />
      <Navbar />
      <Hero />
      <Courses />
      <Activities />
      <Ages />
      <Teachers />
      <Pricing />
      <Faq />
      <Contact />
      <MessageForm />
      <Footer />
    </>
  );
}
