import Link from "next/link"
import { Mail, Phone } from "lucide-react"

export default function ContactSection() {
  return (
    <section id="contact" className="py-20">
      <h2 className="section-title">Contact</h2>
      <div className="bg-muted rounded-xl p-12 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10">
          <div>
            <h3 className="text-xl font-bold mb-5 text-primary">Navigation</h3>
            <ul className="list-none">
              <li className="mb-4">
                <Link
                  href="/"
                  className="text-white no-underline transition-colors duration-300 hover:text-primary block"
                >
                  Home
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="#projects"
                  className="text-white no-underline transition-colors duration-300 hover:text-primary block"
                >
                  Projects
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="#skills"
                  className="text-white no-underline transition-colors duration-300 hover:text-primary block"
                >
                  Skills
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="#experience"
                  className="text-white no-underline transition-colors duration-300 hover:text-primary block"
                >
                  Experience
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="#education"
                  className="text-white no-underline transition-colors duration-300 hover:text-primary block"
                >
                  Education
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-5 text-primary">Get in Touch</h3>
            <p className="mb-8">
              I'm currently looking to join a cross-functional team that values improving people's lives through
              accessible design, or have a project in mind? Let's connect!
            </p>
            <div className="flex items-center mb-4 hover:transform hover:translate-x-2 transition-transform duration-300">
              <span className="text-secondary mr-4">
                <Mail size={24} className="animate-pulse" />
              </span>
              <a
                href="mailto:gautm.shah1404@gmail.com"
                className="text-white no-underline transition-colors duration-300 hover:text-secondary"
              >
                gautm.shah1404@gmail.com
              </a>
            </div>
            <div className="flex items-center mb-4 hover:transform hover:translate-x-2 transition-transform duration-300">
              <span className="text-secondary mr-4">
                <Phone size={24} className="animate-pulse" />
              </span>
              <a
                href="tel:+918511854391"
                className="text-white no-underline transition-colors duration-300 hover:text-secondary"
              >
                +91 8511854391
              </a>
            </div>
            <div className="flex gap-4 mt-8">
              <a
                href="https://www.linkedin.com/in/gautam-shah-558090246"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[rgba(255,255,255,0.1)] rounded-full flex items-center justify-center text-white no-underline transition-all duration-300 hover:bg-primary hover:scale-110 hover:rotate-6"
                title="LinkedIn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .773 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .773 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/Gautam-Shah-14"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[rgba(255,255,255,0.1)] rounded-full flex items-center justify-center text-white no-underline transition-all duration-300 hover:bg-primary hover:scale-110 hover:rotate-6"
                title="GitHub"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.236 1.839 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.495 11.495 0 013.003-.404c1.02.005 2.045.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.102.81 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

