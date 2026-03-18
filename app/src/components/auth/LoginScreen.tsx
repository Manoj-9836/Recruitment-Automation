import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginScreenProps = {
  username: string;
  loginError: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
  onContinueGoogle: () => void;
};

export default function LoginScreen({
  username,
  loginError,
  password,
  setUsername,
  setPassword,
  onLogin,
  onContinueGoogle,
}: LoginScreenProps) {
  return (
    <motion.div
      key="login-screen"
      className="relative flex min-h-screen items-center px-4 py-6 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 lg:pr-4"
        >
          <Badge className="border border-emerald-400/40 bg-emerald-500/20 text-emerald-200">Recruitment Automation Portal</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Intelligent Hiring Workspace</h1>
          <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
            One portal for HR and candidates. Screen resumes, schedule interviews, run rounds, and track outcomes with
            consistent workflow visibility.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FeaturePill icon={<Search className="size-4" />} text="ATS Screening" />
            <FeaturePill icon={<Calendar className="size-4" />} text="Interview Scheduling" />
            <FeaturePill icon={<FileText className="size-4" />} text="Report Cards" />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="glass rounded-2xl border border-zinc-700/70 p-6 shadow-2xl sm:p-8 lg:p-9"
        >
          <h2 className="mb-1 text-4xl/none font-semibold">Login</h2>
          <p className="mb-6 mt-2 text-base text-zinc-400">Use your credentials. No registration needed.</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-zinc-900/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-zinc-900/80"
              />
            </div>

            <p className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-400">
              HR login: <span className="font-medium text-zinc-200">hr@company.com / Hr123</span>. Any Gmail account logs in as candidate.
            </p>

            {loginError ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{loginError}</p>
            ) : null}

            <Button className="w-full bg-emerald-500 text-black hover:bg-emerald-400" onClick={onLogin}>
              Login
            </Button>
            <Button variant="outline" className="w-full border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900" onClick={onContinueGoogle}>
              Continue with Google
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FeaturePill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-200 sm:text-sm">
      <span className="text-emerald-300">{icon}</span>
      {text}
    </div>
  );
}
