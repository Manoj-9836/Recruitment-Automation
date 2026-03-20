import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronRight,
  CheckCircle2,
  FileDown,
  Github,
  Globe,
  LayoutDashboard,
  Linkedin,
  ListChecks,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserCircle2,
  Video,
  RefreshCw,
  Star,
  Award,
  Code2,
  MapPin,
  Mail,
  Phone,
  Zap,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { ATS_THRESHOLD } from "@/data/recruitment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  createJob,
  deleteCandidate,
  deleteJob,
  saveCandidates,
  updateJob,
  authorizeCandidateForTest,
} from "@/lib/api";
import type { JobPosting, ResumeCandidate } from "@/types/recruitment";

type HRDashboardProps = {
  resumes: ResumeCandidate[];
  setResumes: Dispatch<SetStateAction<ResumeCandidate[]>>;
  jobs: JobPosting[];
  setJobs: Dispatch<SetStateAction<JobPosting[]>>;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
};

/* ─── colour tokens (60 / 30 / 10 rule) ──────────────────────────────────────
   60 % → white  #FFFFFF  – main surfaces, cards, modal right panel
   30 % → light blue-grey  #E5EDF1  – sidebar bg tint, section headers, rows
   10 % → accent blue-grey #96C2DB  – active nav, badges, buttons, bars
────────────────────────────────────────────────────────────────────────────── */

export default function HRDashboard({
  resumes,
  setResumes,
  jobs,
  setJobs,
  onRefresh,
  onLogout,
}: HRDashboardProps) {
  type CandidateStatusFilter = "all" | ResumeCandidate["status"];
  type CandidateSort = "newest" | "oldest" | "best_match" | "highest_ats";

  const [activeResume, setActiveResume] = useState<ResumeCandidate | null>(null);
  const [openResumeModal, setOpenResumeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lowAtsPromptDismissed, setLowAtsPromptDismissed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "job-postings" | "settings"
  >("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<CandidateStatusFilter>("all");
  const [sortOption, setSortOption] = useState<CandidateSort>("newest");
  const [locationFilter, setLocationFilter] = useState<
    "all" | "remote" | "onsite"
  >("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobModalMode, setJobModalMode] = useState<"create" | "edit">("create");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobAts, setJobAts] = useState("85");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [jobFileName, setJobFileName] = useState("");
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<
    "overview" | "skills" | "projects"
  >("overview");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthorizingCandidate, setIsAuthorizingCandidate] = useState(false);
  const [authorizationCandidateId, setAuthorizationCandidateId] = useState<string | null>(null);

  /* ── derived ── */
  const lowAtsResumes = useMemo(
    () =>
      resumes.filter(
        (item) => item.atsScore < ATS_THRESHOLD && item.status !== "rejected",
      ),
    [resumes],
  );
  const showRejectPrompt = lowAtsResumes.length > 0 && !lowAtsPromptDismissed;
  const completedInterviews = resumes.filter(
    (item) => item.status === "interview_completed",
  );

  /* ── handlers ── */
  const openResume = (resume: ResumeCandidate) => {
    setActiveResume(resume);
    setActiveModalTab("overview");
    setOpenResumeModal(true);
  };

  const rejectLowAtsResumes = () => {
    const count = lowAtsResumes.length;
    setResumes((prev) =>
      prev.map((c) =>
        c.atsScore < ATS_THRESHOLD ? { ...c, status: "rejected" as const } : c,
      ),
    );
    setLowAtsPromptDismissed(true);
    if (count > 0) toast.success(`${count} low ATS profile(s) rejected.`);
  };

  const keepLowAtsResumes = () => {
    setLowAtsPromptDismissed(true);
    toast.info("Manual review mode enabled for low ATS profiles.");
  };

  const rejectCandidate = (candidateId: string) => {
    const updated = resumes.map((c) =>
      c.id === candidateId ? { ...c, status: "rejected" as const } : c,
    );
    setResumes(updated);
    const upd = updated.find((c) => c.id === candidateId) ?? null;
    setActiveResume(upd);
    if (upd) toast.warning(`${upd.candidateName} marked as rejected.`);
  };

  const selectForInterview = (candidateId: string) => {
    const meetingId = Math.floor(100000000 + Math.random() * 899999999);
    const updated = resumes.map((c) =>
      c.id === candidateId
        ? {
          ...c,
          status: "selected" as const,
          zoomLink: `https://zoom.us/j/${meetingId}?pwd=RecruitAuto`,
        }
        : c,
    );
    setResumes(updated);
    const upd = updated.find((c) => c.id === candidateId) ?? null;
    setActiveResume(upd);
    if (upd) toast.success(`Interview scheduled for ${upd.candidateName}.`);
  };

  const deleteApplication = async (candidateId: string) => {
    const target = resumes.find((c) => c.id === candidateId);
    const name = target?.candidateName ?? "this candidate";
    if (
      !window.confirm(
        `Delete application for ${name}? This action cannot be undone.`,
      )
    )
      return;
    const filtered = resumes.filter((c) => c.id !== candidateId);
    try {
      await deleteCandidate(candidateId);
      setResumes(filtered);
      if (activeResume?.id === candidateId) {
        setActiveResume(null);
        setOpenResumeModal(false);
      }
      toast.info(`Application deleted for ${name}.`);
    } catch (error) {
      const statusCode =
        typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { status?: number } }).response
            ?.status === "number"
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (statusCode === 404) {
        try {
          await saveCandidates(filtered);
          setResumes(filtered);
          if (activeResume?.id === candidateId) {
            setActiveResume(null);
            setOpenResumeModal(false);
          }
          toast.info(`Application deleted for ${name}.`);
          return;
        } catch {
          toast.error("Delete endpoint unavailable and fallback sync failed.");
          return;
        }
      }
      toast.error("Unable to delete application right now.");
    }
  };

  const resetJobModalState = () => {
    setJobTitle("");
    setJobAts("85");
    setJobFile(null);
    setJobFileName("");
    setEditingJobId(null);
    setJobModalMode("create");
  };

  const authorizeCandidate = async () => {
    if (!authorizationCandidateId) return;

    setIsAuthorizingCandidate(true);
    try {
      const result = await authorizeCandidateForTest(authorizationCandidateId);
      if (result.success) {
        // Update candidate status to authorized
        const updated = resumes.map((c) =>
          c.id === authorizationCandidateId
            ? { ...c, authorizationStatus: "authorized" as const }
            : c
        );
        setResumes(updated);
        const updated_candidate = updated.find((c) => c.id === authorizationCandidateId);
        if (updated_candidate) {
          setActiveResume(updated_candidate);
        }
        setIsSettingsModalOpen(false);
        toast.success(
          `Authorization email sent to ${result.email}. Password: ${result.password}`
        );
      } else {
        toast.error(result.message || "Failed to authorize candidate");
      }
    } catch (err) {
      console.error("Authorization error:", err);
      toast.error("Failed to authorize candidate. Check backend SMTP configuration.");
    } finally {
      setIsAuthorizingCandidate(false);
    }
  };

  const openSettingsModal = (candidateId: string) => {
    setAuthorizationCandidateId(candidateId);
    setIsSettingsModalOpen(true);
  };

  const openCreateJobModal = () => {
    resetJobModalState();
    setJobModalMode("create");
    setIsJobModalOpen(true);
  };

  const isPdfFile = (file: File) =>
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  const handleJobFileSelect = (file?: File | null) => {
    if (!file) return;
    if (!isPdfFile(file)) {
      toast.error("Please upload a PDF file.");
      return;
    }
    setJobFile(file);
    setJobFileName(file.name);
  };

  const startEditJob = (job: JobPosting) => {
    resetJobModalState();
    setJobModalMode("edit");
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setJobAts(String(job.requiredAts));
    setJobFileName(job.jdFileName);
    setIsJobModalOpen(true);
  };

  const saveJob = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please provide the job role.");
      return;
    }
    if (jobModalMode === "create" && !jobFile) {
      toast.error("Please upload a JD PDF file.");
      return;
    }
    setIsSavingJob(true);
    try {
      if (jobModalMode === "create") {
        const created = await createJob({
          title: jobTitle.trim(),
          requiredAts: Number(jobAts) || ATS_THRESHOLD,
          jdFile: jobFile as File,
        });
        setJobs((prev) => [created, ...prev]);
        toast.success(`Job role added: ${created.title}`);
      } else if (editingJobId) {
        const updated = await updateJob({
          jobId: editingJobId,
          title: jobTitle.trim(),
          requiredAts: Number(jobAts) || ATS_THRESHOLD,
          jdFile: jobFile,
        });
        setJobs((prev) =>
          prev.map((j) => (j.id === editingJobId ? updated : j)),
        );
        toast.success(`Job role updated: ${updated.title}`);
      }
      setIsJobModalOpen(false);
      resetJobModalState();
    } catch (error) {
      const backendMessage =
        typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (
            error as { response?: { data?: { detail?: string } } }
          ).response?.data?.detail === "string"
          ? (error as { response?: { data?: { detail?: string } } }).response
            ?.data?.detail
          : null;
      toast.error(backendMessage ?? "Unable to save job role.");
    } finally {
      setIsSavingJob(false);
    }
  };

  const deleteJobRole = async (jobId: string) => {
    const target = jobs.find((j) => j.id === jobId);
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (editingJobId === jobId) {
        setIsJobModalOpen(false);
        resetJobModalState();
      }
      toast.info(
        target ? `Deleted job role: ${target.title}` : "Job role deleted.",
      );
    } catch {
      toast.error("Unable to delete job role.");
    }
  };

  /* ── filtered / sorted candidates ── */
  const filteredResumes = useMemo(() => {
    return resumes.filter((r) => {
      const q = searchQuery.trim().toLowerCase();
      const hay = `${r.candidateName} ${r.jobRole} ${r.email}`.toLowerCase();
      return (
        (!q || hay.includes(q)) &&
        (statusFilter === "all" || r.status === statusFilter)
      );
    });
  }, [resumes, searchQuery, statusFilter]);

  const groupedResumes = useMemo(() => {
    const jobOrder = new Map(jobs.map((j, i) => [j.title.toLowerCase(), i]));
    const resumeOrder = new Map(resumes.map((r, i) => [r.id, i]));
    const sorted = [...filteredResumes].sort((a, b) => {
      const aO =
        jobOrder.get(a.jobRole.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const bO =
        jobOrder.get(b.jobRole.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      if (aO !== bO) return aO - bO;
      if (a.jobRole !== b.jobRole) return a.jobRole.localeCompare(b.jobRole);
      if (a.status !== b.status) {
        const ord: Record<ResumeCandidate["status"], number> = {
          pending: 0,
          selected: 1,
          interview_completed: 2,
          rejected: 3,
        };
        return ord[a.status] - ord[b.status];
      }
      if (sortOption === "best_match" && a.suitability !== b.suitability)
        return b.suitability - a.suitability;
      if (sortOption === "highest_ats" && a.atsScore !== b.atsScore)
        return b.atsScore - a.atsScore;
      if (sortOption === "newest")
        return (resumeOrder.get(b.id) ?? 0) - (resumeOrder.get(a.id) ?? 0);
      if (sortOption === "oldest")
        return (resumeOrder.get(a.id) ?? 0) - (resumeOrder.get(b.id) ?? 0);
      return a.candidateName.localeCompare(b.candidateName);
    });
    const grouped = new Map<string, ResumeCandidate[]>();
    for (const r of sorted) {
      const bucket = grouped.get(r.jobRole) ?? [];
      bucket.push(r);
      grouped.set(r.jobRole, bucket);
    }
    return Array.from(grouped.entries()).map(([jobRole, candidates]) => ({
      jobRole,
      candidates,
      requiredAts: jobs.find(
        (j) => j.title.toLowerCase() === jobRole.toLowerCase(),
      )?.requiredAts,
    }));
  }, [filteredResumes, jobs, resumes, sortOption]);

  const sortedCandidates = useMemo(
    () => groupedResumes.flatMap((g) => g.candidates),
    [groupedResumes],
  );
  const visibleBoardStatuses = useMemo<ResumeCandidate["status"][]>(
    () => ["pending", "selected", "interview_completed"],
    [],
  );
  const visibleBoardCount = useMemo(
    () =>
      sortedCandidates.filter((c) => visibleBoardStatuses.includes(c.status))
        .length,
    [sortedCandidates, visibleBoardStatuses],
  );
  const hiddenInBoardCount = Math.max(
    0,
    filteredResumes.length - visibleBoardCount,
  );

  const suggestionPool = useMemo(() => {
    const pool = new Set<string>();
    for (const j of jobs) pool.add(j.title);
    for (const r of resumes) {
      pool.add(r.candidateName);
      pool.add(r.jobRole);
    }
    return Array.from(pool);
  }, [jobs, resumes]);

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return suggestionPool
      .filter((e) => e.toLowerCase().includes(q) && e.toLowerCase() !== q)
      .slice(0, 6);
  }, [searchQuery, suggestionPool]);

  const showSearchSuggestions =
    isSearchFocused &&
    searchQuery.trim().length > 0 &&
    searchSuggestions.length > 0;

  /* ── label / style helpers ── */
  const getStatusLabel = (s: ResumeCandidate["status"]) => {
    if (s === "selected") return "Scheduled";
    if (s === "interview_completed") return "Completed";
    if (s === "rejected") return "Rejected";
    return "Applied";
  };

  const getStatusBadgeClass = (s: ResumeCandidate["status"]) => {
    if (s === "selected")
      return "border border-amber-200 bg-amber-50 text-amber-700";
    if (s === "interview_completed")
      return "border border-emerald-300 bg-emerald-50 text-emerald-700";
    if (s === "rejected") return "border border-red-200 bg-red-50 text-red-600";
    return "border border-slate-200 bg-slate-100 text-slate-600";
  };

  /* colour tokens for a numeric score */
  const scoreTokens = (score: number) => {
    if (score >= 85)
      return {
        bar: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        label: "text-emerald-600",
      };
    if (score >= 70)
      return {
        bar: "bg-[#96C2DB]",
        text: "text-[#2a6080]",
        bg: "bg-[#E5EDF1]",
        border: "border-[#96C2DB]",
        label: "text-[#2a6080]",
      };
    if (score >= 50)
      return {
        bar: "bg-amber-400",
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-300",
        label: "text-amber-600",
      };
    return {
      bar: "bg-red-400",
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-300",
      label: "text-red-600",
    };
  };

  const formatSubtitle = (summary?: string) => {
    if (!summary) return null;
    const norm = summary.replace(/\s+/g, " ").trim();
    const base = norm
      .replace(/dob\s*:\s*\d{4}-\d{2}-\d{2}/gi, "")
      .replace(/gender\s*:\s*[a-z]+/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .replace(/^i\s+am\s+(a\s+|an\s+)?/i, "")
      .trim();
    if (!base) return null;
    return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  };

  const extractCandidateMeta = (summary?: string) => {
    if (!summary) return null;
    const norm = summary.replace(/\s+/g, " ").trim();
    const dob = norm.match(/dob\s*:\s*(\d{4})-(\d{2})-(\d{2})/i);
    const gender = norm.match(/gender\s*:\s*([a-z]+)/i);
    const parts: string[] = [];

    if (gender) {
      const g = gender[1].toLowerCase();
      parts.push(g.charAt(0).toUpperCase() + g.slice(1));
    }

    if (dob) {
      const d = new Date(`${dob[1]}-${dob[2]}-01T00:00:00Z`);
      if (!Number.isNaN(d.getTime())) {
        parts.push(
          `Born ${d.toLocaleString("en-US", { month: "short" })} ${dob[1]}`,
        );
      }
    }

    return parts.length ? parts.join(" · ") : null;
  };

  const handleMenuNavigation = (
    menu: "dashboard" | "job-postings" | "settings",
  ) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout();
  };

  const handleRefreshRecords = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success("Records refreshed.");
    } catch {
      toast.error("Unable to refresh records right now.");
    } finally {
      setIsRefreshing(false);
    }
  };

  /* ─────────────────────────────────── SIDEBAR ───────────────────────────── */
  const renderSidebarContent = (isMobile = false) => (
    <>
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#96C2DB]/40 bg-[#96C2DB]/20 text-white shadow-sm">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-white">
              CompanyName
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#96C2DB]">
              AI Recruiter
            </p>
          </div>
        </div>
        {isMobile && <div className="inline-flex size-10" />}
      </div>

      <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#96C2DB]/70">
        Menu
      </div>
      <div className="space-y-1.5">
        {(
          [
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "job-postings", icon: Briefcase, label: "Job Postings" },
            { id: "settings", icon: Settings, label: "Settings" },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleMenuNavigation(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${activeMenu === id
                ? "bg-[#1f6f95] text-white shadow-sm"
                : "text-[#E5EDF1]/80 hover:bg-[#96C2DB]/20 hover:text-white"
              }`}
          >
            {activeMenu === id && (
              <span className="h-4 w-0.5 rounded-full bg-white/80" />
            )}
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-2">
        <div className="rounded-xl border border-[#96C2DB]/30 bg-[#96C2DB]/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border border-[#96C2DB]/40">
              <AvatarFallback className="bg-[#96C2DB]/20 text-white">
                <UserCircle2 className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-white">HR</p>
              <p className="text-xs text-[#96C2DB]">HR Manager</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl text-[#E5EDF1]/70 hover:bg-red-500/15 hover:text-red-200"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 size-4" /> Sign Out
        </Button>
      </div>
    </>
  );

  /* ─────────────────────────────── CANDIDATE MODAL ──────────────────────── */
  const renderCandidateModal = () => {
    if (!activeResume) return null;
    const mTok = scoreTokens(activeResume.suitability);
    const aTok = scoreTokens(activeResume.atsScore);
    const isRejected = activeResume.status === "rejected";
    const subtitle = formatSubtitle(activeResume.professionalSummary);
    const candidateMeta = extractCandidateMeta(activeResume.professionalSummary);

    // typed contact rows without any
    type ContactRow = { Icon: React.ElementType; value: string; breakAll: boolean };
    const contactRows = [
      activeResume.email
        ? { Icon: Mail, value: activeResume.email, breakAll: true }
        : null,
      activeResume.phone
        ? { Icon: Phone, value: activeResume.phone, breakAll: false }
        : null,
      activeResume.location
        ? { Icon: MapPin, value: activeResume.location, breakAll: false }
        : null,
      activeResume.experience
        ? { Icon: Award, value: activeResume.experience, breakAll: false }
        : null,
    ].filter(Boolean) as ContactRow[];

    return (
      <div className="flex h-full w-full flex-col overflow-x-hidden overflow-y-auto bg-white lg:flex-row lg:items-stretch lg:overflow-hidden">
        {/* ── LEFT PANEL — 30 % colour (#E5EDF1) ── */}
        <div className="relative flex w-full flex-col overflow-x-hidden overflow-visible bg-[#E5EDF1] lg:h-full lg:w-[320px] lg:min-w-[320px] lg:shrink-0 lg:overflow-y-auto">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#96C2DB]/20 blur-3xl" />

          {/* Candidate Profile Header */}
          <div className="px-5 pt-5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a6080]/60">
              Candidate Profile
            </span>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center px-6 pb-5 pt-3">
            <div className="relative mb-3">
              {activeResume.profilePhotoUrl ? (
                <img
                  src={activeResume.profilePhotoUrl}
                  alt={activeResume.candidateName}
                  className={`size-[110px] rounded-2xl border-4 object-cover shadow-lg ${isRejected
                      ? "border-[#96C2DB]/20 opacity-50 grayscale"
                      : "border-white shadow-[#96C2DB]/20"
                    }`}
                />
              ) : (
                <div
                  className={`flex size-[110px] items-center justify-center rounded-2xl border-4 bg-gradient-to-br from-[#96C2DB] to-[#5a9bbf] shadow-lg ${isRejected ? "border-[#96C2DB]/20 opacity-50" : "border-white"
                    }`}
                >
                  <span className="text-4xl font-black text-white">
                    {activeResume.candidateName.charAt(0)}
                  </span>
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-[#E5EDF1] text-[9px] font-bold text-white shadow-sm ${isRejected
                    ? "bg-red-500"
                    : activeResume.status === "selected"
                      ? "bg-amber-500"
                      : activeResume.status === "interview_completed"
                        ? "bg-emerald-500"
                        : "bg-[#96C2DB]"
                  }`}
              >
                {isRejected
                  ? "✕"
                  : activeResume.status === "selected"
                    ? "📅"
                    : activeResume.status === "interview_completed"
                      ? "✓"
                      : "•"}
              </span>
            </div>

            <h2
              className={`text-center text-lg font-black tracking-tight ${isRejected ? "text-[#2a6080]/40" : "text-[#1a3a4a]"
                }`}
            >
              {activeResume.candidateName}
            </h2>
            {candidateMeta && (
              <p
                className={`mt-1 text-center text-xs font-medium ${isRejected ? "text-[#2a6080]/45" : "text-[#2a6080]/70"
                  }`}
              >
                {candidateMeta}
              </p>
            )}
            <div
              className={`mt-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${isRejected
                  ? "bg-[#96C2DB]/20 text-[#2a6080]/40"
                  : "bg-[#96C2DB] text-white"
                }`}
            >
              {activeResume.jobRole}
            </div>
          </div>

          {/* Score bars */}
          <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-[#96C2DB]/30 bg-white shadow-sm">
            <div className="divide-y divide-[#E5EDF1]">
              {[
                { label: "Match", value: activeResume.suitability, tok: mTok, Icon: TrendingUp },
                { label: "ATS Score", value: activeResume.atsScore, tok: aTok, Icon: Zap },
              ].map(({ label, value, tok, Icon }) => (
                <div key={label} className="px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2a6080]/70">
                      <Icon className="size-3" />
                      {label}
                    </span>
                    <span className={`text-sm font-black ${tok.text}`}>
                      {value}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5EDF1] shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full shadow-lg ${tok.bar} transition-all`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zoom link */}
          {activeResume.zoomLink && (
            <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
              <div className="border-b border-amber-100 px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                  Interview Link
                </p>
              </div>
              <div className="p-4">
                <a
                  href={activeResume.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 break-all text-xs font-medium text-amber-700 hover:text-amber-900"
                >
                  <Video className="size-3.5 shrink-0" />
                  {activeResume.zoomLink}
                </a>
              </div>
            </div>
          )}

          {/* Social */}
          <div className="mx-4 mb-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-[#2a6080]/60">
              Connect
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Linkedin, label: "LinkedIn", href: activeResume.linkedinUrl },
                { Icon: Github, label: "GitHub", href: activeResume.githubUrl },
                { Icon: Globe, label: "Website", href: activeResume.portfolioUrl },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  aria-label={label}
                  href={href ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex size-9 items-center justify-center rounded-xl border transition ${href
                      ? "border-[#96C2DB]/40 bg-white text-[#2a6080] hover:border-[#96C2DB] hover:bg-[#96C2DB] hover:text-white"
                      : "cursor-not-allowed border-[#96C2DB]/20 bg-[#E5EDF1]/30 text-[#2a6080]/30"
                    }`}
                  onClick={(e) => {
                    if (!href) e.preventDefault();
                  }}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — 60 % white ── */}
        <div className="flex min-w-0 w-full flex-1 flex-col overflow-visible bg-white lg:min-w-[520px] lg:overflow-hidden">
          {/* Tab bar */}
          <div className="flex shrink-0 items-center gap-1 border-b border-[#E5EDF1] bg-white px-6 py-3">
            {(
              [
                { key: "overview", label: "Overview", Icon: Star },
                { key: "skills", label: "Skills", Icon: Code2 },
                { key: "projects", label: "Projects", Icon: Award },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveModalTab(key)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${activeModalTab === key
                    ? "bg-[#96C2DB] text-white shadow-sm"
                    : "text-[#2a6080]/60 hover:bg-[#E5EDF1] hover:text-[#1a3a4a]"
                  }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-visible px-6 py-6 lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#96C2DB]/30 hover:[&::-webkit-scrollbar-thumb]:bg-[#96C2DB]/60">
            <AnimatePresence mode="wait">
              {/* ─ OVERVIEW ─ */}
              {activeModalTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5"
                >
                  {/* Score cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Match Score",
                        value: `${activeResume.suitability}%`,
                        tok: mTok,
                        Icon: TrendingUp,
                      },
                      {
                        label: "ATS Score",
                        value: `${activeResume.atsScore}%`,
                        tok: aTok,
                        Icon: Zap,
                      },
                      {
                        label: "Status",
                        value: getStatusLabel(activeResume.status),
                        tok: {
                          bg: "bg-[#E5EDF1]",
                          border: "border-[#96C2DB]/40",
                          text: "text-[#2a6080]",
                          label: "text-[#2a6080]/60",
                          bar: "",
                        },
                        Icon: CheckCircle2,
                      },
                    ].map(({ label, value, tok, Icon }) => (
                      <div
                        key={label}
                        className={`flex min-h-[90px] flex-col justify-between rounded-2xl border p-4 ${tok.bg} ${tok.border}`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${tok.label}`}
                        >
                          <Icon className="size-3 shrink-0" />
                          <span className="truncate">{label}</span>
                        </div>
                        <div
                          className={`mt-2 text-[22px] font-black leading-none tracking-tight ${tok.text}`}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI analysis */}
                  <div className="rounded-2xl border border-[#96C2DB]/40 bg-[#E5EDF1] p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#96C2DB] text-white">
                        <ShieldCheck className="size-4" />
                      </div>
                      <h4 className="font-bold text-[#1a3a4a]">
                        AI Suitability Analysis
                      </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-[#2a6080]">
                      This candidate demonstrates a{" "}
                      <span className={`font-bold ${mTok.text}`}>
                        {activeResume.suitability}% match
                      </span>{" "}
                      with the role requirements. Strong technical foundation
                      with relevant project-level execution experience across
                      multiple domains.
                    </p>
                  </div>

                  {/* Education + Languages */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SectionCard title="Education">
                      {activeResume.education?.length ? (
                        <ul className="space-y-1.5">
                          {activeResume.education.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#96C2DB]" />
                              <span className="text-sm text-[#1a3a4a]">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-[#2a6080]/40">
                          Not provided
                        </p>
                      )}
                    </SectionCard>

                    <SectionCard title="Languages">
                      {activeResume.languages?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {activeResume.languages.map((l) => (
                            <span
                              key={l}
                              className="rounded-lg border border-[#96C2DB]/40 bg-[#E5EDF1] px-2.5 py-1 text-xs font-semibold text-[#2a6080]"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#2a6080]/40">
                          Not provided
                        </p>
                      )}
                    </SectionCard>
                  </div>

                  {/* Achievements */}
                  {activeResume.achievements?.length > 0 && (
                    <SectionCard title="Key Achievements">
                      <ul className="space-y-2.5">
                        {activeResume.achievements.map((a) => (
                          <li key={a} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#96C2DB]" />
                            <span className="text-sm leading-snug text-[#1a3a4a]">
                              {a}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </SectionCard>
                  )}

                  {/* Certifications */}
                  {activeResume.certifications?.length > 0 && (
                    <div className="rounded-2xl border border-[#96C2DB]/30 bg-white p-5 shadow-sm">
                      <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#2a6080]/60">
                        Certifications
                      </h4>
                      <ul className="space-y-2">
                        {activeResume.certifications.map((cert) => (
                          <li
                            key={cert}
                            className="flex items-center gap-3 rounded-xl border border-[#96C2DB]/30 bg-[#E5EDF1] px-3 py-2.5"
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#96C2DB] text-[10px] font-bold text-white">
                              ✓
                            </span>
                            <span className="text-sm text-[#1a3a4a]">
                              {cert}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="rounded-2xl border border-[#96C2DB]/30 bg-white p-5 shadow-sm">
                    <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#2a6080]/60">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      {contactRows.map(({ Icon, value, breakAll }, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#E5EDF1]">
                            <Icon className="size-3.5 text-[#96C2DB]" />
                          </div>
                          <span
                            className={`text-sm text-[#1a3a4a] ${breakAll ? "break-all" : ""}`}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Professional Summary */}
                  {subtitle && (
                    <div className="rounded-2xl border border-[#96C2DB]/30 bg-white p-5 shadow-sm">
                      <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#2a6080]/60">
                        Professional Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-[#2a6080]">
                        {subtitle}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─ SKILLS ─ */}
              {activeModalTab === "skills" && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="min-h-[400px]"
                >
                  <SectionCard title="Technical Skills">
                    {activeResume.extractedSkills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {activeResume.extractedSkills.map((skill, i) => (
                          <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.035 }}
                            className="cursor-default rounded-xl border border-[#96C2DB]/50 bg-[#E5EDF1] px-3 py-1.5 text-sm font-semibold text-[#2a6080] shadow-sm transition hover:bg-[#96C2DB] hover:text-white"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#2a6080]/40">
                        No skills listed.
                      </p>
                    )}
                  </SectionCard>
                </motion.div>
              )}

              {/* ─ PROJECTS ─ */}
              {activeModalTab === "projects" && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="min-h-[400px] space-y-4"
                >
                  {activeResume.projects?.length ? (
                    activeResume.projects.map((project, i) => {
                      const normalizedName =
                        typeof project.name === "string" && project.name.trim()
                          ? project.name
                          : `Project ${i + 1}`;
                      const normalizedImpact =
                        typeof project.impact === "string" && project.impact.trim()
                          ? project.impact
                          : "Project details extracted from resume.";
                      const normalizedLink =
                        typeof project.link === "string" && project.link.trim()
                          ? project.link
                          : null;
                      const normalizedTechStack = Array.isArray(project.techStack)
                        ? project.techStack.filter(
                          (tech): tech is string => typeof tech === "string" && tech.trim().length > 0,
                        )
                        : [];

                      return (
                      <motion.div
                        key={`${normalizedName}-${i}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="overflow-hidden rounded-2xl border border-[#E5EDF1] bg-white shadow-sm transition hover:border-[#96C2DB]/60 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-[#E5EDF1] bg-[#E5EDF1]/50 px-5 py-3">
                          <p className="font-bold text-[#1a3a4a]">
                            {normalizedName}
                          </p>
                          {normalizedLink && (
                            <a
                              href={normalizedLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 rounded-lg border border-[#96C2DB]/40 bg-white px-2.5 py-1 text-xs font-semibold text-[#2a6080] transition hover:bg-[#96C2DB] hover:text-white"
                            >
                              <ExternalLink className="size-3" />
                              View
                            </a>
                          )}
                        </div>
                        <div className="px-5 py-4">
                          <p className="mb-4 text-sm leading-relaxed text-[#2a6080]">
                            {normalizedImpact}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {normalizedTechStack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-lg border border-[#96C2DB]/30 bg-[#E5EDF1] px-2 py-0.5 text-xs font-semibold text-[#2a6080]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#96C2DB]/40 bg-[#E5EDF1]/30 p-12 text-center">
                      <Code2 className="mb-3 size-10 text-[#96C2DB]/40" />
                      <p className="font-semibold text-[#2a6080]/60">
                        No projects listed
                      </p>
                      <p className="mt-1 text-sm text-[#2a6080]/40">
                        This candidate hasn&apos;t added any projects yet.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Actions Footer */}
          <div className="sticky bottom-0 left-0 right-0 border-t border-[#E5EDF1] bg-white px-6 py-4 shadow-lg">
            <div className="mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2a6080]/60">
                Actions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeResume.atsScore >= ATS_THRESHOLD &&
                (activeResume.resumeFileUrl ? (
                  <a
                    href={activeResume.resumeFileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <CandidateActionBtn
                      icon={FileDown}
                      label="Resume"
                      variant="secondary"
                    />
                  </a>
                ) : (
                  <CandidateActionBtn
                    icon={FileDown}
                    label="Resume"
                    variant="disabled"
                    disabled
                  />
                ))}
              {activeResume.atsScore >= ATS_THRESHOLD &&
                activeResume.status !== "rejected" && (
                  <>
                    {activeResume.authorizationStatus === "pending" && (
                      <CandidateActionBtn
                        icon={ShieldCheck}
                        label="Authorize for Test"
                        variant="accent"
                        onClick={() => openSettingsModal(activeResume.id)}
                      />
                    )}
                    {activeResume.authorizationStatus !== "pending" && (
                      <CandidateActionBtn
                        icon={Calendar}
                        label="Schedule"
                        variant="accent"
                        onClick={() => selectForInterview(activeResume.id)}
                      />
                    )}
                  </>
                )}
              {activeResume.atsScore < ATS_THRESHOLD && (
                <CandidateActionBtn
                  icon={AlertCircle}
                  label="Reject"
                  variant="danger"
                  disabled={activeResume.status === "rejected"}
                  onClick={() => rejectCandidate(activeResume.id)}
                />
              )}
              <CandidateActionBtn
                icon={Trash2}
                label="Delete"
                variant="ghost"
                onClick={() => void deleteApplication(activeResume.id)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────── MAIN RENDER ───────────────────────────── */
  return (
    <motion.div
      key="hr-dashboard"
      className="relative min-h-screen overflow-hidden bg-slate-50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
    >
      {/* gradient background layer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(150,194,219,0.12),transparent_26%),radial-gradient(circle_at_92%_12%,rgba(229,237,241,0.18),transparent_28%)]" />

      <div className="relative min-h-screen">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 overflow-y-auto border-r border-[#96C2DB]/20 bg-black p-5 lg:flex lg:flex-col">
          {renderSidebarContent()}
        </aside>

        {/* Main content */}
        <main className="overflow-x-hidden p-3 sm:p-6 lg:ml-64 lg:p-8 xl:p-10">
          {/* Mobile topbar */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl border border-[#96C2DB]/40 bg-[#E5EDF1] text-[#2a6080]">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a3a4a]">CompanyName</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#2a6080]/60">
                  Recruiter
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-[#96C2DB]/40 bg-[#E5EDF1]"
            >
              <span className="relative block h-4 w-5">
                <motion.span
                  className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-[#2a6080]"
                  animate={
                    isMobileMenuOpen
                      ? { y: 7, rotate: 45 }
                      : { y: 0, rotate: 0 }
                  }
                  transition={{ duration: 0.22 }}
                />
                <motion.span
                  className="absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-[#2a6080]"
                  animate={
                    isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }
                  }
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-[#2a6080]"
                  animate={
                    isMobileMenuOpen
                      ? { y: -7, rotate: -45 }
                      : { y: 0, rotate: 0 }
                  }
                  transition={{ duration: 0.22 }}
                />
              </span>
            </button>
          </div>

          {/* Mobile menu dropdown (under navbar) */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mb-4 rounded-2xl border border-[#96C2DB]/20 bg-gradient-to-b from-[#1a3a4a] to-[#2a5a70] p-5 lg:hidden"
              >
                {renderSidebarContent(true)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── DASHBOARD header ── */}
          {activeMenu === "dashboard" && (
            <div className="mb-5 space-y-3 sm:mb-6">
              <div className="rounded-2xl border border-[#96C2DB]/30 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
                <div className="flex flex-col gap-4">
                  <div>
                    <h1 className="text-[2rem] font-black tracking-tight text-[#1a3a4a] sm:text-3xl">
                      Resume Pipeline
                    </h1>
                    <p className="mt-1 text-sm leading-snug text-[#2a6080]/70 sm:mt-0.5">
                      View and manage candidate applications
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-[#96C2DB]" />
                      <Input
                        value={searchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, role…"
                        className="h-11 w-full rounded-xl !border-[#96C2DB]/40 !bg-[#E5EDF1]/40 pl-10 !text-[#1a3a4a] placeholder:!text-[#2a6080]/40 focus-visible:!border-[#96C2DB] focus-visible:!ring-[#96C2DB]/20"
                      />
                      {showSearchSuggestions && (
                        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-[#96C2DB]/30 bg-white shadow-lg">
                          {searchSuggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSearchQuery(s);
                                setIsSearchFocused(false);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#1a3a4a] transition hover:bg-[#E5EDF1]"
                            >
                              <Search className="size-3.5 text-[#96C2DB]" />
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Select
                      value={locationFilter}
                      onValueChange={(v) =>
                        setLocationFilter(v as "all" | "remote" | "onsite")
                      }
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl !border-[#96C2DB]/40 !bg-[#E5EDF1]/40 text-sm !text-[#1a3a4a] lg:w-[170px]">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void handleRefreshRecords()}
                      disabled={isRefreshing}
                      className="h-11 w-full rounded-xl border border-[#96C2DB]/40 !bg-[#E5EDF1]/40 !text-[#1a3a4a] hover:!bg-[#E5EDF1] disabled:opacity-70 lg:w-auto"
                    >
                      <RefreshCw className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#96C2DB]/30 bg-white px-4 py-4 shadow-sm sm:px-5">
                <div className="flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
                  <p className="text-sm font-medium text-[#2a6080]">
                    Showing{" "}
                    <span className="font-black text-[#1a3a4a]">
                      {viewMode === "board"
                        ? visibleBoardCount
                        : filteredResumes.length}
                    </span>{" "}
                    profiles
                    {viewMode === "board" && hiddenInBoardCount > 0 && (
                      <span className="ml-1.5 text-xs text-[#2a6080]/50">
                        ({hiddenInBoardCount} hidden)
                      </span>
                    )}
                  </p>
                  <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
                    <Tabs
                      className="w-full lg:w-auto"
                      value={statusFilter}
                      onValueChange={(v) =>
                        setStatusFilter(v as CandidateStatusFilter)
                      }
                    >
                      <TabsList className="h-auto w-full max-w-full justify-start gap-1 overflow-x-auto rounded-xl border border-[#96C2DB]/30 !bg-[#E5EDF1]/40 p-1 lg:w-auto">
                        {(
                          [
                            { v: "pending", l: "Pending" },
                            { v: "selected", l: "Scheduled" },
                            { v: "interview_completed", l: "Completed" },
                            { v: "all", l: "All" },
                          ] as const
                        ).map(({ v, l }) => (
                          <TabsTrigger
                            key={v}
                            value={v}
                            className="shrink-0 rounded-xl border border-[#96C2DB]/30 !bg-[#E5EDF1]/40 px-3 py-1.5 text-xs text-[#2a6080] hover:bg-[#E5EDF1] data-[state=active]:!border-[#1a3a4a] data-[state=active]:!bg-[#1a3a4a] data-[state=active]:!text-white"
                          >
                            {l}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>

                    <div className="hidden h-5 w-px bg-[#96C2DB]/30 lg:block" />

                    <Select
                      value={sortOption}
                      onValueChange={(v) => setSortOption(v as CandidateSort)}
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl border-[#96C2DB]/30 !bg-[#E5EDF1]/40 text-xs font-medium !text-[#1a3a4a] lg:h-9 lg:w-[140px]">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="best_match">Best Match</SelectItem>
                        <SelectItem value="highest_ats">Highest ATS</SelectItem>
                      </SelectContent>
                    </Select>

                    <ToggleGroup
                      type="single"
                      value={viewMode}
                      onValueChange={(v) =>
                        v && setViewMode(v as "list" | "board")
                      }
                      className="w-full justify-start lg:w-auto"
                    >
                      {[
                        {
                          val: "list",
                          label: "List view",
                          path: "M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z",
                          filled: false,
                        },
                        {
                          val: "board",
                          label: "Board view",
                          path: "M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z",
                          filled: true,
                        },
                      ].map(({ val, label, path, filled }) => (
                        <ToggleGroupItem
                          key={val}
                          value={val}
                          aria-label={label}
                          variant="outline"
                          className="size-10 rounded-xl border-[#96C2DB]/30 !bg-[#E5EDF1]/40 text-[#2a6080] hover:bg-[#E5EDF1] data-[state=on]:!border-[#1a3a4a] data-[state=on]:!bg-[#1a3a4a] data-[state=on]:!text-white lg:size-9"
                        >
                          <svg
                            className="size-4"
                            fill={filled ? "currentColor" : "none"}
                            stroke={filled ? "none" : "currentColor"}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={filled ? undefined : 2}
                              d={path}
                            />
                          </svg>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job postings header */}
          {activeMenu === "job-postings" && (
            <div className="mb-6 rounded-2xl border border-[#96C2DB]/30 bg-white px-6 py-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#1a3a4a] sm:text-3xl">
                    Job Postings
                  </h1>
                  <p className="mt-1 text-sm text-[#2a6080]/70">
                    Create and manage role configurations with ATS requirements and
                    JD uploads.
                  </p>
                </div>
                <Button
                  onClick={openCreateJobModal}
                  className="h-11 rounded-xl bg-[#1a3a4a] px-6 text-white hover:bg-[#2a5a70]"
                >
                  <Plus className="mr-2 size-4" /> Create Job
                </Button>
              </div>
            </div>
          )}

          {/* ── DASHBOARD content ── */}
          {activeMenu === "dashboard" && (
            <>
              {isRefreshing ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`dashboard-skeleton-${i}`}
                      className="overflow-hidden rounded-2xl border border-[#96C2DB]/30 bg-white shadow-sm"
                    >
                      <div className="h-14 animate-pulse border-b border-[#E5EDF1] bg-[#E5EDF1]/70" />
                      <div className="space-y-3 p-4">
                        {[1, 2, 3].map((row) => (
                          <div
                            key={`dashboard-skeleton-${i}-row-${row}`}
                            className="h-14 animate-pulse rounded-xl bg-[#E5EDF1]/50"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : groupedResumes.length === 0 ? (
                <div className="overflow-hidden rounded-2xl border border-[#96C2DB]/30 bg-white shadow-sm">
                  <div className="border-b border-[#E5EDF1] bg-[#E5EDF1]/40 px-4 py-3 sm:px-5">
                    <p className="font-bold text-[#1a3a4a]">Showing 0 profiles</p>
                    <p className="text-xs text-[#2a6080]/60">
                      Try broadening your search criteria to view candidates.
                    </p>
                  </div>
                  <div className="p-5">
                    <EmptyState
                      title="No resumes found"
                      description="No candidates match the current search and filter combination."
                      icon="search"
                      actionLabel="Clear filters"
                      onAction={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSortOption("newest");
                        setViewMode("list");
                      }}
                    />
                  </div>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-4">
                  {groupedResumes.map((group, gi) => (
                    <motion.section
                      key={group.jobRole}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: gi * 0.05 }}
                      className="overflow-hidden rounded-2xl border border-[#96C2DB]/30 bg-white shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EDF1] bg-[#E5EDF1]/60 px-4 py-3 sm:px-5">
                        <div>
                          <p className="font-bold text-[#1a3a4a]">
                            {group.jobRole.toUpperCase()}
                          </p>
                          <p className="text-xs text-[#2a6080]/60">
                            {group.candidates.length} candidate(s)
                          </p>
                        </div>
                        {typeof group.requiredAts === "number" && (
                          <Badge className="border border-slate-200 bg-white text-xs font-semibold text-slate-700">
                            Required ATS {group.requiredAts}%
                          </Badge>
                        )}
                      </div>

                      <div className="divide-y divide-[#E5EDF1]">
                        {group.candidates.map((resume) => {
                          const rej = resume.status === "rejected";
                          return (
                            <motion.button
                              key={resume.id}
                              onClick={() => openResume(resume)}
                              whileHover={{ y: -1 }}
                              className={`group flex w-full cursor-pointer flex-col items-start justify-between gap-3 px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#96C2DB] sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${rej
                                  ? "bg-[#E5EDF1]/30 hover:bg-[#E5EDF1]/50"
                                  : "bg-white hover:bg-[#E5EDF1]/30"
                                }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    className={`size-10 rounded-xl border ${rej
                                        ? "border-[#96C2DB]/20 opacity-50"
                                        : "border-[#96C2DB]/40"
                                      }`}
                                  >
                                    <AvatarImage
                                      src={resume.profilePhotoUrl}
                                      alt={resume.candidateName}
                                      className="rounded-xl object-cover"
                                    />
                                    <AvatarFallback
                                      className={`rounded-xl text-sm font-bold ${rej
                                          ? "bg-[#96C2DB]/15 text-[#1a3a4a]/45"
                                          : "bg-[#96C2DB]/20 text-[#1a3a4a]"
                                        }`}
                                    >
                                      {resume.candidateName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p
                                      className={`truncate text-sm font-semibold ${rej ? "text-[#2a6080]/40" : "text-[#1a3a4a]"}`}
                                    >
                                      {resume.candidateName}
                                    </p>
                                    <p
                                      className={`truncate text-xs ${rej ? "text-[#2a6080]/30" : "text-[#2a6080]/70"}`}
                                    >
                                      {resume.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex w-full shrink-0 flex-wrap items-center gap-1.5 sm:w-auto sm:justify-end sm:gap-2">
                                <Badge
                                  className="whitespace-nowrap border border-slate-300 bg-white text-[11px] font-semibold text-slate-600 sm:text-xs"
                                >
                                  Match {resume.suitability}%
                                </Badge>
                                <Badge
                                  className={`whitespace-nowrap text-[11px] font-semibold sm:text-xs ${resume.atsScore >= ATS_THRESHOLD
                                      ? "border border-transparent bg-[#96C2DB]/25 text-[#1a3a4a]"
                                      : "border border-transparent bg-amber-100 text-amber-800"
                                    }`}
                                >
                                  ATS {resume.atsScore}%
                                </Badge>
                                <Badge
                                  className={`whitespace-nowrap text-[11px] font-semibold sm:text-xs ${getStatusBadgeClass(resume.status)}`}
                                >
                                  {getStatusLabel(resume.status)}
                                </Badge>
                                <ChevronRight className="ml-auto size-4 shrink-0 text-[#96C2DB]/60 transition-transform group-hover:translate-x-0.5 sm:ml-0.5" />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.section>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      key: "pending",
                      label: "Pending",
                      accent: "bg-[#96C2DB] text-white",
                      leftBorder: "border-l-[#96C2DB]",
                    },
                    {
                      key: "selected",
                      label: "Scheduled",
                      accent: "bg-[#E5EDF1] text-[#2a6080] border border-[#96C2DB]/40",
                      leftBorder: "border-l-[#96C2DB]",
                    },
                    {
                      key: "interview_completed",
                      label: "Completed",
                      accent: "bg-[#E5EDF1] text-[#2a6080] border border-[#96C2DB]/40",
                      leftBorder: "border-l-[#96C2DB]",
                    },
                  ].map((col, ci) => {
                    const items = sortedCandidates.filter(
                      (c) => c.status === col.key,
                    );
                    return (
                      <motion.section
                        key={col.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: ci * 0.05 }}
                        className="rounded-2xl border border-[#96C2DB]/30 bg-[#E5EDF1]/40 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-[#96C2DB]/20 px-4 py-3">
                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-bold ${col.accent}`}
                          >
                            {col.label}
                          </span>
                          <span className="text-xs font-medium text-[#2a6080]/60">
                            {items.length} candidate(s)
                          </span>
                        </div>
                        <div className="space-y-2.5 p-3">
                          {items.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-[#96C2DB]/30 bg-white px-3 py-6 text-center text-xs text-[#2a6080]/50">
                              <Calendar className="mx-auto mb-2 size-4 text-[#96C2DB]/40" />
                              No candidates
                            </div>
                          ) : (
                            items.map((resume) => (
                              <motion.button
                                key={resume.id}
                                onClick={() => openResume(resume)}
                                whileHover={{ y: -2 }}
                                className={`w-full rounded-xl border-l-4 border-y border-r bg-white p-3.5 text-left shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#96C2DB] sm:p-4 ${col.leftBorder} border-y-[#E5EDF1] border-r-[#E5EDF1]`}
                              >
                                <div className="mb-2.5 flex items-center gap-3">
                                  <Avatar className="size-9 rounded-xl border border-[#96C2DB]/30 bg-[#E5EDF1]">
                                    <AvatarImage
                                      src={resume.profilePhotoUrl}
                                      alt={resume.candidateName}
                                      className="rounded-xl object-cover"
                                    />
                                    <AvatarFallback className="rounded-xl bg-[#E5EDF1] text-xs font-bold text-[#2a6080]">
                                      {resume.candidateName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#1a3a4a]">
                                      {resume.candidateName}
                                    </p>
                                    <p className="truncate text-xs text-[#2a6080]/60">
                                      {resume.jobRole.toUpperCase()}
                                    </p>
                                  </div>
                                </div>
                                <p className="mb-2.5 truncate text-xs text-[#2a6080]/50">
                                  {resume.email}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  <Badge className="border border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                                    Match {resume.suitability}%
                                  </Badge>
                                  <Badge className="border border-[#96C2DB]/40 bg-[#E5EDF1] text-xs text-[#2a6080]">
                                    ATS {resume.atsScore}%
                                  </Badge>
                                </div>
                              </motion.button>
                            ))
                          )}
                        </div>
                      </motion.section>
                    );
                  })}
                </div>
              )}

              {/* Completed interviews */}
              <Card className="mt-5 border-[#96C2DB]/30 bg-white shadow-sm">
                <CardHeader className="border-b border-[#E5EDF1] bg-[#E5EDF1]/40 pb-4">
                  <CardTitle className="flex items-center gap-2 text-[#1a3a4a]">
                    <ListChecks className="size-5 text-[#96C2DB]" />
                    Interview Completion Results
                  </CardTitle>
                  <CardDescription className="text-[#2a6080]/60">
                    After candidate completes interview, HR can review and book
                    a Zoom call.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {completedInterviews.length === 0 ? (
                    <EmptyState
                      title="No completed interviews yet"
                      description="Completed interview outcomes will appear here once candidates finish their rounds."
                      icon="calendar"
                    />
                  ) : (
                    completedInterviews.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#96C2DB]/30 bg-[#E5EDF1]/30 p-4 transition hover:border-[#96C2DB]/60 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1a3a4a]">
                            {c.candidateName}
                          </p>
                          <p className="text-xs text-[#2a6080]/60">
                            {c.jobRole.toUpperCase()} · Suitability {c.suitability}%
                          </p>
                        </div>
                        <Button className="h-auto w-full justify-center rounded-xl bg-[#96C2DB] px-4 py-2.5 text-white hover:bg-[#7aafc9] sm:w-auto">
                          <Video className="mr-2 size-4 shrink-0" />
                          <span className="text-sm sm:hidden">Book Zoom</span>
                          <span className="hidden text-sm sm:inline">
                            Book Zoom Meeting
                          </span>
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* ── JOB POSTINGS ── */}
          {activeMenu === "job-postings" && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1a3a4a]">
                  Existing Job Roles
                </p>
                <p className="text-xs text-[#2a6080]/60">{jobs.length} role(s)</p>
              </div>

              {isRefreshing ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`job-skeleton-${i}`}
                      className="rounded-xl border border-[#96C2DB]/30 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-2 h-5 w-2/3 animate-pulse rounded bg-[#E5EDF1]/60" />
                      <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-[#E5EDF1]/55" />
                      <div className="mb-3 h-3 w-5/6 animate-pulse rounded bg-[#E5EDF1]/50" />
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex gap-2">
                          <div className="h-8 w-16 animate-pulse rounded-lg bg-[#E5EDF1]/60" />
                          <div className="h-8 w-20 animate-pulse rounded-lg bg-[#E5EDF1]/60" />
                        </div>
                        <div className="h-8 w-16 animate-pulse rounded-lg bg-[#E5EDF1]/60" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#96C2DB]/40 bg-white px-6 py-14 text-center shadow-sm">
                  <Briefcase className="mx-auto mb-3 size-8 text-[#96C2DB]/70" />
                  <p className="text-sm font-semibold text-[#1a3a4a]">
                    No job roles created yet.
                  </p>
                  <p className="mt-1 text-sm text-[#2a6080]/60">
                    Click "Create Job" to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-[#96C2DB]/30 bg-white p-4 shadow-sm"
                    >
                      <p className="font-bold text-[#1a3a4a]">
                        {job.title.toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-[#2a6080]/70">
                        Required ATS: {job.requiredAts}%
                      </p>
                      <p className="truncate text-xs text-[#2a6080]/50">
                        JD: {job.jdFileName}
                      </p>
                      {job.applyLink && (
                        <>
                          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#2a6080]/50">
                            Apply URL
                          </p>
                          <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-400 hover:text-[#2a6080]"
                            title={job.applyLink}
                          >
                            <ExternalLink className="size-3 shrink-0" />
                            <span className="truncate">{job.applyLink}</span>
                          </a>
                        </>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            className="h-8 rounded-lg px-2.5 text-xs text-[#2a6080] hover:bg-[#96C2DB]/20"
                            onClick={() => startEditJob(job)}
                          >
                            <Pencil className="mr-1 size-3" /> Edit
                          </Button>
                          {job.applyLink && (
                            <Button
                              variant="ghost"
                              className="h-8 rounded-lg bg-[#E5EDF1] px-2.5 text-xs text-[#2a6080] hover:bg-[#96C2DB]/30"
                              onClick={() => {
                                void navigator.clipboard.writeText(
                                  job.applyLink ?? "",
                                );
                                toast.success("Apply link copied.");
                              }}
                            >
                              <ExternalLink className="mr-1 size-3" /> Copy Link
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          className="ml-auto h-8 rounded-lg bg-red-50 px-2.5 text-xs text-red-600 hover:bg-red-100"
                          onClick={() => void deleteJobRole(job.id)}
                        >
                          <Trash2 className="mr-1 size-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── SETTINGS ── */}
          {activeMenu === "settings" && (
            <Card className="border-[#96C2DB]/30 bg-white shadow-sm">
              <CardHeader className="border-b border-[#E5EDF1] bg-[#E5EDF1]/40 pb-4">
                <CardTitle className="flex items-center gap-2 text-[#1a3a4a]">
                  <Settings className="size-5 text-[#96C2DB]" /> Hiring
                  Settings
                </CardTitle>
                <CardDescription className="text-[#2a6080]/60">
                  Current ATS policy and interview pipeline controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-5 text-sm">
                <div className="rounded-xl border border-[#96C2DB]/30 bg-[#E5EDF1]/40 p-4 text-[#1a3a4a]">
                  ATS rejection threshold is set to{" "}
                  <span className="font-bold">{ATS_THRESHOLD}</span>.
                </div>
                <div className="rounded-xl border border-[#96C2DB]/30 bg-[#E5EDF1]/40 p-4 text-[#1a3a4a]">
                  Auto-mail and Zoom APIs are mocked in frontend and will be
                  integrated in backend.
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* ── Job modal ── */}
      <Dialog
        open={isJobModalOpen}
        onOpenChange={(open) => {
          setIsJobModalOpen(open);
          if (!open) resetJobModalState();
        }}
      >
        <DialogContent className="border-[#96C2DB]/30 bg-white text-[#1a3a4a]">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a4a]">
              {jobModalMode === "create" ? "Create Job" : "Edit Job"}
            </DialogTitle>
            <DialogDescription className="text-[#2a6080]/60">
              Fill in role details and upload JD.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-1">
            <div className="space-y-2">
              <Label htmlFor="job-role" className="text-[#1a3a4a]">
                Job Role *
              </Label>
              <Input
                id="job-role"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Frontend Engineer"
                className="!border-[#96C2DB]/40 focus-visible:!ring-[#96C2DB]/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-ats" className="text-[#1a3a4a]">
                Required ATS Match (%)
              </Label>
              <div className="relative">
                <Input
                  id="job-ats"
                  value={jobAts}
                  onChange={(e) => setJobAts(e.target.value)}
                  type="number"
                  min={0}
                  max={100}
                  className="!border-[#96C2DB]/40 pr-8 focus-visible:!ring-[#96C2DB]/30"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#2a6080]/60">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-jd" className="text-[#1a3a4a]">
                JD PDF Upload{" "}
                {jobModalMode === "create" ? "*" : "(optional)"}
              </Label>
              <input
                id="job-jd"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleJobFileSelect(e.target.files?.[0])}
                className="hidden"
              />
              <Label
                htmlFor="job-jd"
                className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
              >
                Select PDF File
              </Label>
              {jobFileName && (
                <p className="text-xs text-[#2a6080]/70">
                  Selected: {jobFileName}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
              onClick={() => setIsJobModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void saveJob()}
              disabled={isSavingJob}
              className="bg-[#1a3a4a] text-white hover:bg-[#2a5a70]"
            >
              {isSavingJob
                ? "Saving…"
                : jobModalMode === "create"
                  ? "Create Job"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Low ATS prompt ── */}
      <Dialog
        open={showRejectPrompt}
        onOpenChange={(open) => !open && setLowAtsPromptDismissed(true)}
      >
        <DialogContent className="border-[#96C2DB]/30 bg-white text-[#1a3a4a]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1a3a4a]">
              <AlertCircle className="size-5 text-amber-500" />
              HR Action Required: Low ATS Profiles
            </DialogTitle>
            <DialogDescription className="text-[#2a6080]/60">
              {lowAtsResumes.length} candidate profile(s) are below ATS{" "}
              {ATS_THRESHOLD}. Choose one action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
              onClick={keepLowAtsResumes}
            >
              Review Manually
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={rejectLowAtsResumes}
            >
              Reject All Low ATS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Settings & Authorization Modal ── */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="border-[#96C2DB]/30 bg-white text-[#1a3a4a] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1a3a4a]">
              <Settings className="size-5 text-[#667eea]" />
              Grant Portal Access
            </DialogTitle>
            <DialogDescription className="text-[#2a6080]/60">
              Authorize {activeResume?.candidateName} for the assessment portal. 
              An email with login credentials will be sent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-[#96C2DB]/30 bg-[#E8EEF4]/40 p-4">
              <p className="text-sm font-medium text-[#1a3a4a]">Candidate Details</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2a6080]">Name:</span>
                  <span className="font-medium text-[#1a3a4a]">
                    {activeResume?.candidateName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2a6080]">Email:</span>
                  <span className="font-medium text-[#1a3a4a]">
                    {activeResume?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2a6080]">Position:</span>
                  <span className="font-medium text-[#1a3a4a]">
                    {activeResume?.jobRole}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  A secure password will be generated and sent via email. The candidate 
                  can change it upon first login.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
              onClick={() => setIsSettingsModalOpen(false)}
              disabled={isAuthorizingCandidate}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void authorizeCandidate()}
              disabled={isAuthorizingCandidate}
              className="bg-[#667eea] text-white hover:bg-[#5568d3]"
            >
              {isAuthorizingCandidate ? (
                <>
                  <span className="mr-2 inline-block animate-spin">⚙️</span>
                  Sending...
                </>
              ) : (
                "Send Authorization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Candidate detail modal ── */}
      <Dialog open={openResumeModal} onOpenChange={setOpenResumeModal}>
        <DialogContent className="h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto border border-[#96C2DB]/30 bg-white p-0 text-[#1a3a4a] shadow-2xl sm:w-[900px] sm:min-w-[900px] sm:max-w-[900px] sm:overflow-hidden lg:w-[1100px] lg:min-w-[1100px] lg:max-w-[1100px] xl:w-[1200px] xl:min-w-[1200px] xl:max-w-[1200px]">
          <DialogHeader className="sr-only">
            <DialogTitle>Candidate Application Details</DialogTitle>
            <DialogDescription>
              Detailed view of candidate profile, resume information, and
              application actions.
            </DialogDescription>
          </DialogHeader>
          {activeResume ? renderCandidateModal() : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ─────────────────────────── SUB-COMPONENTS ──────────────────────────────── */

type ActionVariant = "accent" | "secondary" | "danger" | "ghost" | "disabled";

function CandidateActionBtn({
  icon: Icon,
  label,
  variant,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  variant: ActionVariant;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const styles: Record<ActionVariant, string> = {
    accent:
      "border-[#96C2DB] bg-[#96C2DB] text-white hover:bg-[#7aafc9] hover:border-[#7aafc9]",
    secondary:
      "border-[#96C2DB]/40 bg-[#E5EDF1] text-[#2a6080] hover:bg-[#96C2DB] hover:text-white",
    danger:
      "border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-40",
    ghost:
      "border-[#96C2DB]/30 bg-white text-[#2a6080] hover:bg-[#E5EDF1]",
    disabled:
      "border-[#96C2DB]/20 bg-[#E5EDF1]/30 text-[#2a6080]/30 cursor-not-allowed",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${styles[variant]}`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#96C2DB]/30 bg-white shadow-sm">
      <div className="border-b border-[#E5EDF1] bg-[#E5EDF1]/50 px-5 py-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#2a6080]/60">
          {title}
        </h4>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  icon: "search" | "calendar";
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Icon = icon === "search" ? Search : Calendar;

  return (
    <div className="rounded-2xl border border-dashed border-[#96C2DB]/40 bg-[#E5EDF1]/30 p-8 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/70">
        <Icon className="size-8 text-[#2a6080]/35" />
      </div>
      <p className="text-lg font-medium text-slate-500">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#2a6080]/65">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 text-sm font-semibold text-[#1f6f95] underline decoration-[#1f6f95]/40 underline-offset-4 transition hover:text-[#1a3a4a]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}