import NavBar from './components/NavBar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import First90DaysForm from './components/sections/First90DaysForm';
import Skills from './components/sections/Skills';
import Experience from './components/sections/Experience';
import Education from './components/sections/Education';
import Projects from './components/sections/Projects';
import Contact from './components/sections/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <main>
        <Hero />
        <About />
        <First90DaysForm />
        <Skills />
        <Experience />
        <Education />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
