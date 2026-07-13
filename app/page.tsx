import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/shared/aurora";
import { RevealBlock } from "@/components/shared/motion";
import {
  QrCode,
  Shield,
  Wrench,
  BarChart3,
  Scan,
  ArrowRight,
  Check,
  Sparkles,
  Clock,
  Bell,
  Globe,
  Activity,
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500">
              <QrCode className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Maintain<span className="text-indigo-600">IQ</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-indigo-600 font-medium hover:bg-indigo-700">
                Get Started Free
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="grain relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-cyan-950/20" />
          <Aurora />

          <RevealBlock className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36 lg:py-44">
            <div className="text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Sparkles className="size-4" />
                AI-Powered Maintenance Intelligence
              </div>

              <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Maintenance that runs{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  itself.
                </span>
                <br />
                <span className="text-muted-foreground text-4xl sm:text-5xl lg:text-6xl">
                  Diagnosed by AI. Trusted by teams.
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
                MaintainIQ turns every physical asset into a tracked, QR-coded
                record with a public page, instant AI issue diagnosis, a complete
                maintenance workflow, and a permanent, tamper-evident audit
                history — so nothing slips through the cracks.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-indigo-600 px-8 text-base font-medium hover:bg-indigo-700"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="px-8 text-base font-medium">
                    Explore Features
                  </Button>
                </Link>
              </div>

              <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[
                  { value: "100%", label: "Asset Visibility" },
                  { value: "AI", label: "Instant Triage" },
                  { value: "0", label: "Blind Spots" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {item.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealBlock>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                How MaintainIQ Works
              </h2>
              <p className="mt-4 text-muted-foreground">
                From the first scan to a verified fix — four steps, zero friction
              </p>
            </div>
            <RevealBlock>
              <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  step: "01",
                  icon: QrCode,
                  title: "Tag Assets",
                  desc: "Generate unique QR codes for every asset. Each code maps permanently to one asset.",
                  color: "from-indigo-500 to-indigo-600",
                },
                {
                  step: "02",
                  icon: Scan,
                  title: "Scan & Report",
                  desc: "Anyone scans the QR to view asset info and report issues without logging in.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  step: "03",
                  icon: Sparkles,
                  title: "AI Diagnoses",
                  desc: "Gemini AI analyzes the complaint and generates structured diagnostics instantly.",
                  color: "from-cyan-500 to-cyan-600",
                },
                {
                  step: "04",
                  icon: Wrench,
                  title: "Fix & Track",
                  desc: "Technicians resolve issues. Every action is logged in an immutable audit trail.",
                  color: "from-emerald-500 to-emerald-600",
                },
              ].map((item, i) => (
                <div key={item.step} className="relative text-center">
                  {i < 3 && (
                    <div className="absolute right-0 top-8 hidden h-px w-full bg-gradient-to-r from-transparent via-border to-transparent md:block" />
                  )}
                  <div
                    className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}
                  >
                    <item.icon className="size-7 text-white" />
                  </div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Step {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </RevealBlock>
          </div>
        </section>

        {/* Features Grid */}
        <section
          id="features"
          className="border-y bg-muted/30 py-24"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Built for Real Operations
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every feature designed for production maintenance teams
              </p>
            </div>
            <RevealBlock>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: QrCode,
                  title: "QR Code System",
                  desc: "Auto-generated QR codes for every asset. Download, print labels, and test mobile scanning.",
                  color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
                },
                {
                  icon: Shield,
                  title: "Role-Based Access",
                  desc: "Admin, Technician, Reporter, Supervisor roles with server-side enforcement. Never rely on UI hiding.",
                  color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
                },
                {
                  icon: Sparkles,
                  title: "AI Issue Triage",
                  desc: "Gemini AI converts natural language into structured diagnostics with confidence scores.",
                  color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
                },
                {
                  icon: Wrench,
                  title: "Maintenance Workflow",
                  desc: "Complete lifecycle: Reported → Assigned → In Progress → Resolved → Closed with valid transitions.",
                  color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
                },
                {
                  icon: Activity,
                  title: "Immutable History",
                  desc: "Every action logged with actor, timestamp, and context. Never allow casual editing of audit trail.",
                  color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
                },
                {
                  icon: BarChart3,
                  title: "Operations Dashboard",
                  desc: "Real metrics: asset status, open issues, technician workload, priority distribution, upcoming services.",
                  color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
                },
                {
                  icon: Globe,
                  title: "Public Asset Pages",
                  desc: "Accessible without login. Shows safe info only. Anyone can report issues via QR scan.",
                  color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
                },
                {
                  icon: Bell,
                  title: "Smart Notifications",
                  desc: "Assignment alerts, status changes, maintenance completions. Future email-ready architecture.",
                  color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
                },
                {
                  icon: Clock,
                  title: "Preventive Scheduling",
                  desc: "Track service dates, upcoming maintenance, and prevent failures before they happen.",
                  color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}
                  >
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </RevealBlock>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Enterprise Tech Stack
              </h2>
              <p className="mt-4 text-muted-foreground">
                Built with production-grade technologies
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                "Next.js 16",
                "React 19",
                "TypeScript",
                "Prisma ORM",
                "Neon PostgreSQL",
                "Clerk Auth",
                "Gemini AI",
                "Tailwind CSS",
                "Base UI",
                "Zod Validation",
                "PostgreSQL",
                "Vercel Deploy",
              ].map((tech) => (
                <div
                  key={tech}
                  className="flex items-center justify-center rounded-xl border bg-card p-4 text-sm font-medium transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-y">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA4Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-30" />
          <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to modernize your maintenance?
            </h2>
            <p className="mb-10 text-lg text-white/80">
              Give every asset a voice, every technician a clear queue, and every
              manager a real-time view of operations.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white px-8 text-base font-medium text-indigo-700 hover:bg-white/90"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              {["No credit card required", "Free tier available", "Deploy to Vercel"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="size-4" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500">
                <QrCode className="size-4 text-white" />
              </div>
              <span className="font-bold">MaintainIQ</span>
            </Link>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/sign-in" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="hover:text-foreground transition-colors">
                Sign Up
              </Link>
              <Link href="#features" className="hover:text-foreground transition-colors">
                Features
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MaintainIQ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
