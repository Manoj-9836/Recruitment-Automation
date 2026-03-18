import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { Briefcase, CheckCircle2, Clock3, Code2, FileDown, Sparkles, Target } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import LoginScreen from "@/components/auth/LoginScreen";
import IntroLoader from "@/components/common/IntroLoader";
import HRDashboard from "@/components/hr/HRDashboard";
import {
  INITIAL_JOB_POSTINGS,
  INITIAL_RESUMES,
  INTERVIEW_ROUNDS,
  STORAGE_KEYS,
} from "@/data/recruitment";
import type { JobPosting, ResumeCandidate, Role } from "@/types/recruitment";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

type InterviewQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
};

type RoundScore = {
  roundName: string;
  correct: number;
  total: number;
};

type ReportCardData = {
  candidateName: string;
  jobRole: string;
  completedAt: string;
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  roundScores: RoundScore[];
};

const INTERVIEW_QUESTION_BANK: InterviewQuestion[][] = [
  [
    {
      id: "apt-1",
      question: "If the ratio of men to women is 3:2 in a team of 50, how many women are there?",
      options: ["18", "20", "22", "24"],
      correctOptionIndex: 1,
    },
    {
      id: "apt-2",
      question: "What is 15% of 260?",
      options: ["36", "39", "42", "45"],
      correctOptionIndex: 1,
    },
  ],
  [
    {
      id: "rea-1",
      question: "Find the next number: 2, 6, 12, 20, 30, ?",
      options: ["38", "40", "42", "44"],
      correctOptionIndex: 2,
    },
    {
      id: "rea-2",
      question: "If all APIs are Services and some Services are Secure, which is definitely true?",
      options: ["All APIs are Secure", "Some APIs are Secure", "No API is Secure", "Cannot be determined"],
      correctOptionIndex: 3,
    },
  ],
  [
    {
      id: "mcq-1",
      question: "In HTTP, which status code indicates successful resource creation?",
      options: ["200", "201", "204", "301"],
      correctOptionIndex: 1,
    },
    {
      id: "mcq-2",
      question: "Which SQL clause is used to filter grouped results?",
      options: ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
      correctOptionIndex: 2,
    },
  ],
  [
    {
      id: "code-1",
      question: "What is the time complexity of binary search on a sorted array?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correctOptionIndex: 1,
    },
    {
      id: "code-2",
      question: "Which data structure is best suited for BFS traversal?",
      options: ["Stack", "Queue", "Heap", "Set"],
      correctOptionIndex: 1,
    },
  ],
  [
    {
      id: "ver-1",
      question: "What is the best first response when requirements are unclear?",
      options: ["Start coding immediately", "Ask clarifying questions", "Ignore missing info", "Escalate without context"],
      correctOptionIndex: 1,
    },
    {
      id: "ver-2",
      question: "Which communication style is best in incident updates?",
      options: ["Vague and optimistic", "Brief, factual, time-bound", "Overly technical only", "No updates until resolved"],
      correctOptionIndex: 1,
    },
  ],
];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [resumeData, setResumeData] = useState<ResumeCandidate[]>(() => {
    const storedResumes = localStorage.getItem(STORAGE_KEYS.resumes);
    if (!storedResumes) {
      return INITIAL_RESUMES;
    }

    try {
      const parsed = JSON.parse(storedResumes) as ResumeCandidate[];
      const storedById = new Map(parsed.map((candidate) => [candidate.id, candidate]));

      for (const candidate of INITIAL_RESUMES) {
        if (!storedById.has(candidate.id)) {
          storedById.set(candidate.id, candidate);
        }
      }

      return Array.from(storedById.values());
    } catch {
      return INITIAL_RESUMES;
    }
  });

  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => {
    const storedJobs = localStorage.getItem(STORAGE_KEYS.jobs);
    return storedJobs ? (JSON.parse(storedJobs) as JobPosting[]) : INITIAL_JOB_POSTINGS;
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (resumeData.length > 0) {
      localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(resumeData));
    }
  }, [resumeData]);

  useEffect(() => {
    if (jobPostings.length > 0) {
      localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobPostings));
    }
  }, [jobPostings]);

  const onLogin = () => {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      setLoginError("Enter username and password.");
      return;
    }

    if (normalizedUsername === "hr@company.com" && normalizedPassword === "Hr123") {
      setRole("hr");
      setLoginError("");
      setIsAuthenticated(true);
      return;
    }

    if (normalizedUsername.endsWith("@gmail.com")) {
      setRole("candidate");
      setLoginError("");
      setIsAuthenticated(true);
      return;
    }

    setLoginError("Invalid credentials. Use HR credentials or a Gmail account.");
  };

  const onContinueGoogle = () => {
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername.endsWith("@gmail.com")) {
      setRole("candidate");
      setLoginError("");
      setIsAuthenticated(true);
      return;
    }

    setLoginError("Enter a Gmail address to continue with Google.");
  };

  const onChangeUsername = (value: string) => {
    setUsername(value);
    if (loginError) {
      setLoginError("");
    }
  };

  const onChangePassword = (value: string) => {
    setPassword(value);
    if (loginError) {
      setLoginError("");
    }
  };

  const onLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUsername("");
    setPassword("");
    setLoginError("");
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen overflow-x-hidden bg-black text-white">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <IntroLoader key="intro" />
          ) : !isAuthenticated || !role ? (
            <LoginScreen
              key="login"
              username={username}
              password={password}
              loginError={loginError}
              setUsername={onChangeUsername}
              setPassword={onChangePassword}
              onLogin={onLogin}
              onContinueGoogle={onContinueGoogle}
            />
          ) : role === "hr" ? (
            <HRDashboard
              key="hr"
              resumes={resumeData}
              setResumes={setResumeData}
              jobs={jobPostings}
              setJobs={setJobPostings}
              onLogout={onLogout}
            />
          ) : (
            <CandidateDashboard key="candidate" resumes={resumeData} setResumes={setResumeData} onLogout={onLogout} />
          )}
        </AnimatePresence>
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </div>
    </ThemeProvider>
  );
}

type CandidateDashboardProps = {
  resumes: ResumeCandidate[];
  setResumes: Dispatch<SetStateAction<ResumeCandidate[]>>;
  onLogout: () => void;
};

function CandidateDashboard({ resumes, setResumes, onLogout }: CandidateDashboardProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isInInterview, setIsInInterview] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswersByRound, setSelectedAnswersByRound] = useState<Record<number, number[]>>({});
  const [reportCard, setReportCard] = useState<ReportCardData | null>(null);

  const appliedJobs = resumes.filter((item) => item.status !== "rejected");
  const selectedCount = appliedJobs.filter((item) => item.status === "selected").length;
  const completedCount = appliedJobs.filter((item) => item.status === "interview_completed").length;
  const selectedInterviewJob = appliedJobs.find((item) => item.status === "selected");
  const showSelectedPopup = Boolean(selectedInterviewJob && !isInInterview && selectedJobId !== selectedInterviewJob.id);

  const selectedJob = appliedJobs.find((item) => item.id === selectedJobId) ?? null;
  const currentRoundQuestions = INTERVIEW_QUESTION_BANK[currentRound] ?? [];

  const enterInterview = () => {
    if (!selectedInterviewJob) {
      return;
    }
    setSelectedJobId(selectedInterviewJob.id);
    setIsInInterview(true);
    setCurrentRound(0);
    setSelectedAnswersByRound({});
    setReportCard(null);
    setIsCompleted(false);
  };

  const onSelectedPopupOpenChange = (open: boolean) => {
    if (open || !selectedInterviewJob) {
      return;
    }
    setSelectedJobId(selectedInterviewJob.id);
  };

  const startBookedInterview = () => {
    if (!selectedJob) {
      return;
    }
    setIsInInterview(true);
    setCurrentRound(0);
    setSelectedAnswersByRound({});
    setReportCard(null);
    setIsCompleted(false);
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswersByRound((prev) => {
      const roundAnswers = [...(prev[currentRound] ?? [])];
      roundAnswers[questionIndex] = optionIndex;
      return {
        ...prev,
        [currentRound]: roundAnswers,
      };
    });
  };

  const completeInterview = () => {
    const roundScores = INTERVIEW_ROUNDS.map((roundName, roundIndex) => {
      const questions = INTERVIEW_QUESTION_BANK[roundIndex] ?? [];
      const selectedAnswers = selectedAnswersByRound[roundIndex] ?? [];

      const correct = questions.reduce((count, question, questionIndex) => {
        return selectedAnswers[questionIndex] === question.correctOptionIndex ? count + 1 : count;
      }, 0);

      return {
        roundName,
        correct,
        total: questions.length,
      };
    });

    const totalQuestions = roundScores.reduce((sum, round) => sum + round.total, 0);
    const totalCorrect = roundScores.reduce((sum, round) => sum + round.correct, 0);
    const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const candidateName = selectedJob?.candidateName ?? selectedInterviewJob?.candidateName ?? "Candidate";
    const jobRole = selectedJob?.jobRole ?? selectedInterviewJob?.jobRole ?? "Not specified";

    setReportCard({
      candidateName,
      jobRole,
      completedAt: new Date().toISOString(),
      totalCorrect,
      totalQuestions,
      percentage,
      roundScores,
    });

    if (selectedJobId) {
      setResumes((prev) =>
        prev.map((item) =>
          item.id === selectedJobId
            ? {
                ...item,
                status: "interview_completed",
              }
            : item,
        ),
      );
    }

    setIsInInterview(false);
    setIsCompleted(true);
    toast.success(`Interview completed. Final score: ${percentage}%`);
  };

  const submitCurrentRound = () => {
    const selectedAnswers = selectedAnswersByRound[currentRound] ?? [];
    const unansweredExists = currentRoundQuestions.some((_, questionIndex) => selectedAnswers[questionIndex] === undefined);

    if (unansweredExists) {
      toast.error("Please answer all questions in this round before continuing.");
      return;
    }

    if (currentRound < INTERVIEW_ROUNDS.length - 1) {
      setCurrentRound((prev) => prev + 1);
      return;
    }

    completeInterview();
  };

  const backToDashboard = () => {
    setIsInInterview(false);
    setIsCompleted(false);
    setCurrentRound(0);
    setSelectedAnswersByRound({});
    setReportCard(null);
    setSelectedJobId(null);
    toast.info("Returned to dashboard.");
  };

  const downloadReportCard = () => {
    if (!reportCard) {
      toast.error("Report card is not ready yet.");
      return;
    }

    const lines = [
      "Recruitment Automation - Interview Report Card",
      "",
      `Candidate Name: ${reportCard.candidateName}`,
      `Job Role: ${reportCard.jobRole}`,
      `Completed At: ${new Date(reportCard.completedAt).toLocaleString()}`,
      "",
      `Total Score: ${reportCard.totalCorrect}/${reportCard.totalQuestions}`,
      `Percentage: ${reportCard.percentage}%`,
      "",
      "Round-wise Scores:",
      ...reportCard.roundScores.map(
        (round, index) => `${index + 1}. ${round.roundName}: ${round.correct}/${round.total}`,
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const fileUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.download = `report-card-${reportCard.candidateName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(fileUrl);

    toast.success("Report card downloaded.");
  };

  return (
    <motion.div
      key="candidate-dashboard"
      className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_92%_8%,rgba(14,165,233,0.10),transparent_30%)]" />
      <div className="relative">
        {isInInterview ? (
          <ExamPortal
            currentRound={currentRound}
            questions={currentRoundQuestions}
            selectedAnswers={selectedAnswersByRound[currentRound] ?? []}
            onSelectAnswer={handleSelectAnswer}
            onSubmitRound={submitCurrentRound}
            candidateName={selectedJob?.candidateName ?? selectedInterviewJob?.candidateName ?? "Candidate"}
            jobRole={selectedJob?.jobRole ?? selectedInterviewJob?.jobRole ?? "Role"}
          />
        ) : (
          <>
      <TopBar roleLabel="Candidate Workspace" onLogout={onLogout} />

      <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
        <Card className="border-zinc-800/90 bg-zinc-900/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Applied Jobs</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{appliedJobs.length}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/90 bg-zinc-900/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Selected</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{selectedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/90 bg-zinc-900/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-sky-300">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {!isCompleted ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="glass border-zinc-800/90 bg-zinc-950/60 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Briefcase className="size-5 text-emerald-300" /> Applied Jobs
              </CardTitle>
              <CardDescription>Select the job for which you booked an interview slot.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[560px] space-y-3 overflow-auto pr-1">
              {appliedJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                    selectedJobId === job.id
                      ? "border-emerald-400/60 bg-emerald-500/10 shadow-[0_10px_35px_-20px_rgba(16,185,129,0.8)]"
                      : "border-zinc-700/80 bg-zinc-900/70 hover:border-zinc-500"
                  }`}
                >
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-semibold text-zinc-100">{job.jobRole}</p>
                      <p className="text-xs text-zinc-400">Candidate: {job.candidateName}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge className="bg-zinc-800 text-zinc-200">ATS {job.atsScore}%</Badge>
                      {job.status === "selected" ? (
                        <Badge className="border border-emerald-400/40 bg-emerald-500/20 text-emerald-200">Interview Selected</Badge>
                      ) : (
                        <Badge className="bg-zinc-700 text-zinc-200">Applied</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-zinc-800/90 bg-zinc-950/60 lg:sticky lg:top-6 lg:self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Code2 className="size-5 text-sky-300" /> Interview Center
              </CardTitle>
              <CardDescription>Proceed through all rounds when selected.</CardDescription>
            </CardHeader>
            <CardContent>
              {!isInInterview ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Current Selection</p>
                    <p className="text-sm text-zinc-300">
                    {selectedJob
                      ? `Selected job: ${selectedJob.jobRole}`
                      : "Choose a job from the left panel to continue."}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 text-black hover:from-sky-400 hover:to-emerald-400"
                    onClick={startBookedInterview}
                    disabled={!selectedJob}
                  >
                    Enter Interview Rounds
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        <CompletionPage reportCard={reportCard} onDownloadReportCard={downloadReportCard} onBackToDashboard={backToDashboard} />
      )}

      <Dialog open={showSelectedPopup} onOpenChange={onSelectedPopupOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] border-zinc-700 bg-zinc-950 text-zinc-100 sm:w-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-100">
              <Sparkles className="size-5 text-emerald-300" /> You Are Selected for Interview
            </DialogTitle>
            <DialogDescription>
              HR has shortlisted your profile. Click below to take an interview.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-gradient-to-r from-emerald-500 to-sky-500 text-black hover:from-emerald-400 hover:to-sky-400" onClick={enterInterview}>
              Take an Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </>
        )}
      </div>
    </motion.div>
  );
}

function ExamPortal({
  currentRound,
  questions,
  selectedAnswers,
  onSelectAnswer,
  onSubmitRound,
  candidateName,
  jobRole,
}: {
  currentRound: number;
  questions: InterviewQuestion[];
  selectedAnswers: number[];
  onSelectAnswer: (questionIndex: number, optionIndex: number) => void;
  onSubmitRound: () => void;
  candidateName: string;
  jobRole: string;
}) {
  const progress = ((currentRound + 1) / INTERVIEW_ROUNDS.length) * 100;
  const answeredCount = selectedAnswers.filter((ans) => ans !== undefined).length;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8 rounded-3xl border border-zinc-700/60 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/80">Assessment Portal</p>
            <div className="mt-3 space-y-1">
              <p className="text-2xl font-bold text-zinc-100">{candidateName}</p>
              <p className="text-sm text-zinc-400 font-medium">{jobRole}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge className="border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-semibold">
              Round {currentRound + 1} of {INTERVIEW_ROUNDS.length}
            </Badge>
            <div className="rounded-lg bg-zinc-800/40 px-3 py-1.5 text-xs">
              <p className="text-zinc-400"><span className="font-semibold text-zinc-200">{answeredCount}/{questions.length}</span> Answered</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Round Progress</p>
            <p className="text-xs font-medium text-emerald-400">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
        </div>
      </div>

      <InterviewRounds
        currentRound={currentRound}
        questions={questions}
        selectedAnswers={selectedAnswers}
        onSelectAnswer={onSelectAnswer}
        onSubmitRound={onSubmitRound}
      />
    </div>
  );
}

function InterviewRounds({
  currentRound,
  questions,
  selectedAnswers,
  onSelectAnswer,
  onSubmitRound,
}: {
  currentRound: number;
  questions: InterviewQuestion[];
  selectedAnswers: number[];
  onSelectAnswer: (questionIndex: number, optionIndex: number) => void;
  onSubmitRound: () => void;
}) {
  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-700/40 bg-gradient-to-br from-zinc-900/50 to-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Current Round</p>
        <p className="mt-2 text-xl font-bold text-zinc-100">{INTERVIEW_ROUNDS[currentRound]}</p>
      </div>

      <div className="space-y-5">
        {questions.map((question, questionIndex) => {
          const isAnswered = selectedAnswers[questionIndex] !== undefined;
          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: questionIndex * 0.1 }}
              className="group rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/40 to-zinc-950 p-5 transition-all duration-300 hover:border-zinc-600/80"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-100 leading-relaxed">
                    <span className="inline-block mr-2 rounded-full bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center text-xs font-semibold">Q{questionIndex + 1}</span>
                    {question.question}
                  </p>
                </div>
                {isAnswered && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 rounded-full bg-emerald-500/20 p-1.5"
                  >
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  </motion.div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2.5 mt-4">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedAnswers[questionIndex] === optionIndex;

                  return (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectAnswer(questionIndex, optionIndex)}
                      className={`relative rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-100 shadow-lg shadow-emerald-500/20"
                          : "border-zinc-700/60 bg-zinc-900/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/70"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current text-xs font-semibold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-4"
      >
        <Button
          disabled={!allAnswered}
          onClick={onSubmitRound}
          className={`w-full py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
            allAnswered
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-black hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/30"
              : "bg-zinc-800/60 text-zinc-400 cursor-not-allowed border border-zinc-700/50"
          }`}
        >
          {currentRound === INTERVIEW_ROUNDS.length - 1 ? "Finish Interview" : "Submit Round and Continue"}
        </Button>
        {!allAnswered && (
          <p className="mt-2 text-xs text-zinc-400 text-center">
            Please answer all questions to continue.
          </p>
        )}
      </motion.div>
    </div>
  );
}

function CompletionPage({
  reportCard,
  onDownloadReportCard,
  onBackToDashboard,
}: {
  reportCard: ReportCardData | null;
  onDownloadReportCard: () => void;
  onBackToDashboard: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto mt-10 max-w-2xl"
    >
      <Card className="glass border-zinc-700 text-center shadow-[0_25px_90px_-45px_rgba(16,185,129,0.7)]">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="size-7" />
          </div>
          <CardTitle>Interview Completed Successfully</CardTitle>
          <CardDescription>
            Your assessment is complete. You can download the report card with round-wise scores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportCard ? (
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-left">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Final Score</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">
                {reportCard.totalCorrect}/{reportCard.totalQuestions} ({reportCard.percentage}%)
              </p>
              <div className="mt-3 space-y-1 text-sm text-zinc-300">
                {reportCard.roundScores.map((round) => (
                  <p key={round.roundName}>
                    {round.roundName}: {round.correct}/{round.total}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1 bg-gradient-to-r from-sky-500 to-emerald-500 text-black hover:from-sky-400 hover:to-emerald-400" onClick={onDownloadReportCard}>
              <FileDown className="mr-2 size-4" /> Download Report Card
            </Button>
            <Button className="flex-1 border border-zinc-700 bg-zinc-950/60 text-zinc-200 hover:bg-zinc-900" onClick={onBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TopBar({ roleLabel, onLogout }: { roleLabel: string; onLogout: () => void }) {
  return (
    <header className="glass flex flex-col items-start justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recruitment Automation</p>
        <h1 className="text-xl font-semibold text-zinc-100">{roleLabel}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border border-zinc-700 bg-zinc-800 text-zinc-100">
          <Target className="mr-1 size-3" /> Frontend Only
        </Badge>
        <Badge className="border border-zinc-700 bg-zinc-900 text-zinc-300">
          <Clock3 className="mr-1 size-3" /> Live Session
        </Badge>
        <Button variant="outline" className="border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default App;
