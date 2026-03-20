import { useEffect, useRef, useState } from "react";
import { Camera, Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicJob, submitJobApplication } from "@/lib/api";
import type { PublicJobPosting } from "@/types/recruitment";

type JobApplicationFormProps = {
  applySlug: string;
};

type WizardStep = 1 | 2 | 3;

type Gender = "male" | "female" | "other" | "";

type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
};

type EducationDraft = {
  degree: string;
  institution: string;
  graduationYear: string;
};

const STEP_LABELS: Array<{ id: WizardStep; title: string }> = [
  { id: 1, title: "Basic Details" },
  { id: 2, title: "Contact Details" },
  { id: 3, title: "Verification" },
];

const GENDER_OPTIONS: Array<{ value: Exclude<Gender, "">; label: string }> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const fieldLabelClass = "text-sm font-semibold text-slate-700";
const inputFocusClass =
  "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500";

export default function JobApplicationForm({ applySlug }: JobApplicationFormProps) {
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const defaultTitleRef = useRef(document.title);

  const [job, setJob] = useState<PublicJobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCandidateName, setSubmittedCandidateName] = useState("");
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [totalExperience, setTotalExperience] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [educationList, setEducationList] = useState<EducationEntry[]>([]);
  const [educationDraft, setEducationDraft] = useState<EducationDraft>({
    degree: "",
    institution: "",
    graduationYear: "",
  });
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [professionalSummary, setProfessionalSummary] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [isResumeDragActive, setIsResumeDragActive] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<string>("");

  const isEditingEducation = Boolean(editingEducationId);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getPublicJob(applySlug);
        if (!cancelled) {
          setJob(data);
        }
      } catch {
        if (!cancelled) {
          toast.error("Invalid or expired application link.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [applySlug]);

  useEffect(() => {
    if (job?.title) {
      document.title = `${job.title} | Hiring Agent`;
      return;
    }

    document.title = "Hiring Agent";
  }, [job?.title]);

  useEffect(() => {
    const defaultTitle = defaultTitleRef.current;

    return () => {
      document.title = defaultTitle;
    };
  }, []);

  useEffect(() => {
    if (!profilePhoto) {
      setProfilePhotoPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(profilePhoto);
    setProfilePhotoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [profilePhoto]);

  const getEducationAsString = () => {
    return educationList
      .map((entry) => `${entry.degree} - ${entry.institution} (${entry.graduationYear})`)
      .join(", ");
  };

  const resetEducationDraft = () => {
    setEducationDraft({
      degree: "",
      institution: "",
      graduationYear: "",
    });
    setEditingEducationId(null);
  };

  const saveEducationEntry = () => {
    if (!educationDraft.degree.trim() || !educationDraft.institution.trim() || !educationDraft.graduationYear.trim()) {
      toast.error("Please complete degree, institution, and graduation year.");
      return;
    }

    if (editingEducationId) {
      setEducationList((prev) =>
        prev.map((item) =>
          item.id === editingEducationId
            ? {
                ...item,
                degree: educationDraft.degree.trim(),
                institution: educationDraft.institution.trim(),
                graduationYear: educationDraft.graduationYear.trim(),
              }
            : item,
        ),
      );
      toast.success("Education entry updated.");
      resetEducationDraft();
      return;
    }

    const newEntry: EducationEntry = {
      id: `edu-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      degree: educationDraft.degree.trim(),
      institution: educationDraft.institution.trim(),
      graduationYear: educationDraft.graduationYear.trim(),
    };

    setEducationList((prev) => [...prev, newEntry]);
    toast.success("Education entry added.");
    resetEducationDraft();
  };

  const editEducationEntry = (entry: EducationEntry) => {
    setEditingEducationId(entry.id);
    setEducationDraft({
      degree: entry.degree,
      institution: entry.institution,
      graduationYear: entry.graduationYear,
    });
  };

  const deleteEducationEntry = (entryId: string) => {
    setEducationList((prev) => prev.filter((item) => item.id !== entryId));
    if (editingEducationId === entryId) {
      resetEducationDraft();
    }
    toast.info("Education entry removed.");
  };

  const handleResumeSelect = (file: File | null) => {
    if (!file) {
      setResume(null);
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please upload resume in PDF format.");
      return;
    }

    setResume(file);
  };

  const validateCurrentStep = (step: WizardStep) => {
    if (step === 1) {
      if (!fullName.trim()) {
        toast.error("Full name is required.");
        return false;
      }
      if (!gender) {
        toast.error("Please select gender.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!email.trim()) {
        toast.error("Email is required.");
        return false;
      }
      return true;
    }

    if (!resume) {
      toast.error("Please upload resume for verification.");
      return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (!validateCurrentStep(currentStep)) {
      return;
    }

    setCurrentStep((prev) => {
      if (prev >= 3) {
        return 3;
      }
      return (prev + 1) as WizardStep;
    });
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => {
      if (prev <= 1) {
        return 1;
      }
      return (prev - 1) as WizardStep;
    });
  };

  const clearFormAfterSubmit = () => {
    setCurrentStep(1);
    setFullName("");
    setDob("");
    setGender("");
    setEmail("");
    setPhone("");
    setLocation("");
    setTotalExperience("");
    setCurrentCompany("");
    setLinkedinUrl("");
    setPortfolioUrl("");
    setEducationList([]);
    resetEducationDraft();
    setProfessionalSummary("");
    setResume(null);
    setProfilePhoto(null);
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = "";
    }
  };

  const onSubmit = async () => {
    if (!job) {
      return;
    }

    if (!validateCurrentStep(3)) {
      return;
    }

    const metadataSummaryParts = [
      professionalSummary.trim(),
      dob ? `DOB: ${dob}` : "",
      gender ? `Gender: ${gender}` : "",
    ].filter(Boolean);

    const combinedSummary = metadataSummaryParts.join("\n");

    setSubmitting(true);
    try {
      await submitJobApplication(job.applySlug, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: location.trim(),
        totalExperience: totalExperience.trim(),
        currentCompany: currentCompany.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        education: getEducationAsString(),
        professionalSummary: combinedSummary,
        resume: resume as File,
        profilePhoto,
      });
      setSubmittedCandidateName(fullName.trim());
      setIsSubmitted(true);
      toast.success("Application submitted successfully.");
      clearFormAfterSubmit();
    } catch {
      toast.error("Unable to submit application right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="size-6 animate-spin text-slate-700" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Card className="w-full max-w-xl border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Link Not Valid</CardTitle>
            <CardDescription>This apply link is invalid or no longer active.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatRoleTitle = (role: string) => {
    const trimmed = role.trim();
    if (!trimmed) {
      return role;
    }

    if (trimmed.length <= 4) {
      return trimmed.toUpperCase();
    }

    return trimmed
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const roleDisplayName = formatRoleTitle(job.title);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0%,#f8fafc_38%,#f1f5f9_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-5 py-3">
              <p className="text-sm font-semibold tracking-wide text-white">Job Application Portal</p>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">You applied for</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">{roleDisplayName}</h1>
              </div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                Role: {roleDisplayName}
              </div>
            </div>
          </div>

          <Card className="border-slate-200 bg-white shadow-[0_20px_65px_-42px_rgba(15,23,42,0.42)]">
            <CardContent className="px-6 py-10 text-center sm:px-10">
              <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Thank You For Applying</h2>
              <p className="mt-2 text-slate-600">
                {submittedCandidateName ? `${submittedCandidateName}, your application has been submitted successfully.` : "Your application has been submitted successfully."}
              </p>
              <p className="mt-1 text-sm text-slate-500">Our HR team will review your profile and contact you if shortlisted.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStepLabel = STEP_LABELS.find((step) => step.id === currentStep)?.title ?? "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0%,#f8fafc_38%,#f1f5f9_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-900 px-5 py-3">
            <p className="text-sm font-semibold tracking-wide text-white">Job Application Portal</p>
          </div>
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">You are applying for</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{roleDisplayName}</h1>
            </div>
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
              Role: {roleDisplayName}
            </div>
          </div>
        </div>

        <Card className="border-slate-200 bg-white shadow-[0_20px_65px_-42px_rgba(15,23,42,0.42)]">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-slate-900">{currentStepLabel}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Step {currentStep} of {STEP_LABELS.length}. Complete the guided details and continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-3 sm:px-6">
            <div className="flex justify-center gap-4 sm:gap-6">
                {STEP_LABELS.map((step, index) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const isLast = index === STEP_LABELS.length - 1;

                  return (
                    <div key={step.id} className="flex shrink-0 items-center gap-2 sm:gap-2">
                      <div className="flex flex-col items-center whitespace-nowrap">
                        <span
                          className={`inline-flex size-5 sm:size-6 items-center justify-center rounded-full border text-[9px] sm:text-[11px] font-semibold transition ${
                            isActive
                              ? "border-blue-600 bg-blue-600 text-white"
                              : isCompleted
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {step.id}
                        </span>
                        <span className="mt-1 sm:mt-2 text-center text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">{step.title}</span>
                      </div>

                      {!isLast ? (
                        <span
                          className={`block h-[2px] w-4 sm:w-8 rounded-full transition flex-shrink-0 ${
                            isCompleted ? "bg-slate-900" : "bg-slate-300"
                          }`}
                        />
                      ) : null}
                    </div>
                  );
                })}
            </div>
            {currentStep === 1 ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-10 lg:items-start">
                  <div className="space-y-2 lg:col-span-3">
                    <Label className={fieldLabelClass}>Add Photo</Label>
                    <input
                      ref={profilePhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => profilePhotoInputRef.current?.click()}
                      className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-blue-300 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                    >
                      {profilePhotoPreviewUrl ? (
                        <img
                          src={profilePhotoPreviewUrl}
                          alt="Selected profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="size-7" />
                      )}
                    </button>
                    <p className="truncate text-xs text-slate-500">{profilePhoto?.name || "JPG/PNG"}</p>
                  </div>

                  <div className="space-y-2 lg:col-span-7">
                    <Label className={fieldLabelClass}>Full Name *</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className={inputFocusClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={fieldLabelClass}>Current Company / Student</Label>
                    <Input
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      placeholder="Enter company name or Student"
                      className={inputFocusClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={fieldLabelClass}>Years of Experience</Label>
                    <Input
                      value={totalExperience}
                      onChange={(e) => setTotalExperience(e.target.value)}
                      placeholder="Enter years of experience (0 if fresher)"
                      className={inputFocusClass}
                    />
                    <p className="text-xs text-slate-500">Use 0 if you are a fresher.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={fieldLabelClass}>Date of Birth</Label>
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={`${inputFocusClass} calendar-icon-black`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={fieldLabelClass}>Gender *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {GENDER_OPTIONS.map((option) => {
                        const isSelected = gender === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setGender(option.value)}
                            className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition ${
                              isSelected
                                ? "border-blue-400 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                            }`}
                          >
                            <span
                              className={`inline-flex size-3 sm:size-4 items-center justify-center rounded-full border ${
                                isSelected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 text-transparent"
                              }`}
                            >
                              <Check className="size-2 sm:size-3" />
                            </span>
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-slate-700">Education</Label>
                    {isEditingEducation ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 border-slate-300 text-slate-700"
                        onClick={resetEducationDraft}
                      >
                        Cancel Edit
                      </Button>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label className={fieldLabelClass}>Degree</Label>
                        <Input
                          value={educationDraft.degree}
                          onChange={(e) => setEducationDraft((prev) => ({ ...prev, degree: e.target.value }))}
                          placeholder="Enter degree"
                          className={inputFocusClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className={fieldLabelClass}>Institution</Label>
                        <Input
                          value={educationDraft.institution}
                          onChange={(e) => setEducationDraft((prev) => ({ ...prev, institution: e.target.value }))}
                          placeholder="Enter institution"
                          className={inputFocusClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className={fieldLabelClass}>Graduation Year</Label>
                        <Input
                          value={educationDraft.graduationYear}
                          onChange={(e) => setEducationDraft((prev) => ({ ...prev, graduationYear: e.target.value }))}
                          placeholder="Enter year"
                          className={inputFocusClass}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                      onClick={saveEducationEntry}
                    >
                      <Plus className="mr-1 size-4" /> {isEditingEducation ? "Update Education" : "Add Education"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {educationList.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-sm text-slate-500">
                        No education entries added yet.
                      </p>
                    ) : null}

                    {educationList.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{entry.degree}</p>
                          <p className="truncate text-xs text-slate-600">
                            {entry.institution} - {entry.graduationYear}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => editEducationEntry(entry)}
                            className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEducationEntry(entry.id)}
                            className="rounded p-1 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label className={fieldLabelClass}>Email *</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={inputFocusClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className={inputFocusClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city and country"
                    className={inputFocusClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>LinkedIn URL</Label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="Enter LinkedIn profile URL"
                    className={inputFocusClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Portfolio URL</Label>
                  <Input
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="Enter portfolio URL"
                    className={inputFocusClass}
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={fieldLabelClass}>Resume *</Label>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => handleResumeSelect(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsResumeDragActive(true);
                      }}
                      onDragLeave={() => setIsResumeDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsResumeDragActive(false);
                        handleResumeSelect(e.dataTransfer.files?.[0] ?? null);
                      }}
                      className={`w-full rounded-xl border-2 border-dashed px-4 py-6 text-left transition ${
                        isResumeDragActive
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <Upload className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Click to upload or drag and drop</p>
                          <p className="text-xs text-slate-500">Your Resume (PDF)</p>
                        </div>
                      </div>
                    </button>
                    <p className="text-xs text-slate-500">{resume ? `Selected: ${resume.name}` : "No file selected"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Professional Summary</Label>
                  <Textarea
                    value={professionalSummary}
                    onChange={(e) => setProfessionalSummary(e.target.value)}
                    placeholder="Enter a concise professional summary"
                    rows={4}
                    className={`${inputFocusClass} !bg-white`}
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Review Snapshot</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <p><span className="text-sm text-slate-500">Name:</span> <span className="font-semibold text-slate-900">{fullName || "-"}</span></p>
                    <p><span className="text-sm text-slate-500">Email:</span> <span className="font-semibold text-slate-900">{email || "-"}</span></p>
                    <p><span className="text-sm text-slate-500">Gender:</span> <span className="font-semibold text-slate-900">{gender || "-"}</span></p>
                    <p><span className="text-sm text-slate-500">Education Entries:</span> <span className="font-semibold text-slate-900">{educationList.length}</span></p>
                    <p><span className="text-sm text-slate-500">Resume:</span> <span className="font-semibold text-slate-900">{resume?.name || "Not uploaded"}</span></p>
                    <p><span className="text-sm text-slate-500">Photo:</span> <span className="font-semibold text-slate-900">{profilePhoto?.name || "Not uploaded"}</span></p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1 || submitting}
                className="w-full sm:w-auto border-slate-300 text-slate-700 text-sm sm:text-base"
              >
                <ChevronLeft className="mr-1 size-4" /> Previous
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={goToNextStep} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base">
                  Next <ChevronRight className="ml-1 size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" /> Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
