
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  name: string;
  domain: string;
  position: string;
  branch: string;
  semester: number;
  bio: string | null;
  photo_url: string;
  linkedin_url: string | null;
  github_url: string | null;
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [domainFilter, setDomainFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApprovedMembers() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("members")
        .select(
          "id, name, domain, position, branch, semester, bio, photo_url, linkedin_url, github_url"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(`Could not load team members: ${fetchError.message}`);
      } else {
        setMembers((data ?? []) as Member[]);
      }

      setLoading(false);
    }

    void loadApprovedMembers();
  }, []);

  const domains = [
    "All",
    ...Array.from(new Set(members.map((member) => member.domain))).sort(),
  ];

  const positions = [
    "All",
    ...Array.from(new Set(members.map((member) => member.position))).sort(),
  ];

  const filteredMembers = members.filter((member) => {
    const matchesDomain =
      domainFilter === "All" || member.domain === domainFilter;
    const matchesPosition =
      positionFilter === "All" || member.position === positionFilter;

    return matchesDomain && matchesPosition;
  });

  return (
    <main className="min-h-screen bg-[#080B12] px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a href="/" className="text-xl font-bold">
            VYNTHRA<span className="text-violet-400">.</span>
          </a>

          <a
            href="/register"
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400"
          >
            Join the community →
          </a>
        </header>

        <section className="py-16 text-center md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            The Embrione · PES University
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Meet the <span className="text-violet-400">Team.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Discover the people behind our community. Explore their domains,
            learn about their interests, and connect with fellow members.
          </p>
        </section>

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Member directory</h2>
              <p className="mt-1 text-sm text-gray-400">
                {members.length} approved{" "}
                {members.length === 1 ? "member" : "members"}
              </p>
            </div>

            <button
              onClick={() => {
                setDomainFilter("All");
                setPositionFilter("All");
              }}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
            >
              Clear filters
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-gray-300">
              Filter by domain
              <select
                value={domainFilter}
                onChange={(event) => setDomainFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none focus:border-violet-400"
              >
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain === "All" ? "All domains" : domain}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-gray-300">
              Filter by position
              <select
                value={positionFilter}
                onChange={(event) => setPositionFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none focus:border-violet-400"
              >
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position === "All" ? "All positions" : position}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {loading && (
          <div className="py-16 text-center text-gray-400">
            Loading team members...
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300"
          >
            {error}
          </div>
        )}

        {!loading && !error && filteredMembers.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold">
              {members.length === 0
                ? "Our directory is growing."
                : "No matching members."}
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-gray-400">
              {members.length === 0
                ? "Approved member profiles will appear here. Apply to become part of the community."
                : "Try another domain or position, or clear your filters."}
            </p>

            {members.length === 0 && (
              <a
                href="/register"
                className="mt-6 inline-block rounded-xl bg-violet-500 px-5 py-3 font-semibold hover:bg-violet-400"
              >
                Register now →
              </a>
            )}
          </div>
        )}

        {!loading && !error && filteredMembers.length > 0 && (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <article
                key={member.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-violet-400/50"
              >
                <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={member.photo_url}
                      alt={`${member.name}'s profile`}
                      className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 object-cover"
                    />

                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-semibold">
                        {member.name}
                      </h2>

                      <p className="mt-1 text-sm text-violet-300">
                        {member.position}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {member.domain}
                      </p>
                    </div>
                  </div>

                  {member.bio ? (
                    <p className="mt-5 min-h-16 whitespace-pre-wrap break-words text-sm leading-6 text-gray-400">
                      {member.bio}
                    </p>
                  ) : (
                    <p className="mt-5 min-h-16 text-sm italic text-gray-500">
                      No bio added yet.
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                      {member.branch}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                      Semester {member.semester}
                    </span>
                  </div>

                  {(member.linkedin_url || member.github_url) && (
                    <div className="mt-5 flex gap-4 border-t border-white/10 pt-4 text-sm">
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-300 hover:underline"
                        >
                          LinkedIn ↗
                        </a>
                      )}

                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-300 hover:underline"
                        >
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="mt-20 border-t border-white/10 py-6 text-center text-sm text-gray-500">
          Vynthra · The Embrione · PES University
        </footer>
      </div>
    </main>
  );
}
