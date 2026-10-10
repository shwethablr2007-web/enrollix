
import Link from "next/link";

const pages = [
  {
    number: "01",
    title: "Member Registration",
    description:
      "Create your profile and preview your member card in real time.",
    href: "/register",
  },
  {
    number: "02",
    title: "Admin Moderation",
    description:
      "Review member applications and manage approval status.",
    href: "/admin",
  },
  {
    number: "03",
    title: "Meet the Members",
    description:
      "Discover approved members and explore their domains.",
    href: "/team",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          VYNTHRA<span className="text-violet-400">.</span>
        </Link>
        <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-gray-400">
          EM BRIONE · RECRUITMENT PROJECT
        </span>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-28">
        <div className="max-w-3xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            A new way to connect
          </p>

          <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            Every member.
            <br />
            One <span className="text-violet-400">community.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
            A modern onboarding and moderation platform built to make
            registration, profile discovery, and member approvals simple.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-violet-500 px-6 py-3 font-semibold transition hover:bg-violet-400"
            >
              Register now →
            </Link>
            <Link
              href="/team"
              className="rounded-xl border border-white/15 px-6 py-3 font-semibold transition hover:bg-white/5"
            >
              Explore directory
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {pages.map((page) => (
            <Link
              href={page.href}
              key={page.number}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/[0.06]"
            >
              <span className="text-sm text-violet-400">
                {page.number}
              </span>
              <h2 className="mt-8 text-xl font-semibold">
                {page.title}
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                {page.description}
              </p>
              <p className="mt-6 text-sm font-medium text-violet-300">
                Explore feature ↗
              </p>
            </Link>
          ))}
        </div>

        <footer className="mt-24 border-t border-white/10 pt-6 text-sm text-gray-500">
          Vynthra · Built for The Embrione recruitment challenge
        </footer>
      </section>
    </main>
  );
}
