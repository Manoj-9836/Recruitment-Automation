import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginScreenProps = {
  username: string;
  loginError: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: (role: "hr" | "candidate") => void;
  isLoading?: boolean;
};

export default function LoginScreen({
  username,
  loginError,
  password,
  setUsername,
  setPassword,
  onLogin,
  isLoading = false,
}: LoginScreenProps) {
  const [loginTab, setLoginTab] = useState<"hr" | "candidate">("hr");
  const portalTitle = loginTab === "hr" ? "HR Portal" : "Candidate Portal";
  const portalSubtitle =
    loginTab === "hr"
      ? "Access the recruitment dashboard"
      : "Access your assessment rounds";

  const handleLogin = () => {
    onLogin(loginTab);
  };

  return (
    <motion.div
      key="login-screen"
      className="relative flex min-h-screen items-center bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 lg:pr-4"
        >
          <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">Recruitment Automation Portal</Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl" style={{ fontFamily: "Manrope, sans-serif" }}>Intelligent Hiring Workspace</h1>
          <p className="max-w-xl text-sm text-slate-600 sm:text-base">
            One portal for HR and candidates. Screen resumes, schedule interviews, run rounds, and track outcomes with
            consistent workflow visibility.
          </p>
          <div className="flex flex-wrap gap-3">
            <FeaturePill icon={<Search className="size-4" />} text="ATS Screening" />
            <FeaturePill icon={<Calendar className="size-4" />} text="Interviews" />
            <FeaturePill icon={<FileText className="size-4" />} text="Report Cards" />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 pt-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:p-8 sm:pt-10 lg:p-9 lg:pt-10"
        >
          <div className="mb-6">
            <Tabs value={loginTab} onValueChange={(v) => setLoginTab(v as "hr" | "candidate")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
                <TabsTrigger value="hr" className="rounded-lg border border-transparent bg-transparent font-medium text-slate-500 shadow-none transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                  HR Login
                </TabsTrigger>
                <TabsTrigger value="candidate" className="rounded-lg border border-transparent bg-transparent font-medium text-slate-500 shadow-none transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                  Candidate Login
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-1">
                <h2 className="text-3xl font-semibold text-slate-900">{portalTitle}</h2>
                <p className="text-sm text-slate-600">{portalSubtitle}</p>
              </div>

              <TabsContent value="hr" className="mt-6 space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="hr-username">Email</Label>
                    <Input
                      id="hr-username"
                      name="hr-username-no-autofill"
                      autoComplete="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter email"
                      className="login-input h-11 !border !border-gray-300 !bg-white !text-gray-900 placeholder:!text-gray-400 dark:!border-gray-300 dark:!bg-white dark:!text-gray-900 dark:placeholder:!text-gray-400 focus:!outline-none focus-visible:!border-slate-800 focus-visible:!ring-2 focus-visible:!ring-slate-800/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hr-password">Password</Label>
                    <Input
                      id="hr-password"
                      name="hr-password-no-autofill"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="login-input h-11 !border !border-gray-300 !bg-white !text-gray-900 placeholder:!text-gray-400 dark:!border-gray-300 dark:!bg-white dark:!text-gray-900 dark:placeholder:!text-gray-400 focus:!outline-none focus-visible:!border-slate-800 focus-visible:!ring-2 focus-visible:!ring-slate-800/20"
                    />
                  </div>

                  {loginError ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{loginError}</p>
                  ) : null}

                  <Button
                    className="h-11 w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="candidate" className="mt-6 space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="candidate-email">Email Address</Label>
                    <Input
                      id="candidate-email"
                      name="candidate-email-no-autofill"
                      autoComplete="off"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your.email@example.com"
                      className="login-input h-11 !border !border-gray-300 !bg-white !text-gray-900 placeholder:!text-gray-400 dark:!border-gray-300 dark:!bg-white dark:!text-gray-900 dark:placeholder:!text-gray-400 focus:!outline-none focus-visible:!border-slate-800 focus-visible:!ring-2 focus-visible:!ring-slate-800/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="candidate-password">Password</Label>
                    <Input
                      id="candidate-password"
                      name="candidate-password-no-autofill"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="login-input h-11 !border !border-gray-300 !bg-white !text-gray-900 placeholder:!text-gray-400 dark:!border-gray-300 dark:!bg-white dark:!text-gray-900 dark:placeholder:!text-gray-400 focus:!outline-none focus-visible:!border-slate-800 focus-visible:!ring-2 focus-visible:!ring-slate-800/20"
                    />
                  </div>

                  <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
                    <span className="font-medium">Credentials sent via email</span> when the HR team authorizes your application
                  </p>

                  {loginError ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{loginError}</p>
                  ) : null}

                  <Button
                    className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      "Login to Portal"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FeaturePill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="inline-flex min-w-[152px] items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 shadow-sm sm:text-sm">
      <span className="text-emerald-600">{icon}</span>
      {text}
    </div>
  );
}
