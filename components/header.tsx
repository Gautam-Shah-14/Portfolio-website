import Link from "next/link"
import { navLinks } from "@/lib/data"

export default function Header() {
  return (
    <header className="py-5 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-white no-underline">
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
          GS
        </span>
      </Link>
      <nav>
        <ul className="flex list-none">
          {navLinks.map(({ label, href }) => (
            <li key={href} className="ml-8">
              <Link
                href={href}
                className="text-white no-underline transition-all duration-300 hover:text-primary hover:translate-y-[-2px] inline-block"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
