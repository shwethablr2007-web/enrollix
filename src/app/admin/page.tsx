"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Member = {
  id: string;
  name: string;
  domain: string;
  position: string;
  srn: string;
  email: string;
  linkedin_url: string | null;
  github_url: string | null;
  branch: string;
  semester: number;
  bio: string | null;
  photo_url: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/members", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not load applications.");
        return;
      }

      setMembers((result.members ?? []) as Member[]);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      void loadMembers();
    }
  }, [loggedIn, loadMembers]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Admin login failed.");
        return;
      }

      setPassword("");
      setLoggedIn(true);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function updateStatus(
    id: string,
    status: "approved" | "rejected"
  ) {
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not update the application.");
        return;
      }

      setNotice(`Application ${status} successfully.`);
      await loadMembers();
    } catch {
      setError("Could not connect to the server. Please try again.");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setLoggedIn(false);
      setEmail("");
      setPassword("");
      setMembers([]);
      setError("");
      setNotice("");
    }
  }

  const pending = members.filter((member) => member.status === "pending");
  const approved = members.filter((member) => member.status === "approved");
  const rejected = members.filter((member) => member.status === "rejected");

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B12] px-5 py-10 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8"
        >
          <a href="/" className="text-xl font-bold">
            VYNTHRA<span className="text-violet-400">.</span>
          </a>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Administration
            </p>
            <h1 className="mt-3 text-3xl font-bold">Admin Login</h1>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Sign in to review member applications.
            </p>
          </div>

          <label className="block space-y-2 text-sm text-gray-300">
            Admin email
            <input
              className="w-full rounded-xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none focus:border-violet-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              autoComplete="username"
              required
            />
          </label>

          <label className="block space-y-2 text-sm text-gray-300">
            Password
            <input
              className="w-full rounded-xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none focus:border-violet-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-xl bg-violet-500 px-6 py-3 font-semibold hover:bg-violet-400 disabled:opacity-50"
          >
            {loginLoading ? "Signing in..." : "Sign in →"}
          </button>

          <a
            href="/"
            className="block text-center text-sm text-gray-400 hover:text-white"
          >
            ← Back to home
          </a>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080B12] px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a href="/" className="text-xl font-bold">
              VYNTHRA<span className="text-violet-400">.</span>
            </a>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-400">
              Review and manage member applications.
            </p>
          </div>

          <button
            onClick={() => void handleLogout()}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            Sign out
          </button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total applications", count: members.length },
            { label: "Pending", count: pending.length },
            { label: "Approved", count: approved.length },
            { label: "Rejected", count: rejected.length },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="mt-3 text-3xl font-bold">{item.count}</p>
            </div>
          ))}
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300"
          >
            {notice}
          </p>
        )}

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Member applications</h2>
              <p className="mt-1 text-sm text-gray-400">
                Review each profile before approving it.
              </p>
            </div>

            <button
              onClick={() => void loadMembers()}
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading && members.length === 0 ? (
            <p className="mt-8 text-gray-400">Loading applications...</p>
          ) : members.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 p-8 text-center text-gray-400">
              No applications found yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {members.map((member) => (
                <article
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="h-20 w-20 rounded-xl border border-white/10 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-xl font-semibold">
                        {member.name}
                      </h3>
                      <p className="mt-1 text-sm text-violet-300">
                        {member.position} · {member.domain}
                      </p>
                      <p className="mt-1 break-all text-sm text-gray-400">
                        {member.email}
                      </p>
                      <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-gray-300">
                        {member.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm text-gray-400 sm:grid-cols-2">
                    <p>SRN: {member.srn}</p>
                    <p>Branch: {member.branch}</p>
                    <p>Semester: {member.semester}</p>
                    <p>
                      Submitted:{" "}
                      {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {member.bio && (
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">
                      {member.bio}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
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

                  {member.status === "pending" && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                      <button
                        onClick={() =>
                          void updateStatus(member.id, "approved")
                        }
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold hover:bg-green-500"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          void updateStatus(member.id, "rejected")
                        }
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}