import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Pencil,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserCircle2,
  UserX2,
  Users,
  Video,
  X,
} from "lucide-react";
import { ATS_THRESHOLD } from "@/data/recruitment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JobPosting, ResumeCandidate } from "@/types/recruitment";

type HRDashboardProps = {
  resumes: ResumeCandidate[];
  setResumes: Dispatch<SetStateAction<ResumeCandidate[]>>;
  jobs: JobPosting[];
  setJobs: Dispatch<SetStateAction<JobPosting[]>>;
  onLogout: () => void;
};

export default function HRDashboard({ resumes, setResumes, jobs, setJobs, onLogout }: HRDashboardProps) {
  const [activeResume, setActiveResume] = useState<ResumeCandidate | null>(null);
  const [openResumeModal, setOpenResumeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lowAtsPromptDismissed, setLowAtsPromptDismissed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "job-postings" | "settings">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAts, setNewAts] = useState("85");
  const [newJdFile, setNewJdFile] = useState("");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAts, setEditAts] = useState("");
  const [editJdFile, setEditJdFile] = useState("");

  const lowAtsResumes = useMemo(
    () => resumes.filter((item) => item.atsScore < ATS_THRESHOLD && item.status !== "rejected"),
    [resumes],
  );
  const showRejectPrompt = lowAtsResumes.length > 0 && !lowAtsPromptDismissed;

  const completedInterviews = resumes.filter((item) => item.status === "interview_completed");
  const scheduledInterviews = resumes.filter((item) => item.status === "selected").length;
  const pendingCount = resumes.filter((item) => item.status === "pending").length;
  const rejectedCount = resumes.filter((item) => item.status === "rejected").length;

  const openResume = (resume: ResumeCandidate) => {
    setActiveResume(resume);
    setOpenResumeModal(true);
  };

  const rejectLowAtsResumes = () => {
    const count = lowAtsResumes.length;
    setResumes((prev) =>
      prev.map((candidate) =>
        candidate.atsScore < ATS_THRESHOLD
          ? {
              ...candidate,
              status: "rejected" as const,
            }
          : candidate,
      ),
    );
    setLowAtsPromptDismissed(true);
    if (count > 0) {
      toast.success(`${count} low ATS profile(s) rejected.`);
    }
  };

  const keepLowAtsResumes = () => {
    setLowAtsPromptDismissed(true);
    toast.info("Manual review mode enabled for low ATS profiles.");
  };

  const rejectCandidate = (candidateId: string) => {
    const updated = resumes.map((candidate) =>
      candidate.id === candidateId
        ? {
            ...candidate,
            status: "rejected" as const,
          }
        : candidate,
    );

    setResumes(updated);
    const updatedActive = updated.find((item) => item.id === candidateId) ?? null;
    setActiveResume(updatedActive);

    if (updatedActive) {
      toast.warning(`${updatedActive.candidateName} marked as rejected.`);
    }
  };

  const selectForInterview = (candidateId: string) => {
    const meetingId = Math.floor(100000000 + Math.random() * 899999999);
    const updated = resumes.map((candidate) =>
      candidate.id === candidateId
        ? {
            ...candidate,
            status: "selected" as const,
            zoomLink: `https://zoom.us/j/${meetingId}?pwd=RecruitAuto`,
          }
        : candidate,
    );

    setResumes(updated);
    const updatedActive = updated.find((item) => item.id === candidateId) ?? null;
    setActiveResume(updatedActive);

    if (updatedActive) {
      toast.success(`Interview scheduled for ${updatedActive.candidateName}.`);
    }
  };

  const addJobRole = () => {
    if (!newTitle.trim() || !newJdFile.trim()) {
      toast.error("Please provide job title and JD PDF file.");
      return;
    }

    const createdTitle = newTitle.trim();
    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      title: createdTitle,
      requiredAts: Number(newAts) || ATS_THRESHOLD,
      jdFileName: newJdFile.trim(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setNewTitle("");
    setNewAts("85");
    setNewJdFile("");
    toast.success(`Job role added: ${createdTitle}`);
  };

  const startEditJob = (job: JobPosting) => {
    setEditingJobId(job.id);
    setEditTitle(job.title);
    setEditAts(String(job.requiredAts));
    setEditJdFile(job.jdFileName);
  };

  const cancelEditJob = () => {
    setEditingJobId(null);
    setEditTitle("");
    setEditAts("");
    setEditJdFile("");
  };

  const saveEditJob = (jobId: string) => {
    if (!editTitle.trim() || !editJdFile.trim()) {
      toast.error("Please provide title and JD file before saving.");
      return;
    }

    const updatedTitle = editTitle.trim();

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              title: updatedTitle,
              requiredAts: Number(editAts) || ATS_THRESHOLD,
              jdFileName: editJdFile.trim(),
            }
          : job,
      ),
    );

    cancelEditJob();
    toast.success(`Job role updated: ${updatedTitle}`);
  };

  const deleteJobRole = (jobId: string) => {
    const target = jobs.find((job) => job.id === jobId);
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    if (editingJobId === jobId) {
      cancelEditJob();
    }
    toast.info(target ? `Deleted job role: ${target.title}` : "Job role deleted.");
  };

  const filteredResumes = resumes.filter((resume) => {
    const haystack = `${resume.candidateName} ${resume.jobRole}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const groupedResumes = useMemo(() => {
    const normalizedJobOrder = new Map(jobs.map((job, index) => [job.title.toLowerCase(), index]));
    const sorted = [...filteredResumes].sort((a, b) => {
      const aOrder = normalizedJobOrder.get(a.jobRole.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = normalizedJobOrder.get(b.jobRole.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      if (a.jobRole !== b.jobRole) {
        return a.jobRole.localeCompare(b.jobRole);
      }

      if (a.status !== b.status) {
        const statusOrder: Record<ResumeCandidate["status"], number> = {
          pending: 0,
          selected: 1,
          interview_completed: 2,
          rejected: 3,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }

      if (a.suitability !== b.suitability) {
        return b.suitability - a.suitability;
      }

      return a.candidateName.localeCompare(b.candidateName);
    });

    const grouped = new Map<string, ResumeCandidate[]>();
    for (const resume of sorted) {
      const bucket = grouped.get(resume.jobRole) ?? [];
      bucket.push(resume);
      grouped.set(resume.jobRole, bucket);
    }

    return Array.from(grouped.entries()).map(([jobRole, candidates]) => ({
      jobRole,
      candidates,
      requiredAts: jobs.find((job) => job.title.toLowerCase() === jobRole.toLowerCase())?.requiredAts,
    }));
  }, [filteredResumes, jobs]);

  const getStatusLabel = (status: ResumeCandidate["status"]) => {
    if (status === "selected") {
      return "Interview Scheduled";
    }
    if (status === "interview_completed") {
      return "Completed";
    }
    if (status === "rejected") {
      return "Rejected";
    }
    return "Applied";
  };

  const getStatusClass = (status: ResumeCandidate["status"]) => {
    if (status === "selected") {
      return "border border-amber-400/30 bg-amber-500/20 text-amber-300";
    }
    if (status === "interview_completed") {
      return "border border-emerald-400/30 bg-emerald-500/20 text-emerald-300";
    }
    if (status === "rejected") {
      return "border border-red-400/30 bg-red-500/20 text-red-300";
    }
    return "border border-sky-400/30 bg-sky-500/20 text-sky-300";
  };

  const handleMenuNavigation = (menu: "dashboard" | "job-postings" | "settings") => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout();
  };

  const renderSidebarContent = (isMobile = false) => (
    <>
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_rgba(14,165,233,0.22)]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-zinc-100">HireOS</p>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">AI Assistant</p>
          </div>
        </div>

        {isMobile ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-200 transition hover:bg-zinc-800"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <div className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Menu</div>
      <div className="space-y-2">
        <button
          onClick={() => handleMenuNavigation("dashboard")}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
            activeMenu === "dashboard"
              ? "border border-sky-400/30 bg-sky-500/15 text-sky-200"
              : "border border-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-200"
          }`}
        >
          <LayoutDashboard className="size-4" /> Dashboard
        </button>
        <button
          onClick={() => handleMenuNavigation("job-postings")}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
            activeMenu === "job-postings"
              ? "border border-sky-400/30 bg-sky-500/15 text-sky-200"
              : "border border-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-200"
          }`}
        >
          <Briefcase className="size-4" /> Job Postings
        </button>
        <button
          onClick={() => handleMenuNavigation("settings")}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
            activeMenu === "settings"
              ? "border border-sky-400/30 bg-sky-500/15 text-sky-200"
              : "border border-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-200"
          }`}
        >
          <Settings className="size-4" /> Settings
        </button>
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/75 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
              <UserCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-100">Sarah Johnson</p>
              <p className="text-xs text-zinc-400">HR</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start rounded-2xl text-zinc-300 hover:bg-zinc-900/80" onClick={handleLogout}>
          <LogOut className="mr-2 size-4" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <motion.div
      key="hr-dashboard"
      className="relative min-h-screen overflow-hidden bg-black"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(249,115,22,0.08),transparent_32%)]" />

      <div className="relative min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-72 overflow-y-auto border-r border-zinc-800/70 bg-zinc-950/75 p-6 backdrop-blur-md lg:flex lg:flex-col">
          {renderSidebarContent()}
        </aside>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="h-screen w-72 overflow-y-auto border-r border-zinc-800/70 bg-zinc-950/95 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {renderSidebarContent(true)}
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="overflow-x-hidden p-4 sm:p-6 lg:p-10 lg:ml-72">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/15 text-sky-300">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">HireOS</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">AI Assistant</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="group inline-flex size-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80"
            >
              <span className="relative block h-4 w-5">
                <motion.span
                  className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-zinc-200"
                  animate={isMobileMenuOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.22 }}
                />
                <motion.span
                  className="absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-zinc-200"
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-zinc-200"
                  animate={isMobileMenuOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.22 }}
                />
              </span>
            </button>
          </div>

          <div className="mb-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/65 px-4 py-4 shadow-[0_15px_70px_-30px_rgba(14,165,233,0.35)] backdrop-blur-md sm:px-7 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <BarChart3 className="size-3.5" /> Live Hiring Cycle
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Resume Pipeline</h1>
                <p className="text-zinc-400">Review and shortlist AI-analyzed candidate profiles.</p>
              </div>
              <div className="relative w-full xl:w-96">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidates, role, status..."
                  className="h-11 rounded-2xl border-zinc-800/80 bg-zinc-900/85 pl-10 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total Profiles" value={resumes.length} icon={<Users className="size-4" />} tone="sky" />
              <MetricCard label="Pending Review" value={pendingCount} icon={<Clock3 className="size-4" />} tone="amber" />
              <MetricCard label="Interviews" value={scheduledInterviews} icon={<Calendar className="size-4" />} tone="emerald" />
              <MetricCard label="Rejected" value={rejectedCount} icon={<UserX2 className="size-4" />} tone="red" />
            </div>
          </div>

          {activeMenu === "dashboard" ? (
            <>
              {groupedResumes.length === 0 ? (
                <EmptyState text="No resumes found for this filter." />
              ) : (
                <div className="space-y-5">
                  {groupedResumes.map((group, groupIndex) => (
                    <motion.section
                      key={group.jobRole}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: groupIndex * 0.05 }}
                      className="overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/90 bg-zinc-950/65 px-4 py-3 sm:px-5">
                        <div>
                          <p className="text-sm font-semibold tracking-wide text-zinc-100">{group.jobRole}</p>
                          <p className="text-xs text-zinc-400">{group.candidates.length} candidate(s)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {typeof group.requiredAts === "number" ? (
                            <Badge className="border border-sky-400/30 bg-sky-500/15 text-sky-300">Required ATS {group.requiredAts}%</Badge>
                          ) : null}
                          <Badge className="border border-zinc-700 bg-zinc-900 text-zinc-300">List View</Badge>
                        </div>
                      </div>

                      <div className="divide-y divide-zinc-800/70">
                        {group.candidates.map((resume) => {
                          const isLowAts = resume.atsScore < ATS_THRESHOLD;
                          const isRejected = resume.status === "rejected";

                          return (
                            <button
                              key={resume.id}
                              onClick={() => openResume(resume)}
                              className={`group flex w-full flex-col gap-3 px-4 py-4 text-left transition sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                                isRejected
                                  ? "bg-zinc-950/45 text-zinc-500 hover:bg-zinc-900/60"
                                  : isLowAts
                                    ? "bg-zinc-950/30 text-zinc-300 hover:bg-zinc-900/65"
                                    : "bg-zinc-950/20 text-zinc-100 hover:bg-zinc-900/70"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex size-8 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-xs font-semibold text-sky-200">
                                    {resume.candidateName.charAt(0).toUpperCase()}
                                  </span>
                                  <p className="truncate text-base font-semibold tracking-tight">{resume.candidateName}</p>
                                </div>
                                <p className="mt-1 truncate pl-10 text-sm text-zinc-400">{resume.email}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
                                <Badge className={resume.suitability >= ATS_THRESHOLD ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-300" : "border border-red-400/30 bg-red-500/20 text-red-300"}>
                                  {resume.suitability}% MATCH
                                </Badge>
                                <Badge className={resume.atsScore >= ATS_THRESHOLD ? "border border-sky-400/30 bg-sky-500/20 text-sky-300" : "border border-orange-400/30 bg-orange-500/20 text-orange-300"}>
                                  ATS {resume.atsScore}%
                                </Badge>
                                <Badge className={getStatusClass(resume.status)}>{getStatusLabel(resume.status)}</Badge>
                                <ChevronRight className="size-4 shrink-0 text-zinc-500 transition-transform duration-300 group-hover:translate-x-0.5" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.section>
                  ))}
                </div>
              )}

              <Card className="glass mt-6 overflow-hidden border-zinc-800/90 bg-zinc-950/65">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-zinc-100">
                    <ListChecks className="size-5 text-orange-300" /> Interview Completion Results
                  </CardTitle>
                  <CardDescription>After candidate completes interview, HR can review and book a Zoom call.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedInterviews.length === 0 ? (
                    <EmptyState text="No completed interviews yet." />
                  ) : (
                    completedInterviews.map((candidate) => (
                      <div key={candidate.id} className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-4 transition-colors hover:border-orange-400/30">
                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-100">{candidate.candidateName}</p>
                            <p className="text-xs text-zinc-400">{candidate.jobRole} | Suitability {candidate.suitability}%</p>
                          </div>
                          <Button className="h-auto w-full justify-center rounded-xl bg-orange-400 px-3 py-2 text-black hover:bg-orange-300 sm:w-auto sm:px-4 sm:py-2.5">
                            <Video className="mr-2 size-4 shrink-0" />
                            <span className="text-sm sm:hidden">Book Zoom Call</span>
                            <span className="hidden text-sm sm:inline">Book a Call for Zoom Meeting</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}

          {activeMenu === "job-postings" ? (
            <Card className="glass border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                  <Briefcase className="size-5 text-sky-300" /> Post Job
                </CardTitle>
                <CardDescription>Upload JD, title, and required ATS. Add multiple roles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., ML Engineer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requiredAts">Required ATS Score</Label>
                    <Input
                      id="requiredAts"
                      value={newAts}
                      onChange={(e) => setNewAts(e.target.value)}
                      type="number"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jdFile">JD PDF File Name</Label>
                    <Input
                      id="jdFile"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setNewJdFile(e.target.files?.[0]?.name ?? "")}
                      className="file:mr-3 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-sky-300 hover:file:bg-sky-500/30"
                    />
                    {newJdFile ? <p className="text-xs text-zinc-400">Selected: {newJdFile}</p> : null}
                  </div>
                </div>

                <Button onClick={addJobRole} className="bg-sky-500 text-black hover:bg-sky-400">
                  Add Job Role
                </Button>

                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium text-zinc-200">Current Job Roles</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {jobs.length === 0 ? (
                      <div className="col-span-full rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-400">
                        No job roles added yet.
                      </div>
                    ) : null}

                    {jobs.map((job) => {
                      const isEditing = editingJobId === job.id;

                      return (
                        <div key={job.id} className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-3 text-xs">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Job title" className="h-8 text-xs" />
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={editAts}
                                onChange={(e) => setEditAts(e.target.value)}
                                placeholder="Required ATS"
                                className="h-8 text-xs"
                              />
                              <Input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => setEditJdFile(e.target.files?.[0]?.name ?? editJdFile)}
                                className="h-8 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-sky-500/20 file:px-2 file:py-1 file:text-[10px] file:font-medium file:text-sky-300"
                              />
                              <p className="truncate text-[11px] text-zinc-500">JD: {editJdFile}</p>
                            </div>
                          ) : (
                            <>
                              <p className="font-semibold text-zinc-200">{job.title}</p>
                              <p className="text-zinc-400">Required ATS: {job.requiredAts}%</p>
                              <p className="truncate text-zinc-500">JD: {job.jdFileName}</p>
                            </>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            {isEditing ? (
                              <>
                                <Button className="h-7 bg-emerald-500 px-2 text-[11px] text-black hover:bg-emerald-400" onClick={() => saveEditJob(job.id)}>
                                  Save
                                </Button>
                                <Button variant="outline" className="h-7 border-zinc-700 px-2 text-[11px]" onClick={cancelEditJob}>
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button variant="outline" className="h-7 border-zinc-700 px-2 text-[11px]" onClick={() => startEditJob(job)}>
                                <Pencil className="mr-1 size-3" /> Edit
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              className="h-7 border-red-500/50 bg-red-500/10 px-2 text-[11px] text-red-300 hover:bg-red-500/20"
                              onClick={() => deleteJobRole(job.id)}
                            >
                              <Trash2 className="mr-1 size-3" /> Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeMenu === "settings" ? (
            <Card className="glass border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                  <Settings className="size-5 text-sky-300" /> Hiring Settings
                </CardTitle>
                <CardDescription>Current ATS policy and interview pipeline controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                  ATS rejection threshold is set to <span className="font-semibold text-zinc-100">{ATS_THRESHOLD}</span>.
                </div>
                <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                  Auto-mail and Zoom APIs are mocked in frontend and will be integrated in backend.
                </div>
              </CardContent>
            </Card>
          ) : null}
        </main>
      </div>

      <Dialog open={showRejectPrompt} onOpenChange={(open) => !open && setLowAtsPromptDismissed(true)}>
        <DialogContent className="border-zinc-700 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-300" /> HR Action Required: Low ATS Profiles
            </DialogTitle>
            <DialogDescription>
              {lowAtsResumes.length} candidate profile(s) are below ATS {ATS_THRESHOLD}. Choose one action: reject all now or continue with manual review and reject individually.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="border-zinc-700" onClick={keepLowAtsResumes}>
              Review and Reject Manually
            </Button>
            <Button className="bg-red-500 text-white hover:bg-red-400" onClick={rejectLowAtsResumes}>
              Reject All Low ATS Profiles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openResumeModal} onOpenChange={setOpenResumeModal}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-auto border-zinc-700 bg-zinc-950 p-0 text-zinc-100 sm:w-auto sm:max-w-4xl">
          {!activeResume ? null : (
            <>
              {/* Hero Section with Suitability Score */}
              <div className="space-y-1 border-b border-zinc-800 bg-gradient-to-br from-emerald-950/40 via-zinc-900/40 to-sky-950/40 px-6 py-8 sm:px-8">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-5xl">{activeResume.candidateName}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 pt-2 text-base text-zinc-300">
                        <Briefcase className="size-4 text-sky-400" /> {activeResume.jobRole}
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  {/* Circular Suitability Score */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950">
                      <div className="absolute inset-1 rounded-full" style={{
                        background: `conic-gradient(from 0deg, ${activeResume.suitability >= ATS_THRESHOLD ? '#10b981' : '#ef4444'} 0deg, ${activeResume.suitability >= ATS_THRESHOLD ? '#10b981' : '#ef4444'} ${activeResume.suitability * 3.6}deg, #27272a 0deg)`
                      }} />
                      <div className="relative z-10 text-center">
                        <p className="text-sm font-semibold text-zinc-300">Score</p>
                        <p className={`text-2xl font-bold ${activeResume.suitability >= ATS_THRESHOLD ? "text-emerald-300" : "text-red-300"}`}>{activeResume.suitability}%</p>
                      </div>
                    </div>
                    <Badge className={getStatusClass(activeResume.status)}>{getStatusLabel(activeResume.status)}</Badge>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="space-y-6 px-6 py-6 sm:px-8">
                {/* AI Suitability Card */}
                <motion.div 
                  className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="mb-2 flex items-center gap-2 text-base font-semibold text-emerald-200">
                    <ShieldCheck className="size-5" /> AI Suitability Analysis
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    This candidate demonstrates a <span className="font-bold text-emerald-300">{activeResume.suitability}% match</span> with the role requirements. 
                    Strong technical foundation with relevant project-level execution experience.
                  </p>
                </motion.div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <motion.div 
                    className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-sky-300">Experience</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">{activeResume.experience}</p>
                  </motion.div>
                  <motion.div 
                    className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-orange-300">Skills</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">{activeResume.extractedSkills.length}+</p>
                  </motion.div>
                  <motion.div 
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">Achievements</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">{activeResume.achievements.length}</p>
                  </motion.div>
                </div>

                {/* Skills Section */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-sky-400" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Technical Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.extractedSkills.map((item, idx) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + idx * 0.05 }}
                      >
                        <Badge className="border border-sky-500/40 bg-sky-500/20 px-3 py-1.5 text-sky-100 transition hover:border-sky-500/60 hover:bg-sky-500/30">
                          {item}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Experience & Certifications Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Achievements */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-emerald-400" />
                      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Key Achievements</p>
                    </div>
                    <ul className="space-y-2">
                      {activeResume.achievements.map((achievement, idx) => (
                        <motion.li 
                          key={achievement}
                          className="flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-2.5 transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.05 }}
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                          <span className="text-sm text-zinc-200">{achievement}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Certifications */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-orange-400" />
                      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Certifications</p>
                    </div>
                    <ul className="space-y-2">
                      {activeResume.certifications && activeResume.certifications.length > 0 ? (
                        activeResume.certifications.map((cert, idx) => (
                          <motion.li 
                            key={cert}
                            className="flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-2.5 transition hover:border-orange-500/30 hover:bg-orange-500/10"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + idx * 0.05 }}
                          >
                            <Badge className="mt-0.5 size-4 rounded-full bg-orange-500/20 text-orange-300 p-0 text-center text-xs font-bold">✓</Badge>
                            <span className="text-sm text-zinc-200">{cert}</span>
                          </motion.li>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500 italic">No certifications listed</p>
                      )}
                    </ul>
                  </motion.div>
                </div>

                {/* Contact & Meeting Info */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Email</p>
                      <p className="mt-1 break-all font-mono text-sm text-sky-300">{activeResume.email}</p>
                    </div>
                    {activeResume.zoomLink && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">Interview Link</p>
                        <p className="mt-1 break-all font-mono text-xs text-emerald-200">{activeResume.zoomLink}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <DialogFooter className="border-t border-zinc-800 bg-zinc-950/50 px-6 py-4 sm:px-8 sm:py-6 sm:flex-row-reverse">
                <motion.div 
                  className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    variant="ghost" 
                    className="text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200" 
                    onClick={() => setOpenResumeModal(false)}
                  >
                    Dismiss
                  </Button>
                  
                  {activeResume.atsScore < ATS_THRESHOLD ? (
                    <Button
                      className="border border-red-500/50 bg-red-500/20 text-red-300 transition hover:border-red-500/80 hover:bg-red-500/30"
                      variant="outline"
                      disabled={activeResume.status === "rejected"}
                      onClick={() => rejectCandidate(activeResume.id)}
                    >
                      <AlertCircle className="mr-2 size-4" /> Reject
                    </Button>
                  ) : null}
                  
                  <Button
                    className="bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 active:scale-95"
                    onClick={() => selectForInterview(activeResume.id)}
                    disabled={activeResume.atsScore < ATS_THRESHOLD || activeResume.status === "rejected"}
                  >
                    <Calendar className="mr-2 size-4" /> Schedule Interview
                  </Button>
                </motion.div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-5 text-center text-sm text-zinc-400">
      {text}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "sky" | "amber" | "emerald" | "red";
}) {
  const toneClass = {
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-3.5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
        <span className={`inline-flex size-8 items-center justify-center rounded-xl border ${toneClass[tone]}`}>{icon}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-zinc-100">{value}</p>
    </div>
  );
}
