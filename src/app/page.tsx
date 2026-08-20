import Link from "next/link";

const principles = [
  ["Secure by design", "Supabase authentication and server-enforced access keep identity and application roles separate."],
  ["Care that can travel", "A foundation for clinicians and appropriate patients to stay connected beyond hospital walls."],
  ["People remain in control", "MediSync supports healthcare professionals; it does not replace clinical judgement."],
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
            Connected care, thoughtfully delivered
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-slate-950 sm:text-6xl">
            More room for care, wherever patients are.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            MediSync is building a secure digital bridge between patients, doctors, pharmacists, and hospital teams—starting with trusted identity and role-based access.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800" href="/register">
              Create your account
            </Link>
            <Link className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-400" href="/login">
              Sign in securely
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-slate-950 p-8 text-white shadow-2xl shadow-teal-950/10 sm:p-10">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-teal-500/20 blur-3xl" />
          <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Phase 1 foundation</p>
          <h2 className="relative mt-4 text-3xl font-semibold tracking-tight">One trusted identity. The right portal.</h2>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
            {['Patient', 'Doctor', 'Pharmacist', 'Administrator'].map((role, index) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5" key={role}>
                <span className="text-sm text-slate-400">0{index + 1}</span>
                <p className="mt-6 font-semibold">{role}</p>
                <p className="mt-1 text-sm text-slate-400">Protected workspace</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-8">
          {principles.map(([title, description]) => (
            <article key={title}>
              <span className="mb-5 block h-1 w-10 rounded-full bg-teal-600" />
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
