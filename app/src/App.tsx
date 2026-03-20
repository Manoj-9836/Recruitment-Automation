import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { AlertTriangle, Briefcase, CheckCircle2, Clock3, Code2, FileDown, Loader2, Mic, Sparkles, Target, Video } from "lucide-react";
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
import LoginScreen from "@/components/auth/LoginScreen";
import JobApplicationForm from "@/components/auth/JobApplicationForm";
import HRDashboard from "@/components/hr/HRDashboard";
import { INTERVIEW_ROUNDS } from "@/data/recruitment";
import { fetchCandidates, fetchJobs, loginWithCredentials, saveCandidates, candidateLogin, getCandidateToken, clearCandidateTokens, verifyCandidateToken, setAuthToken } from "@/lib/api";
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
    {
      id: "apt-3",
      question: "A number is increased by 20% and becomes 360. What was the original number?",
      options: ["280", "290", "300", "320"],
      correctOptionIndex: 2,
    },
    {
      id: "apt-4",
      question: "What is the simple interest on 2000 at 10% per annum for 2 years?",
      options: ["200", "300", "400", "500"],
      correctOptionIndex: 2,
    },
    {
      id: "apt-5",
      question: "If 8 workers complete a task in 15 days, how many days will 12 workers take?",
      options: ["8", "10", "12", "14"],
      correctOptionIndex: 1,
    },
    {
      id: "apt-6",
      question: "Average of 12, 18, 24, 30, and 36 is:",
      options: ["22", "24", "26", "28"],
      correctOptionIndex: 1,
    },
    {
      id: "apt-7",
      question: "A train 120 m long passes a pole in 6 seconds. Its speed is:",
      options: ["20 m/s", "22 m/s", "24 m/s", "26 m/s"],
      correctOptionIndex: 0,
    },
    {
      id: "apt-8",
      question: "If x : y = 5 : 7 and y : z = 3 : 4, then x : y : z is:",
      options: ["15:21:28", "5:7:4", "10:21:28", "15:7:12"],
      correctOptionIndex: 0,
    },
    {
      id: "apt-9",
      question: "What is the next number in the series: 5, 11, 23, 47, ?",
      options: ["89", "95", "101", "111"],
      correctOptionIndex: 1,
    },
    {
      id: "apt-10",
      question: "A shop gives 20% discount on marked price 1500. Selling price is:",
      options: ["1100", "1150", "1200", "1250"],
      correctOptionIndex: 2,
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
    {
      id: "rea-3",
      question: "Choose the odd one out: Circle, Triangle, Square, Cube",
      options: ["Circle", "Triangle", "Square", "Cube"],
      correctOptionIndex: 3,
    },
    {
      id: "rea-4",
      question: "If CAT = 24, DOG = 26, then BAT = ?",
      options: ["21", "22", "23", "24"],
      correctOptionIndex: 1,
    },
    {
      id: "rea-5",
      question: "Statement: All coders are learners. Some learners are mentors. Conclusion?",
      options: ["All coders are mentors", "Some coders are mentors", "No coder is mentor", "No definite conclusion"],
      correctOptionIndex: 3,
    },
    {
      id: "rea-6",
      question: "Find the missing term: AZ, BY, CX, ?",
      options: ["DV", "DW", "EV", "DZ"],
      correctOptionIndex: 1,
    },
    {
      id: "rea-7",
      question: "If today is Wednesday, what day will it be after 100 days?",
      options: ["Friday", "Saturday", "Sunday", "Monday"],
      correctOptionIndex: 0,
    },
    {
      id: "rea-8",
      question: "Which number does not belong: 3, 5, 11, 14, 17",
      options: ["3", "5", "11", "14"],
      correctOptionIndex: 3,
    },
    {
      id: "rea-9",
      question: "A is taller than B, B is taller than C, C is taller than D. Who is shortest?",
      options: ["A", "B", "C", "D"],
      correctOptionIndex: 3,
    },
    {
      id: "rea-10",
      question: "Mirror image of 2:15 clock time is:",
      options: ["9:45", "10:45", "11:45", "8:45"],
      correctOptionIndex: 0,
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
    {
      id: "mcq-3",
      question: "Which method is idempotent in HTTP?",
      options: ["POST", "PUT", "PATCH", "CONNECT"],
      correctOptionIndex: 1,
    },
    {
      id: "mcq-4",
      question: "Which React hook is used for side effects?",
      options: ["useMemo", "useState", "useEffect", "useRef"],
      correctOptionIndex: 2,
    },
    {
      id: "mcq-5",
      question: "Which command creates a new Git branch and switches to it?",
      options: ["git branch -n", "git checkout -b", "git switch -d", "git clone -b"],
      correctOptionIndex: 1,
    },
    {
      id: "mcq-6",
      question: "In SQL, which join returns all rows when there is a match in either table?",
      options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
      correctOptionIndex: 3,
    },
    {
      id: "mcq-7",
      question: "Which data format is most commonly used for REST APIs?",
      options: ["XML", "YAML", "JSON", "CSV"],
      correctOptionIndex: 2,
    },
    {
      id: "mcq-8",
      question: "Which CSS property controls the stacking order of elements?",
      options: ["display", "z-index", "position", "overflow"],
      correctOptionIndex: 1,
    },
    {
      id: "mcq-9",
      question: "Which TypeScript type can hold any value without checks?",
      options: ["unknown", "never", "any", "void"],
      correctOptionIndex: 2,
    },
    {
      id: "mcq-10",
      question: "Which Docker command lists running containers?",
      options: ["docker ls", "docker ps", "docker run", "docker start"],
      correctOptionIndex: 1,
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
    {
      id: "code-3",
      question: "What does this return: [1,2,3].map(x => x * 2)?",
      options: ["[2,4,6]", "[1,2,3,2,4,6]", "6", "undefined"],
      correctOptionIndex: 0,
    },
    {
      id: "code-4",
      question: "Which sorting algorithm has average complexity O(n log n)?",
      options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
      correctOptionIndex: 2,
    },
    {
      id: "code-5",
      question: "What is the output of 10 % 3 in JavaScript?",
      options: ["0", "1", "3", "10"],
      correctOptionIndex: 1,
    },
    {
      id: "code-6",
      question: "Which keyword defines an immutable variable in JavaScript?",
      options: ["var", "let", "const", "static"],
      correctOptionIndex: 2,
    },
    {
      id: "code-7",
      question: "Which operation has O(1) average complexity in a hash map?",
      options: ["Search", "Traversal", "Sorting", "Merging"],
      correctOptionIndex: 0,
    },
    {
      id: "code-8",
      question: "What does recursion require to avoid infinite calls?",
      options: ["A base case", "A loop", "A class", "A promise"],
      correctOptionIndex: 0,
    },
    {
      id: "code-9",
      question: "Which SQL command removes all rows but keeps table structure?",
      options: ["DELETE", "DROP", "TRUNCATE", "REMOVE"],
      correctOptionIndex: 2,
    },
    {
      id: "code-10",
      question: "Which of these is a valid RESTful endpoint naming pattern?",
      options: ["/getUsers", "/users", "/UserList", "/users/getAll"],
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
    {
      id: "ver-3",
      question: "Best way to give negative feedback in a team setting is:",
      options: ["Public channel immediately", "Private, specific, constructive", "Ignore it", "Only written warning"],
      correctOptionIndex: 1,
    },
    {
      id: "ver-4",
      question: "Which opening is best for a status update email?",
      options: ["Everything is fine", "Sharing current status, blockers, and next steps", "No major info", "Please ignore"],
      correctOptionIndex: 1,
    },
    {
      id: "ver-5",
      question: "If you disagree with a teammate's approach, you should:",
      options: ["Escalate immediately", "Dismiss it", "Discuss respectfully with evidence", "Stay silent always"],
      correctOptionIndex: 2,
    },
    {
      id: "ver-6",
      question: "In a client call, if you do not know the answer, best response is:",
      options: ["Guess confidently", "Say nothing", "Acknowledge and commit to follow-up", "Change topic"],
      correctOptionIndex: 2,
    },
    {
      id: "ver-7",
      question: "Which phrase shows ownership?",
      options: ["Not my issue", "I will coordinate and update by EOD", "Someone should do this", "Can't help"],
      correctOptionIndex: 1,
    },
    {
      id: "ver-8",
      question: "Best way to communicate a delay is:",
      options: ["At deadline time", "As early as possible with revised ETA", "After task is done", "Never mention it"],
      correctOptionIndex: 1,
    },
    {
      id: "ver-9",
      question: "During conflict, what should be prioritized?",
      options: ["Winning argument", "Blame assignment", "Shared goal and facts", "Seniority"],
      correctOptionIndex: 2,
    },
    {
      id: "ver-10",
      question: "A concise meeting summary should include:",
      options: ["Only attendees", "Action items, owners, due dates", "Random notes", "None"],
      correctOptionIndex: 1,
    },
  ],
];

function App() {
  const applySlug = new URLSearchParams(window.location.search).get("apply");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isHydratingFromBackend, setIsHydratingFromBackend] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeCandidate[]>([]);

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const syncWarningShownRef = useRef(false);

  // Check for existing candidate token on app load
  useEffect(() => {
    const checkCandidateToken = async () => {
      if (applySlug) return; // Skip if on application page

      const token = getCandidateToken();
      if (!token) return;

      try {
        // Set the token in the API client first
        setAuthToken(token);
        
        // Verify token is still valid
        const verification = await verifyCandidateToken(token);
        if (verification.valid) {
          setCandidateId(verification.candidateId);
          setRole("candidate");
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear it
          clearCandidateTokens();
        }
      } catch {
        // Token verification failed, clear it
        clearCandidateTokens();
      }
    };

    checkCandidateToken();
  }, [applySlug]);

  useEffect(() => {
    if (applySlug) {
      setIsHydratingFromBackend(false);
      return;
    }

    let isDisposed = false;

    const loadBackendData = async () => {
      try {
        const [remoteCandidates, remoteJobs] = await Promise.all([fetchCandidates(), fetchJobs()]);
        if (isDisposed) {
          return;
        }

        setResumeData(remoteCandidates);
        setJobPostings(remoteJobs);
        setBackendConnected(true);
        syncWarningShownRef.current = false;
      } catch {
        if (!isDisposed) {
          setBackendConnected(false);
          setResumeData([]);
          setJobPostings([]);
          if (!syncWarningShownRef.current) {
            toast.info("Backend is not reachable. No applications to display until backend is available.");
            syncWarningShownRef.current = true;
          }
        }
      } finally {
        if (!isDisposed) {
          setIsHydratingFromBackend(false);
        }
      }
    };

    void loadBackendData();

    return () => {
      isDisposed = true;
    };
  }, [applySlug]);

  useEffect(() => {
    if (applySlug) {
      return;
    }

    if (isHydratingFromBackend || !backendConnected) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveCandidates(resumeData).catch(() => {
        setBackendConnected(false);
        if (!syncWarningShownRef.current) {
          toast.warning("Lost connection to backend. Updates will not sync until reconnection.");
          syncWarningShownRef.current = true;
        }
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [applySlug, resumeData, isHydratingFromBackend, backendConnected]);

  const onLogin = async (role: "hr" | "candidate") => {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      setLoginError("Enter username and password.");
      return;
    }

    setIsLoginLoading(true);

    try {
      if (role === "hr") {
        // HR Login
        const response = await loginWithCredentials(normalizedUsername, normalizedPassword);
        if (!response.authenticated) {
          setLoginError(response.message);
          return;
        }

        try {
          const [remoteCandidates, remoteJobs] = await Promise.all([
            fetchCandidates(),
            fetchJobs(),
          ]);
          setResumeData(remoteCandidates);
          setJobPostings(remoteJobs);
          setBackendConnected(true);
        } catch {
          setBackendConnected(false);
        }

        setRole(response.role);
        setLoginError("");
        setIsAuthenticated(true);
      } else {
        // Candidate Login
        try {
          const tokenResponse = await candidateLogin(normalizedUsername, normalizedPassword);
          
          // Verify token and get candidate info
          const verifyResponse = await verifyCandidateToken(tokenResponse.access_token);
          
          setCandidateId(verifyResponse.candidateId);
          setRole("candidate");
          setLoginError("");
          setIsAuthenticated(true);
        } catch (err) {
          const error = err as { response?: { data?: { detail?: string } } };
          const errorMessage =
            error?.response?.data?.detail || "Login failed. Check email and password.";
          setLoginError(errorMessage);
          clearCandidateTokens(); // Clear any tokens on error
        }
      }
    } catch {
      setLoginError("Unable to connect to auth service.");
    } finally {
      setIsLoginLoading(false);
    }
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
    clearCandidateTokens(); // Clear JWT tokens
    setIsAuthenticated(false);
    setRole(null);
    setUsername("");
    setPassword("");
    setLoginError("");
    setCandidateId(null);
  };

  const onRefreshHrRecords = async () => {
    const [remoteCandidates, remoteJobs] = await Promise.all([fetchCandidates(), fetchJobs()]);
    setResumeData(remoteCandidates);
    setJobPostings(remoteJobs);
    setBackendConnected(true);
    syncWarningShownRef.current = false;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen overflow-x-hidden bg-black text-white">
        <AnimatePresence mode="wait">
          {applySlug ? (
            <JobApplicationForm key="apply" applySlug={applySlug} />
          ) : !isAuthenticated || !role ? (
            <LoginScreen
              key="login"
              username={username}
              password={password}
              loginError={loginError}
              setUsername={onChangeUsername}
              setPassword={onChangePassword}
              onLogin={onLogin}
              isLoading={isLoginLoading}
            />
          ) : role === "hr" ? (
            <HRDashboard
              key="hr"
              resumes={resumeData}
              setResumes={setResumeData}
              jobs={jobPostings}
              setJobs={setJobPostings}
              onRefresh={onRefreshHrRecords}
              onLogout={onLogout}
            />
          ) : role === "candidate" && candidateId ? (
            <CandidateDashboard
              key="candidate"
              candidateId={candidateId}
              resumes={resumeData}
              setResumes={setResumeData}
              onLogout={onLogout}
            />
          ) : null}
        </AnimatePresence>
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
          toastStyle={{ fontFamily: "Lexend, sans-serif" }}
        />
      </div>
    </ThemeProvider>
  );
}

type CandidateDashboardProps = {
  candidateId: string;
  resumes: ResumeCandidate[];
  setResumes: Dispatch<SetStateAction<ResumeCandidate[]>>;
  onLogout: () => void;
};

function CandidateDashboard({ candidateId, resumes, setResumes, onLogout }: CandidateDashboardProps) {
  type PreflightCheckKey = "camera" | "microphone" | "environment";
  type PreflightCheckState = "idle" | "checking" | "passed" | "failed";

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isInInterview, setIsInInterview] = useState(false);
  const [isExamWarningOpen, setIsExamWarningOpen] = useState(false);
  const [isPreflightOpen, setIsPreflightOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [pendingLaunchRoundIndex, setPendingLaunchRoundIndex] = useState<number | null>(null);
  const [completedRoundsCount, setCompletedRoundsCount] = useState(0);
  const [processingRoundIndex, setProcessingRoundIndex] = useState<number | null>(null);
  const [preflightChecks, setPreflightChecks] = useState({
    camera: false,
    microphone: false,
    environment: false,
  });
  const [preflightStatus, setPreflightStatus] = useState<Record<PreflightCheckKey, PreflightCheckState>>({
    camera: "idle",
    microphone: "idle",
    environment: "idle",
  });
  const [preflightMessages, setPreflightMessages] = useState<Record<PreflightCheckKey, string>>({
    camera: "",
    microphone: "",
    environment: "",
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswersByRound, setSelectedAnswersByRound] = useState<Record<number, number[]>>({});
  const [reportCard, setReportCard] = useState<ReportCardData | null>(null);
  const autoSubmittedRef = useRef(false);
  const completeInterviewRef = useRef<(forcedReason?: "fullscreen-exit" | "tab-switch") => void>(() => {});
  const autoSubmitRoundRef = useRef<(reason: "fullscreen-exit" | "tab-switch") => void>(() => {});

  const selectedSource =
    resumes.find((item) => item.id === candidateId && item.status === "selected") ??
    resumes.find((item) => item.id === candidateId && item.status !== "interview_completed") ??
    resumes.find((item) => item.id === candidateId) ??
    null;
  const selectedInterviewJob = selectedSource
    ? selectedSource.status === "selected"
      ? selectedSource
      : { ...selectedSource, status: "selected" as const }
    : null;

  const completedSource =
    resumes.find((item) => item.status === "interview_completed" && item.id !== selectedInterviewJob?.id) ??
    resumes.find((item) => item.id !== selectedInterviewJob?.id) ??
    null;
  const completedInterviewJob = completedSource
    ? completedSource.status === "interview_completed"
      ? completedSource
      : { ...completedSource, status: "interview_completed" as const }
    : null;
  const appliedJobs = [completedInterviewJob, selectedInterviewJob].filter((item): item is ResumeCandidate => Boolean(item));
  const selectedCount = appliedJobs.filter((item) => item.status === "selected").length;
  const completedCount = appliedJobs.filter((item) => item.status === "interview_completed").length;
  const showSelectedPopup = Boolean(selectedInterviewJob && !isInInterview && selectedJobId !== selectedInterviewJob.id);

  const selectedJob = appliedJobs.find((item) => item.id === selectedJobId) ?? null;
  const currentRoundQuestions = INTERVIEW_QUESTION_BANK[currentRound] ?? [];
  const allPreflightChecksDone = Object.values(preflightChecks).every(Boolean);
  const isAnyPreflightChecking = Object.values(preflightStatus).some((state) => state === "checking");
  const roundDetails = [
    "30 Minutes • 25 Questions • Quantitative Basics",
    "25 Minutes • 20 Questions • Logical Reasoning",
    "20 Minutes • 15 Questions • Role Knowledge",
    "40 Minutes • 2 Questions • Coding",
    "15 Minutes • Scenario Based • Communication",
  ];
  const journeySteps = [
    "Application Submitted",
    "HR Screening",
    "Interview Invitation",
    ...INTERVIEW_ROUNDS.map((round) => `Round: ${round}`),
    "Final Decision",
  ];

  const handleSelectJob = (job: ResumeCandidate) => {
    if (selectedJobId !== job.id) {
      setPendingLaunchRoundIndex(null);
      setProcessingRoundIndex(null);
      setSelectedAnswersByRound({});
      setReportCard(null);
      setIsCompleted(false);
      setCompletedRoundsCount(job.status === "interview_completed" ? INTERVIEW_ROUNDS.length : 0);
    }
    setSelectedJobId(job.id);
  };

  const resetPreflightChecks = () => {
    setPreflightChecks({ camera: false, microphone: false, environment: false });
    setPreflightStatus({
      camera: "idle",
      microphone: "idle",
      environment: "idle",
    });
    setPreflightMessages({
      camera: "",
      microphone: "",
      environment: "",
    });
  };

  const enterInterview = () => {
    if (!selectedInterviewJob) {
      return;
    }
    setSelectedJobId(selectedInterviewJob.id);
    setCompletedRoundsCount(0);
    setProcessingRoundIndex(null);
    setPendingLaunchRoundIndex(0);
    resetPreflightChecks();
    setIsPreflightOpen(true);
  };

  const onSelectedPopupOpenChange = (open: boolean) => {
    if (open || !selectedInterviewJob) {
      return;
    }
    setSelectedJobId(selectedInterviewJob.id);
  };

  const startRoundAssessment = (roundIndex: number) => {
    if (!selectedJob || selectedJob.status !== "selected") {
      toast.info("This application is currently under review. Interview unlocks after HR selection.");
      return;
    }

    const isRoundActive = roundIndex === completedRoundsCount && processingRoundIndex === null;
    if (!isRoundActive) {
      toast.info("This round is not active yet.");
      return;
    }

    setPendingLaunchRoundIndex(roundIndex);
    resetPreflightChecks();
    setIsPreflightOpen(true);
  };

  const launchInterviewAfterChecks = () => {
    if (!selectedJob) {
      return;
    }
    if (isAnyPreflightChecking) {
      toast.info("A checklist check is still running. Please wait.");
      return;
    }

    if (!allPreflightChecksDone) {
      toast.error("Please complete all checks before continuing.");
      return;
    }

    const targetRound = pendingLaunchRoundIndex ?? completedRoundsCount;

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsPreflightOpen(false);
      setCurrentRound(targetRound);
      setIsExamWarningOpen(true);
    }, 1000);
  };

  const requestExamFullscreen = async () => {
    if (document.fullscreenElement) {
      return true;
    }

    try {
      await document.documentElement.requestFullscreen();
      setHasEnteredFullscreen(true);
      return true;
    } catch {
      toast.error("Fullscreen permission is required to start the exam.");
      return false;
    }
  };

  const startExamPortal = async () => {
    const fullscreenEnabled = await requestExamFullscreen();
    if (!fullscreenEnabled) {
      return;
    }

    const targetRound = pendingLaunchRoundIndex ?? completedRoundsCount;
    autoSubmittedRef.current = false;
    setIsExamWarningOpen(false);
    setIsInInterview(true);
    setCurrentRound(targetRound);
    setSelectedAnswersByRound((prev) => ({
      ...prev,
      [targetRound]: prev[targetRound] ?? [],
    }));
    setReportCard(null);
    setIsCompleted(false);
    toast.success("Exam started in fullscreen mode.");
  };

  const setPreflightCheckResult = (
    key: PreflightCheckKey,
    passed: boolean,
    message: string,
    state: PreflightCheckState,
  ) => {
    setPreflightChecks((prev) => ({
      ...prev,
      [key]: passed,
    }));
    setPreflightStatus((prev) => ({
      ...prev,
      [key]: state,
    }));
    setPreflightMessages((prev) => ({
      ...prev,
      [key]: message,
    }));
  };

  const runPreflightCheck = async (key: PreflightCheckKey) => {
    setPreflightStatus((prev) => ({
      ...prev,
      [key]: "checking",
    }));
    setPreflightMessages((prev) => ({
      ...prev,
      [key]: "Checking...",
    }));

    if (key === "environment") {
      const confirmed = window.confirm("Confirm that you are in a quiet environment with no distractions.");
      if (confirmed) {
        setPreflightCheckResult("environment", true, "Environment confirmed.", "passed");
      } else {
        setPreflightCheckResult("environment", false, "Please confirm a quiet environment to proceed.", "failed");
      }
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPreflightCheckResult(key, false, "Media device access is not supported in this browser.", "failed");
      return;
    }

    const constraints = key === "camera" ? { video: true, audio: false } : { video: false, audio: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const tracks = key === "camera" ? stream.getVideoTracks() : stream.getAudioTracks();
      const isTrackAvailable = tracks.length > 0 && tracks.some((track) => track.readyState === "live");

      stream.getTracks().forEach((track) => track.stop());

      if (!isTrackAvailable) {
        setPreflightCheckResult(
          key,
          false,
          key === "camera" ? "No active camera stream detected." : "No active microphone stream detected.",
          "failed",
        );
        return;
      }

      setPreflightCheckResult(
        key,
        true,
        key === "camera" ? "Camera check passed." : "Microphone check passed.",
        "passed",
      );
    } catch (error) {
      const errorName = error instanceof DOMException ? error.name : "UnknownError";
      let failureMessage = "Permission denied or device unavailable.";

      if (errorName === "NotFoundError") {
        failureMessage = key === "camera" ? "No camera device found." : "No microphone device found.";
      } else if (errorName === "NotReadableError") {
        failureMessage = key === "camera"
          ? "Camera is currently in use by another application."
          : "Microphone is currently in use by another application.";
      }

      setPreflightCheckResult(key, false, failureMessage, "failed");
    }
  };

  const getSelectionHint = () => {
    if (!selectedJob) {
      return "Choose a job from the left panel to continue.";
    }
    if (selectedJob.status === "selected") {
      return `Ready for interview: ${INTERVIEW_ROUNDS.length} rounds unlocked.`;
    }
    if (selectedJob.status === "interview_completed") {
      return "Interview completed. You can view your report card from the completion panel.";
    }
    return "Application under review. HR will unlock interview access once shortlisted.";
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

  const completeInterview = (forcedReason?: "fullscreen-exit" | "tab-switch") => {
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
    if (forcedReason === "fullscreen-exit") {
      toast.error(`Exam auto-submitted: fullscreen was exited. Final score: ${percentage}%`);
    } else if (forcedReason === "tab-switch") {
      toast.error(`Exam auto-submitted: tab switching was detected. Final score: ${percentage}%`);
    } else {
      toast.success(`Interview completed. Final score: ${percentage}%`);
    }
  };

  useEffect(() => {
    completeInterviewRef.current = completeInterview;
  });

  const autoSubmitCurrentRound = (reason: "fullscreen-exit" | "tab-switch") => {
    if (currentRound < INTERVIEW_ROUNDS.length - 1) {
      setIsInInterview(false);
      setProcessingRoundIndex(currentRound);
      toast.error(
        reason === "fullscreen-exit"
          ? "Current round auto-submitted: fullscreen was exited."
          : "Current round auto-submitted: tab switching was detected.",
      );
      setTimeout(() => {
        setProcessingRoundIndex(null);
        setCompletedRoundsCount((prev) => Math.max(prev, currentRound + 1));
        toast.info(`${INTERVIEW_ROUNDS[currentRound]} auto-submitted. ${INTERVIEW_ROUNDS[currentRound + 1]} unlocked.`);
      }, 900);
      return;
    }

    setIsInInterview(false);
    setProcessingRoundIndex(currentRound);
    toast.error(
      reason === "fullscreen-exit"
        ? "Final round auto-submitted: fullscreen was exited."
        : "Final round auto-submitted: tab switching was detected.",
    );
    setTimeout(() => {
      setProcessingRoundIndex(null);
      setCompletedRoundsCount(INTERVIEW_ROUNDS.length);
      completeInterview();
    }, 1100);
  };

  useEffect(() => {
    autoSubmitRoundRef.current = autoSubmitCurrentRound;
  });

  const submitCurrentRound = () => {
    const selectedAnswers = selectedAnswersByRound[currentRound] ?? [];
    const unansweredExists = currentRoundQuestions.some((_, questionIndex) => selectedAnswers[questionIndex] === undefined);

    if (unansweredExists) {
      toast.error("Please answer all questions in this round before continuing.");
      return;
    }

    if (currentRound < INTERVIEW_ROUNDS.length - 1) {
      setIsInInterview(false);
      setProcessingRoundIndex(currentRound);
      toast.info("Round submitted. AI is evaluating your responses...");
      setTimeout(() => {
        setProcessingRoundIndex(null);
        setCompletedRoundsCount((prev) => Math.max(prev, currentRound + 1));
        toast.success(`${INTERVIEW_ROUNDS[currentRound]} completed. ${INTERVIEW_ROUNDS[currentRound + 1]} unlocked.`);
      }, 1200);
      return;
    }

    setIsInInterview(false);
    setProcessingRoundIndex(currentRound);
    toast.info("Final round submitted. AI is evaluating final performance...");
    setTimeout(() => {
      setProcessingRoundIndex(null);
      setCompletedRoundsCount(INTERVIEW_ROUNDS.length);
      completeInterview();
    }, 1400);
  };

  useEffect(() => {
    if (!isInInterview) {
      return;
    }

    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        setHasEnteredFullscreen(true);
        return;
      }

      if (hasEnteredFullscreen && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        autoSubmitRoundRef.current("fullscreen-exit");
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        }
        autoSubmitRoundRef.current("tab-switch");
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [isInInterview, hasEnteredFullscreen]);

  const backToDashboard = () => {
    setIsInInterview(false);
    setHasEnteredFullscreen(false);
    autoSubmittedRef.current = false;
    setIsCompleted(false);
    setCurrentRound(0);
    setSelectedAnswersByRound({});
    setReportCard(null);
    setSelectedJobId(null);
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    }
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
      className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 sm:px-6 lg:px-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_92%_8%,rgba(59,130,246,0.10),transparent_30%)]" />
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
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="relative overflow-hidden p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Applied Jobs</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">{appliedJobs.length}</p>
            <Briefcase className="pointer-events-none absolute -right-2 -top-2 size-16 text-slate-200" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="relative overflow-hidden p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Selected</p>
            <p className="mt-2 text-4xl font-semibold text-emerald-700">{selectedCount}</p>
            <Sparkles className="pointer-events-none absolute -right-2 -top-2 size-16 text-emerald-100" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="relative overflow-hidden p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Completed</p>
            <p className="mt-2 text-4xl font-semibold text-sky-700">{completedCount}</p>
            <CheckCircle2 className="pointer-events-none absolute -right-2 -top-2 size-16 text-sky-100" />
          </CardContent>
        </Card>
      </div>

      {!isCompleted ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="order-2 border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Briefcase className="size-5 text-emerald-600" /> Applied Jobs
              </CardTitle>
              <CardDescription>Select the job for which you booked an interview slot.</CardDescription>
            </CardHeader>
            <CardContent className="candidate-scroll max-h-[560px] space-y-3 overflow-auto pr-1">
              {appliedJobs.map((job) => (
                <motion.button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  whileTap={{ scale: 0.995 }}
                  className={`w-full rounded-2xl border-l-4 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    selectedJobId === job.id
                      ? "border-emerald-500 border-y-emerald-200 border-r-emerald-200 bg-emerald-50 shadow-[0_14px_34px_-22px_rgba(16,185,129,0.6)]"
                      : "border-l-slate-900 border-y-slate-200 border-r-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{job.jobRole}</p>
                      <p className="text-xs text-slate-600">Application ID: {job.id.toUpperCase()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {job.status === "selected" ? (
                        <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">Interview Selected</Badge>
                      ) : job.status === "interview_completed" ? (
                        <Badge className="border border-sky-200 bg-sky-50 text-sky-700">Completed</Badge>
                      ) : (
                        <Badge className="border border-slate-200 bg-slate-100 text-slate-700">Under Review</Badge>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>

          <Card className="order-1 border-slate-200 bg-white shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900 sm:text-2xl">
                <Code2 className="size-5 text-sky-600" /> Interview Center
              </CardTitle>
              <CardDescription className="text-base">Proceed through all rounds when selected.</CardDescription>
            </CardHeader>
            <CardContent>
              {!isInInterview ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1 text-sm uppercase tracking-wide text-slate-500">Current Selection</p>
                    <p className="text-base text-slate-700">
                    {selectedJob ? `Selected job: ${selectedJob.jobRole}` : "No active application selected"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{getSelectionHint()}</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedJob ? (
                      <motion.div
                        key={selectedJob.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Job Dashboard</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                              <p className="text-slate-500">Role</p>
                              <p className="font-medium text-slate-800">{selectedJob.jobRole}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                              <p className="text-slate-500">Application</p>
                              <p className="font-medium text-slate-800">{selectedJob.id.toUpperCase()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Interview Journey</p>
                          <div className="space-y-2">
                            {journeySteps.map((step, index) => {
                              let state: "completed" | "active" | "locked" | "processing" = "locked";

                              if (selectedJob.status === "pending") {
                                if (index === 0) {
                                  state = "completed";
                                } else if (index === 1) {
                                  state = "active";
                                }
                              }

                              if (selectedJob.status === "selected" || selectedJob.status === "interview_completed") {
                                if (index <= 2) {
                                  state = "completed";
                                }
                              }

                              const roundIndex = index - 3;
                              const isRoundStep = roundIndex >= 0 && roundIndex < INTERVIEW_ROUNDS.length;

                              if (isRoundStep) {
                                if (selectedJob.status === "interview_completed") {
                                  state = "completed";
                                } else if (processingRoundIndex === roundIndex) {
                                  state = "processing";
                                } else if (roundIndex < completedRoundsCount) {
                                  state = "completed";
                                } else if (roundIndex === completedRoundsCount && selectedJob.status === "selected") {
                                  state = "active";
                                } else {
                                  state = "locked";
                                }
                              }

                              if (step === "Final Decision") {
                                state = selectedJob.status === "interview_completed" ? "completed" : "locked";
                              }

                              const isComplete = state === "completed";
                              const isCurrent = state === "active";
                              const isProcessing = state === "processing";

                              return (
                                <div key={step} className="rounded-lg border border-transparent px-1 py-1">
                                  <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                                      isComplete
                                        ? "bg-emerald-100 text-emerald-700"
                                        : isProcessing
                                          ? "bg-amber-100 text-amber-700"
                                        : isCurrent
                                          ? "bg-slate-900 text-white"
                                          : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {isProcessing ? <Loader2 className="size-3 animate-spin" /> : index + 1}
                                  </span>
                                  <p className={`text-sm ${isCurrent ? "font-semibold text-slate-800" : "text-slate-600"}`}>{step}</p>
                                  {isRoundStep && state === "locked" ? <span className="text-xs text-slate-400">Locked</span> : null}
                                  {isProcessing ? <span className="text-xs text-amber-700">Evaluating</span> : null}
                                  </div>

                                  {isRoundStep && isCurrent ? (
                                    <div className="ml-7 mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                                      <p className="text-sm text-slate-600">{roundDetails[roundIndex]}</p>
                                      <Button
                                        className="mt-2 h-9 bg-slate-900 px-4 text-sm text-white hover:bg-slate-800"
                                        onClick={() => startRoundAssessment(roundIndex)}
                                      >
                                        Start Assessment
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        <CompletionPage reportCard={reportCard} onDownloadReportCard={downloadReportCard} onBackToDashboard={backToDashboard} />
      )}

      <Dialog open={showSelectedPopup} onOpenChange={onSelectedPopupOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] border-slate-200 bg-white text-slate-900 sm:w-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Sparkles className="size-5 text-emerald-600" /> You Are Selected for Interview
            </DialogTitle>
            <DialogDescription>
              HR has shortlisted your profile. Click below to take an interview.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={enterInterview}>
              Take an Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExamWarningOpen} onOpenChange={setIsExamWarningOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] border-red-200 bg-white text-slate-900 sm:w-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <AlertTriangle className="size-5 text-red-600" /> Exam Security Warning
            </DialogTitle>
            <DialogDescription>
              The exam will open in fullscreen mode. If you exit fullscreen or switch tabs, only your current round will be submitted automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Right-click is disabled and exam activity is monitored throughout the assessment.
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => setIsExamWarningOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={startExamPortal}>
              I Understand, Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreflightOpen} onOpenChange={(open) => !isConnecting && setIsPreflightOpen(open)}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] border-slate-200 bg-white text-slate-900 sm:w-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Video className="size-5 text-slate-700" /> Pre-Interview Checklist
            </DialogTitle>
            <DialogDescription>
              Complete these checks before starting your AI interview round.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => void runPreflightCheck("camera")}
              disabled={isConnecting || preflightStatus.camera === "checking"}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                preflightStatus.camera === "passed"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : preflightStatus.camera === "failed"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><Video className="size-4" /> Camera Check</span>
                {preflightStatus.camera === "checking" ? <Loader2 className="size-4 animate-spin text-slate-500" /> : null}
                {preflightStatus.camera === "passed" ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
                {preflightStatus.camera === "failed" ? <AlertTriangle className="size-4 text-red-600" /> : null}
              </span>
              {preflightMessages.camera ? (
                <span className="mt-1 block text-xs opacity-90">{preflightMessages.camera}</span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => void runPreflightCheck("microphone")}
              disabled={isConnecting || preflightStatus.microphone === "checking"}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                preflightStatus.microphone === "passed"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : preflightStatus.microphone === "failed"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><Mic className="size-4" /> Microphone Check</span>
                {preflightStatus.microphone === "checking" ? <Loader2 className="size-4 animate-spin text-slate-500" /> : null}
                {preflightStatus.microphone === "passed" ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
                {preflightStatus.microphone === "failed" ? <AlertTriangle className="size-4 text-red-600" /> : null}
              </span>
              {preflightMessages.microphone ? (
                <span className="mt-1 block text-xs opacity-90">{preflightMessages.microphone}</span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => void runPreflightCheck("environment")}
              disabled={isConnecting || preflightStatus.environment === "checking"}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                preflightStatus.environment === "passed"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : preflightStatus.environment === "failed"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><Target className="size-4" /> Quiet Environment</span>
                {preflightStatus.environment === "checking" ? <Loader2 className="size-4 animate-spin text-slate-500" /> : null}
                {preflightStatus.environment === "passed" ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
                {preflightStatus.environment === "failed" ? <AlertTriangle className="size-4 text-red-600" /> : null}
              </span>
              {preflightMessages.environment ? (
                <span className="mt-1 block text-xs opacity-90">{preflightMessages.environment}</span>
              ) : null}
            </button>
          </div>

          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            You cannot pause once started.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => setIsPreflightOpen(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={launchInterviewAfterChecks}
              disabled={isConnecting || isAnyPreflightChecking}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Connecting to AI...
                </>
              ) : (
                "I am ready"
              )}
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
  const roundTimeLimitSeconds = [1800, 1500, 1200, 2400, 900][currentRound] ?? 0;
  const [timeRemaining, setTimeRemaining] = useState(roundTimeLimitSeconds);
  const progress = ((currentRound + 1) / INTERVIEW_ROUNDS.length) * 100;
  const answeredCount = selectedAnswers.filter((ans) => ans !== undefined).length;

  useEffect(() => {
    setTimeRemaining(roundTimeLimitSeconds);
  }, [roundTimeLimitSeconds]);

  useEffect(() => {
    if (timeRemaining <= 0 || roundTimeLimitSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, roundTimeLimitSeconds]);

  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, "0");
  const seconds = String(timeRemaining % 60).padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="sticky top-3 z-20 mb-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Assessment Portal</p>
            <div className="mt-3 space-y-1">
              <p className="text-2xl font-bold text-slate-900">{candidateName}</p>
              <p className="text-sm font-medium text-slate-600">{jobRole}</p>
              <p className="text-sm font-semibold text-slate-800">{INTERVIEW_ROUNDS[currentRound]}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Round {currentRound + 1} of {INTERVIEW_ROUNDS.length}
            </Badge>
            <Badge className="border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              <Clock3 className="mr-1 size-3" /> {roundTimeLimitSeconds > 0 ? `${minutes}:${seconds} Remaining` : "No Time Limit"}
            </Badge>
            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
              <p className="text-slate-600"><span className="font-semibold text-slate-900">{answeredCount}/{questions.length}</span> Answered</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Round Progress</p>
            <p className="text-xs font-medium text-emerald-700">{Math.round(progress)}%</p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <InterviewRounds
        key={`round-${currentRound}`}
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);
  const unansweredCount = questions.length - selectedAnswers.filter((answer) => answer !== undefined).length;
  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const moveToNextQuestion = () => {
    if (!isCurrentAnswered) {
      toast.error("Please answer this question before moving to the next one.");
      return;
    }

    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const moveToPreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p className="text-xs text-slate-600">
            {unansweredCount === 0 ? "All questions answered" : `${unansweredCount} unanswered`}
          </p>
        </div>
      </div>

      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold leading-relaxed text-slate-900">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">Q{currentQuestionIndex + 1}</span>
              {currentQuestion.question}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2.5">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === optionIndex;

            return (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectAnswer(currentQuestionIndex, optionIndex)}
                className={`relative cursor-pointer rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    isSelected ? "bg-emerald-600 text-white" : "border border-current"
                  }`}>
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-3 z-10 mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            onClick={moveToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          >
            Previous Question
          </Button>

          {!isLastQuestion ? (
            <Button
              onClick={moveToNextQuestion}
              disabled={!isCurrentAnswered}
              className={`sm:ml-auto ${
                isCurrentAnswered
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              Next Question
            </Button>
          ) : (
            <Button
              disabled={!allAnswered || !isCurrentAnswered}
              onClick={onSubmitRound}
              className={`sm:ml-auto ${
                allAnswered && isCurrentAnswered
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              {currentRound === INTERVIEW_ROUNDS.length - 1 ? "Finish Interview" : "Submit Round and Continue"}
            </Button>
          )}
        </div>
        {!isCurrentAnswered ? <p className="mt-2 text-xs text-slate-500">Answer the current question to continue.</p> : null}
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
      <Card className="border-slate-200 bg-white text-center shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-7" />
          </div>
          <CardTitle>Interview Completed Successfully</CardTitle>
          <CardDescription>
            Your assessment is complete. You can download the report card with round-wise scores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportCard ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <p className="text-xs uppercase tracking-wide text-slate-500">Final Score</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                {reportCard.totalCorrect}/{reportCard.totalQuestions} ({reportCard.percentage}%)
              </p>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                {reportCard.roundScores.map((round) => (
                  <p key={round.roundName}>
                    {round.roundName}: {round.correct}/{round.total}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800" onClick={onDownloadReportCard}>
              <FileDown className="mr-2 size-4" /> Download Report Card
            </Button>
            <Button className="flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" onClick={onBackToDashboard}>
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
    <header className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:px-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recruitment Automation</p>
        <h1 className="text-xl font-semibold text-slate-900">{roleLabel}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border border-slate-200 bg-slate-50 text-slate-600">
          <Target className="mr-1 size-3" /> Frontend Only
        </Badge>
        <Badge className="border border-slate-200 bg-slate-50 text-slate-600">
          <Clock3 className="mr-1 size-3" /> Live Session
        </Badge>
        <Button variant="ghost" className="text-slate-700 hover:bg-slate-100" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default App;
