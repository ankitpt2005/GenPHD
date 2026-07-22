"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  ExternalLink,
  FileCheck2,
  FolderKanban,
  History,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Lock,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { seedDecisionBrief } from "../lib/decision/brief";
import { decisionBriefSchema, type DecisionBrief } from "../lib/decision/types";
import { getBrowserPublicRuntimeConfig } from "../lib/runtime/public-config.client";
import { SignOutButton } from "./auth/sign-out-button";
import { BrandLogo } from "./brand-logo";
import { z } from "zod";
import {
  activeProjectSchema,
  decisionStateSchema,
  roadmapMilestoneSchema,
  skillGapVectorSchema,
  type ActiveProject,
  type CompetencyScore,
  type RoadmapMilestone,
} from "../lib/workspace/contracts";
import { consensusReportSchema, type ConsensusReport } from "../lib/consensus/types";
import { challengeGradeSchema, publicChallengeSchema, type ChallengeGrade, type PublicChallenge } from "../lib/challenges/types";
import { COMPETENCIES, normalizeCompetencyId } from "../lib/competencies";

export type WorkspacePage =
  | "dashboard"
  | "roadmap"
  | "consensus"
  | "projects"
  | "challenges"
  | "timeline"
  | "memory"
  | "settings";

type NavItem = {
  id: WorkspacePage;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "roadmap", label: "My roadmap", icon: Target },
  { id: "consensus", label: "Decisions", icon: BrainCircuit },
  { id: "projects", label: "My project", icon: FolderKanban },
  { id: "challenges", label: "Coding challenges", icon: ListChecks },
  { id: "timeline", label: "Progress", icon: History },
  { id: "memory", label: "Learning memory", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const pagePaths: Record<WorkspacePage, string> = {
  dashboard: "/dashboard",
  roadmap: "/roadmap",
  consensus: "/consensus",
  projects: "/projects",
  challenges: "/challenges",
  timeline: "/timeline",
  memory: "/memory",
  settings: "/settings",
};

const defaultProject: ActiveProject = {
  id: "docuquery",
  name: "DocuQuery",
  outcome: "Source-grounded document Q&A",
  stack: ["Python", "FastAPI", "pgvector"],
  weeklyHours: 6,
  constraints: ["two-day deadline", "one retrieval flow", "portfolio-quality explanation"],
};

const defaultRoadmap: RoadmapMilestone[] = [
  {
    id: "retrieval",
    state: "now",
    title: "Make retrieval reliable",
    detail: "Tune chunking, add hybrid or reranked retrieval, and inspect retrieved chunks beside answers.",
    estimateMinutes: 90,
    competency: "Retrieval strategies",
    dependsOn: [],
    sortOrder: 0,
    kind: "milestone",
  },
  {
    id: "evals",
    state: "next",
    title: "Build a small eval set",
    detail: "Write 5-8 representative questions with expected grounding and a pass/fail check.",
    estimateMinutes: 60,
    competency: "Evaluations",
    dependsOn: ["retrieval"],
    sortOrder: 1,
    kind: "milestone",
  },
  {
    id: "capstone",
    state: "locked",
    title: "Ship your project",
    detail: "Integrate the milestones into one working, evaluated pipeline you can demo and explain.",
    estimateMinutes: 120,
    competency: "Evaluations",
    dependsOn: ["retrieval", "evals"],
    sortOrder: 2,
    kind: "capstone",
  },
];

const roadmapPayloadSchema = z.object({
  milestones: z.array(roadmapMilestoneSchema),
  gapVector: skillGapVectorSchema.optional(),
});

// A balanced fallback gap vector for the learning-evidence rail before a diagnostic loads.
const defaultGapVector: CompetencyScore[] = COMPETENCIES.map((competency) => ({
  competencyId: competency.id,
  label: competency.label,
  score: 50,
  state: "practicing" as const,
}));

function formatEstimate(minutes: number) {
  return minutes >= 60 ? `${minutes / 60} hr` : `${minutes} min`;
}

const skillStateLabels: Record<string, string> = {
  emerging: "Emerging",
  practicing: "Practicing",
  validated: "Validated",
};

function NavButton({ item, current, onClick }: { item: NavItem; current: WorkspacePage; onClick: (page: WorkspacePage) => void }) {
  const Icon = item.icon;
  return (
    <button
      aria-current={current === item.id ? "page" : undefined}
      className={`nav-button ${current === item.id ? "is-active" : ""}`}
      onClick={() => onClick(item.id)}
      type="button"
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
      <span>{item.label}</span>
    </button>
  );
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Confidence({ value = "Medium confidence" }: { value?: string }) {
  return (
    <span className="confidence">
      <span aria-hidden="true" className="confidence-dot" />
      {value}
    </span>
  );
}

const tourSteps = [
  {
    title: "Start with one useful action",
    description: "Dashboard is your home base. It gives you one practical task for today, not a wall of metrics.",
    detail: "Open a build mission when you are ready to work.",
  },
  {
    title: "Ask when a technical choice blocks you",
    description: "Decisions compares the options against your project, time, and source evidence—then recommends a next step.",
    detail: "You will always see the tradeoff and what could change the recommendation.",
  },
  {
    title: "Complete missions to move forward",
    description: "A completed mission updates your roadmap and learning evidence, so the next suggestion fits what you actually built.",
    detail: "Your progress is based on outcomes, not streaks or chat messages.",
  },
];

function GuidedTour({ onClose, onNavigate }: { onClose: () => void; onNavigate: (page: WorkspacePage) => void }) {
  const [step, setStep] = useState(0);
  const currentStep = tourSteps[step];
  const isFinalStep = step === tourSteps.length - 1;

  function finishTour() {
    onNavigate("dashboard");
    onClose();
  }

  return (
    <div className="modal-backdrop tour-backdrop" role="presentation">
      <section aria-describedby="tour-description" aria-labelledby="tour-title" aria-modal="true" className="guided-tour" role="dialog">
        <div className="tour-topline">
          <span className="tour-step-count">Getting started · {step + 1} of {tourSteps.length}</span>
          <button className="text-link" onClick={finishTour} type="button">Skip tour</button>
        </div>
        <div className="tour-icon"><Sparkles size={20} /></div>
        <h2 id="tour-title">{currentStep.title}</h2>
        <p id="tour-description">{currentStep.description}</p>
        <div className="tour-detail"><Check size={16} /><span>{currentStep.detail}</span></div>
        <div className="tour-progress" aria-label={`Tour progress: ${step + 1} of ${tourSteps.length}`}>
          {tourSteps.map((item, index) => <span className={index === step ? "is-current" : index < step ? "is-complete" : ""} key={item.title} />)}
        </div>
        <div className="tour-actions">
          {step > 0 ? <button className="button button-ghost" onClick={() => setStep((current) => current - 1)} type="button">Back</button> : <span />}
          {isFinalStep ? (
            <button className="button button-primary" onClick={finishTour} type="button">Start with today’s action <ArrowRight size={16} /></button>
          ) : (
            <button className="button button-primary" onClick={() => setStep((current) => current + 1)} type="button">Continue <ArrowRight size={16} /></button>
          )}
        </div>
      </section>
    </div>
  );
}

export function GenPHDApp({ initialPage = "dashboard" }: { initialPage?: WorkspacePage }) {
  const router = useRouter();
  const publicRuntimeConfig = getBrowserPublicRuntimeConfig();
  const hasSecureAuth = Boolean(publicRuntimeConfig.supabaseUrl && publicRuntimeConfig.supabasePublishableKey);
  const [page, setPage] = useState<WorkspacePage>(initialPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [question, setQuestion] = useState("Should I use LangGraph for this two-day RAG project?");
  const [activeBrief, setActiveBrief] = useState<DecisionBrief>(seedDecisionBrief);
  const [consensus, setConsensus] = useState<ConsensusReport | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<"ready" | "working">("ready");
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [missionComplete, setMissionComplete] = useState(false);
  const [isCompletingMission, setIsCompletingMission] = useState(false);
  const [missionError, setMissionError] = useState<string | null>(null);
  const [skillState, setSkillState] = useState("Emerging");
  const [project, setProject] = useState<ActiveProject>(defaultProject);
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>(defaultRoadmap);
  const [gapVector, setGapVector] = useState<CompetencyScore[]>(defaultGapVector);
  const navigationKey = useRef<string | null>(null);

  const completedCount = useMemo(() => (missionComplete ? 2 : 1), [missionComplete]);
  const navigate = useCallback((nextPage: WorkspacePage) => {
    setPage(nextPage);
    setIsMobileMenuOpen(false);
    router.push(pagePaths[nextPage]);
  }, [router]);

  // The coding challenge targets the roadmap's current focus (or the weakest competency).
  const challengeCompetency = useMemo(() => {
    const now = roadmap.find((milestone) => milestone.state === "now");
    if (now) return normalizeCompetencyId(now.competency);
    const weakest = [...gapVector].sort((a, b) => a.score - b.score)[0];
    return weakest?.competencyId ?? "retrieval";
  }, [roadmap, gapVector]);

  const handleChallengePass = useCallback((competencyId: string, score: number) => {
    setGapVector((previous) => {
      const next = previous.map((entry) =>
        entry.competencyId === competencyId
          ? { ...entry, score: Math.max(entry.score, score), state: (score >= 76 ? "validated" : score >= 40 ? "practicing" : entry.state) as CompetencyScore["state"] }
          : entry,
      );
      window.sessionStorage.setItem("genphd-gap-vector", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const tourTimer = window.setTimeout(() => {
      setIsTourOpen(window.localStorage.getItem("genphd-tour-complete") !== "true");
    }, 0);

    return () => window.clearTimeout(tourTimer);
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function restoreWorkspace() {
      try {
        const cachedBrief = window.sessionStorage.getItem("genphd-active-brief");
        const cachedMissionStatus = window.sessionStorage.getItem("genphd-mission-status");
        const cachedProject = window.sessionStorage.getItem("genphd-active-project");
        const cachedRoadmap = window.sessionStorage.getItem("genphd-roadmap");
        const cachedGapVector = window.sessionStorage.getItem("genphd-gap-vector");
        const cachedConsensus = window.sessionStorage.getItem("genphd-consensus");
        const parsedBrief = cachedBrief ? decisionBriefSchema.safeParse(JSON.parse(cachedBrief)) : null;
        const parsedProject = cachedProject ? activeProjectSchema.safeParse(JSON.parse(cachedProject)) : null;
        const parsedRoadmap = cachedRoadmap ? roadmapPayloadSchema.safeParse(JSON.parse(cachedRoadmap)) : null;
        const parsedGapVector = cachedGapVector ? skillGapVectorSchema.safeParse(JSON.parse(cachedGapVector)) : null;
        const parsedConsensus = cachedConsensus ? consensusReportSchema.safeParse(JSON.parse(cachedConsensus)) : null;

        if (parsedBrief?.success && isCurrent) {
          setActiveBrief(parsedBrief.data);
          const isCompleted = cachedMissionStatus === "completed";
          setMissionComplete(isCompleted);
          setSkillState(isCompleted ? "Practicing" : "Emerging");
        }

        if (parsedConsensus?.success && isCurrent) {
          setConsensus(parsedConsensus.data);
        }

        if (parsedProject?.success && isCurrent) {
          setProject(parsedProject.data);
        }

        if (parsedRoadmap?.success && isCurrent) {
          setRoadmap(parsedRoadmap.data.milestones);
        }

        if (parsedGapVector?.success && isCurrent) {
          setGapVector(parsedGapVector.data);
        }

        if (!parsedBrief?.success) {
          const response = await fetch("/api/decisions", { cache: "no-store" });
          const payload: unknown = await response.json();
          const state = decisionStateSchema.safeParse(payload);

          if (response.ok && state.success && isCurrent) {
            setActiveBrief(state.data.brief);
            if (state.data.consensus) setConsensus(state.data.consensus);
            const isCompleted = state.data.missionStatus === "completed";
            setMissionComplete(isCompleted);
            setSkillState(isCompleted ? "Practicing" : "Emerging");
          }
        }

        if (!parsedProject?.success) {
          const response = await fetch("/api/projects/active", { cache: "no-store" });
          const payload: unknown = await response.json();
          const activeProject = activeProjectSchema.safeParse(payload);
          if (response.ok && activeProject.success && isCurrent) {
            setProject(activeProject.data);
          }
        }

        if (!parsedRoadmap?.success || !parsedGapVector?.success) {
          const response = await fetch("/api/roadmap", { cache: "no-store" });
          const payload: unknown = await response.json();
          const roadmapPayload = roadmapPayloadSchema.safeParse(payload);
          if (response.ok && roadmapPayload.success && isCurrent) {
            if (!parsedRoadmap?.success) setRoadmap(roadmapPayload.data.milestones);
            if (!parsedGapVector?.success && roadmapPayload.data.gapVector) {
              setGapVector(roadmapPayload.data.gapVector);
            }
          }
        }
      } catch {
        // The demo brief remains available when the workspace cannot be reached.
      }
    }

    void restoreWorkspace();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
        return;
      }

      if (event.key === "?" && !isTyping) {
        event.preventDefault();
        setIsTourOpen(true);
        return;
      }

      if (event.key === "Escape") {
        setIsCommandOpen(false);
        setIsComposerOpen(false);
        setIsTourOpen(false);
        setIsMobileMenuOpen(false);
        return;
      }

      if (isTyping) return;

      if (navigationKey.current === "g") {
        const destinations: Record<string, WorkspacePage> = {
          d: "dashboard",
          r: "roadmap",
          c: "consensus",
          p: "projects",
          t: "timeline",
        };
        const destination = destinations[event.key.toLowerCase()];
        navigationKey.current = null;
        if (destination) {
          event.preventDefault();
          navigate(destination);
        }
        return;
      }

      if (event.key.toLowerCase() === "g") {
        navigationKey.current = "g";
        window.setTimeout(() => {
          navigationKey.current = null;
        }, 800);
      }

      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsComposerOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  async function createDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setDecisionStatus("working");
    setDecisionError(null);
    try {
      const response = await fetch("/api/consensus", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          projectId: project.id,
          constraints: project.constraints,
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
          ? data.message
          : "Consensus could not be created.";
        throw new Error(message);
      }

      const parsed = z.object({ brief: decisionBriefSchema, consensus: consensusReportSchema }).safeParse(data);
      if (!parsed.success) {
        throw new Error("Consensus could not be validated. Please retry.");
      }

      setActiveBrief(parsed.data.brief);
      setConsensus(parsed.data.consensus);
      window.sessionStorage.setItem("genphd-active-brief", JSON.stringify(parsed.data.brief));
      window.sessionStorage.setItem("genphd-consensus", JSON.stringify(parsed.data.consensus));
      window.sessionStorage.removeItem("genphd-mission-status");
      setMissionComplete(false);
      setMissionError(null);
      setSkillState("Emerging");
      setDecisionStatus("ready");
      setIsComposerOpen(false);
      navigate("consensus");
    } catch (error) {
      setDecisionError(error instanceof Error ? error.message : "Decision Brief could not be created. Please retry.");
      setDecisionStatus("ready");
    }
  }

  async function completeMission() {
    setIsCompletingMission(true);
    setMissionError(null);

    try {
      const response = await fetch("/api/missions/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          missionId: activeBrief.nextAction.id,
          competency: activeBrief.nextAction.competency,
          outcomeNote: "Completed from the GenPHD build mission.",
        }),
      });

      if (!response.ok) {
        throw new Error("Mission completion could not be saved.");
      }

      setMissionComplete(true);
      setSkillState("Practicing");
      window.sessionStorage.setItem("genphd-mission-status", "completed");
    } catch {
      setMissionError("Your result could not be saved. Please retry before leaving this mission.");
    } finally {
      setIsCompletingMission(false);
    }
  }

  function closeTour() {
    window.localStorage.setItem("genphd-tour-complete", "true");
    setIsTourOpen(false);
  }

  const appContent = () => {
    switch (page) {
      case "roadmap":
        return <Roadmap missionComplete={missionComplete} milestones={roadmap} onOpenMission={() => navigate("challenges")} projectName={project.name} />;
      case "consensus":
        return (
          <Consensus
            brief={activeBrief}
            consensus={consensus}
            decisionStatus={decisionStatus}
            onStartMission={() => navigate("challenges")}
            onNewDecision={() => setIsComposerOpen(true)}
          />
        );
      case "projects":
        return <Projects brief={activeBrief} onDecision={() => setIsComposerOpen(true)} project={project} roadmap={roadmap} />;
      case "challenges":
        return <Challenges key={challengeCompetency} competencyId={challengeCompetency} onPass={handleChallengePass} onViewRoadmap={() => navigate("roadmap")} />;
      case "timeline":
        return <Timeline missionComplete={missionComplete} projectName={project.name} />;
      case "memory":
        return <Memory project={project} skillState={skillState} />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <Dashboard
            brief={activeBrief}
            completedCount={completedCount}
            gapVector={gapVector}
            isCompletingMission={isCompletingMission}
            missionError={missionError}
            missionComplete={missionComplete}
            onComplete={completeMission}
            onNewDecision={() => setIsComposerOpen(true)}
            onNavigate={navigate}
            project={project}
            roadmap={roadmap}
          />
        );
    }
  };

  return (
    <div className="app-shell dashboard-shell">
      <aside className={`sidebar ${isSidebarOpen ? "" : "is-collapsed"} ${isMobileMenuOpen ? "is-mobile-open" : ""}`}>
        <div className="sidebar-top">
          <button className="brand" onClick={() => navigate("dashboard")} type="button" aria-label="Go to dashboard">
            <BrandLogo className="workspace-brand-logo" priority />
          </button>
          <button className="icon-button sidebar-toggle" onClick={() => setIsSidebarOpen((current) => !current)} type="button" aria-label="Toggle sidebar">
            {isSidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
          <button className="icon-button mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)} type="button" aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <div className="project-switcher">
          <span className="project-dot" aria-hidden="true" />
          <div>
            <span className="project-label">Active project</span>
            <strong>{project.name}</strong>
          </div>
          <ChevronRight size={15} aria-hidden="true" />
        </div>

        <nav aria-label="Main navigation" className="main-nav">
          {navItems.map((item) => <NavButton key={item.id} item={item} current={page} onClick={navigate} />)}
        </nav>

        <div className="sidebar-bottom">
          <button className="shortcut-button help-tour-button" onClick={() => setIsTourOpen(true)} type="button">
            <CircleHelp size={15} aria-hidden="true" />
            <span>How GenPHD works</span>
            <kbd>?</kbd>
          </button>
          <button className="shortcut-button" onClick={() => setIsCommandOpen(true)} type="button">
            <Command size={15} aria-hidden="true" />
            <span>Search workspace</span>
            <kbd>⌘ K</kbd>
          </button>
          <button className="sidebar-search" onClick={() => setIsCommandOpen(true)} type="button">
            <Search aria-hidden="true" size={14} />
            <span>Search workspace</span>
          </button>
          <button className="user-button" type="button" onClick={() => navigate("settings")}>
            <span className="avatar">AP</span>
            <span>
              <strong>Ankit Pandit</strong>
              <small>AI builder</small>
            </span>
            <MoreHorizontal size={16} aria-hidden="true" />
          </button>
        </div>
      </aside>

      {isMobileMenuOpen ? <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setIsMobileMenuOpen(false)} type="button" /> : null}

      <main className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setIsMobileMenuOpen(true)} type="button" aria-label="Open navigation">
            <Menu size={19} />
          </button>
          <div className="topbar-context">
            <span>{project.name}</span>
            <ChevronRight size={14} aria-hidden="true" />
            <strong>{navItems.find((item) => item.id === page)?.label ?? "Dashboard"}</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button tour-button" onClick={() => setIsTourOpen(true)} type="button" aria-label="How GenPHD works">
              <CircleHelp size={17} />
            </button>
            <button className="icon-button" onClick={() => setIsCommandOpen(true)} type="button" aria-label="Search workspace">
              <Search size={17} />
            </button>
            <button className="icon-button notification-button" type="button" aria-label="View notifications">
              <Bell size={17} />
              <span className="notification-dot" aria-hidden="true" />
            </button>
            {hasSecureAuth ? <SignOutButton /> : <Link className="button button-secondary sign-in-link" href="/login">Sign in</Link>}
            <button className="avatar topbar-avatar" onClick={() => router.push("/profile")} type="button" aria-label="Open profile">AP</button>
          </div>
        </header>

        <div className="page-container">{appContent()}</div>
      </main>

      {isComposerOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section aria-modal="true" aria-labelledby="decision-composer-title" className="modal" role="dialog">
            <button className="icon-button modal-close" onClick={() => setIsComposerOpen(false)} type="button" aria-label="Close decision composer">
              <X size={18} />
            </button>
            <p className="eyebrow">New decision</p>
            <h2 id="decision-composer-title">What is slowing this project down?</h2>
            <p className="modal-description">GenPHD will match the question to your project constraints, source evidence, and current roadmap.</p>
            <form onSubmit={createDecision}>
              <label htmlFor="decision-question">Decision question</label>
              <textarea
                id="decision-question"
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                value={question}
              />
              <div className="constraint-list" aria-label="Active project constraints">
                <span>Two-day deadline</span>
                <span>Python</span>
                <span>One retrieval flow</span>
              </div>
              {decisionError ? <p className="inline-error" role="alert">{decisionError}</p> : null}
              <div className="modal-actions">
                <button className="button button-secondary" onClick={() => setIsComposerOpen(false)} type="button">Cancel</button>
                <button className="button button-primary" type="submit">
                  <Sparkles size={16} aria-hidden="true" />
                  Create decision brief
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isTourOpen ? <GuidedTour onClose={closeTour} onNavigate={navigate} /> : null}

      {isCommandOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section aria-modal="true" aria-labelledby="command-title" className="command-menu" role="dialog">
            <div className="command-input">
              <Search size={17} aria-hidden="true" />
              <input aria-label="Search workspace" autoFocus placeholder="Search workspace" />
              <kbd>Esc</kbd>
            </div>
            <p id="command-title" className="command-label">Quick actions</p>
            <button onClick={() => { setIsCommandOpen(false); setIsComposerOpen(true); }} type="button"><Plus size={16} /> Ask a decision <kbd>⌘ D</kbd></button>
            <button onClick={() => { setIsCommandOpen(false); navigate("challenges"); }} type="button"><ListChecks size={16} /> Open today’s mission</button>
            <button onClick={() => { setIsCommandOpen(false); navigate("roadmap"); }} type="button"><Target size={16} /> Review roadmap</button>
            <button className="command-close" onClick={() => setIsCommandOpen(false)} type="button">Close</button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Dashboard({ brief, completedCount, gapVector, isCompletingMission, missionError, missionComplete, onComplete, onNewDecision, onNavigate, project, roadmap }: {
  brief: DecisionBrief;
  completedCount: number;
  gapVector: CompetencyScore[];
  isCompletingMission: boolean;
  missionError: string | null;
  missionComplete: boolean;
  onComplete: () => void;
  onNewDecision: () => void;
  onNavigate: (page: WorkspacePage) => void;
  project: ActiveProject;
  roadmap: RoadmapMilestone[];
}) {
  const nextMilestone = roadmap.find((milestone) => milestone.state === "next") ?? roadmap[1];
  return (
    <>
      <PageTitle
        eyebrow="Saturday, 19 July"
        title="Today’s best next action"
        description={`Your fastest path to a stronger ${project.name} is to complete one focused action before widening scope.`}
        action={<button className="button button-primary desktop-action" onClick={onNewDecision} type="button"><Plus size={16} /> Ask a decision</button>}
      />
      <div className="dashboard-layout">
        <section className="main-column">
          <article className={`mission-card ${missionComplete ? "is-complete" : ""}`}>
            <div className="mission-card-top">
              <span className="mission-kicker"><Lightbulb size={15} /> {brief.nextAction.competency}</span>
              <span className="time-estimate"><Clock3 size={14} /> {brief.nextAction.estimateMinutes} min</span>
            </div>
            <h2>{missionComplete ? `${brief.nextAction.title} complete` : brief.nextAction.title}</h2>
            <p>{missionComplete ? "Your evidence is now informing the next roadmap milestone." : brief.nextAction.objective}</p>
            <ul className="acceptance-list">
              {brief.nextAction.acceptanceCriteria.map((criterion) => <li className={missionComplete ? "is-done" : ""} key={criterion}><Check size={15} /> {criterion}</li>)}
            </ul>
            <div className="mission-actions">
              {missionComplete ? (
                <button className="button button-primary" onClick={() => onNavigate("roadmap")} type="button">View updated roadmap <ArrowRight size={16} /></button>
              ) : (
                <button className="button button-primary" disabled={isCompletingMission} onClick={onComplete} type="button">{isCompletingMission ? "Saving outcome…" : "Complete mission"} <Check size={16} /></button>
              )}
              <button className="button button-ghost" onClick={() => onNavigate("challenges")} type="button">Open mission</button>
            </div>
            {missionError ? <p className="inline-error" role="alert">{missionError}</p> : null}
          </article>

          <section className="section-block">
            <div className="section-heading">
              <div><p className="eyebrow">Current decision</p><h2>{brief.recommendation}</h2></div>
              <button className="text-link" onClick={() => onNavigate("consensus")} type="button">Review brief <ChevronRight size={15} /></button>
            </div>
            <article className="decision-summary">
              <div className="summary-icon"><BrainCircuit size={18} /></div>
              <div>
                <p>{brief.summary}</p>
                <div className="summary-meta"><Confidence value={`${brief.confidence.replace("-", " ")} confidence`} /> <span>{brief.evidence.length} evidence sources</span><span>Updated today</span></div>
              </div>
            </article>
          </section>

          <section className="section-block">
            <div className="section-heading"><div><p className="eyebrow">Next milestone</p><h2>{nextMilestone?.title ?? "Review your roadmap"}</h2></div><span className="quiet-label">{nextMilestone ? formatEstimate(nextMilestone.estimateMinutes) : ""}</span></div>
            <button className="flat-row" onClick={() => onNavigate("roadmap")} type="button">
              <span className="roadmap-index">02</span>
              <span><strong>{nextMilestone?.title ?? "Open your current roadmap"}</strong><small>{nextMilestone?.detail ?? "See the next project action and its evidence target."}</small></span>
              <ChevronRight size={17} />
            </button>
          </section>
        </section>

        <aside className="context-rail">
          <section className="rail-section">
            <p className="eyebrow">Project signal</p>
            <div className="signal-score"><span>{missionComplete ? "2" : "1"}</span><small>of {Math.max(roadmap.length, 1)} focused milestones complete</small></div>
            <div className="progress-line"><span style={{ width: `${completedCount * 20}%` }} /></div>
            <button className="text-link" onClick={() => onNavigate("projects")} type="button">View project <ChevronRight size={14} /></button>
          </section>
          <section className="rail-section skill-section">
            <p className="eyebrow">Learning evidence</p>
            {gapVector.map((entry) => (
              <div className="skill-row" key={entry.competencyId}><span>{entry.label}</span><strong>{skillStateLabels[entry.state] ?? entry.state}</strong></div>
            ))}
            <button className="text-link" onClick={() => onNavigate("memory")} type="button">Review evidence <ChevronRight size={14} /></button>
          </section>
        </aside>
      </div>
    </>
  );
}

function Roadmap({ missionComplete, milestones, onOpenMission, projectName }: { missionComplete: boolean; milestones: RoadmapMilestone[]; onOpenMission: () => void; projectName: string }) {
  return (
    <section className="reading-column">
      <PageTitle eyebrow={`${projectName} roadmap`} title="Build capability through the project" description="Your milestones target your weakest skills first, in the order they build on each other, and end at a shippable artifact." />
      {missionComplete ? <p className="success-note" role="status">Updated because your completed mission created new practical evidence.</p> : null}
      <div className="roadmap-list">
        {milestones.map((milestone, index) => {
          const isCapstone = milestone.kind === "capstone";
          const isLocked = milestone.state === "locked";
          return (
            <article className={`roadmap-node ${milestone.state} ${isCapstone ? "is-capstone" : ""}`} key={milestone.id}>
              <span className="node-line" aria-hidden="true" />
              <span className="node-index">
                {isCapstone ? <Trophy size={12} aria-hidden="true" /> : isLocked ? <Lock size={11} aria-hidden="true" /> : `0${index + 1}`}
              </span>
              <div className="node-content">
                <div className="node-header">
                  <div><p className="node-capability">{isCapstone ? "Capstone artifact" : milestone.competency}</p><h2>{milestone.title}</h2></div>
                  <span className="time-estimate"><Clock3 size={14} /> {formatEstimate(milestone.estimateMinutes)}</span>
                </div>
                <p>{milestone.detail}</p>
                {milestone.state === "now" ? <button className="button button-primary" onClick={onOpenMission} type="button">Start mission <ArrowRight size={16} /></button> : null}
                {isLocked ? <p className="counterfactual"><Lock size={14} /> Unlocks when its earlier milestone{milestone.dependsOn.length > 1 ? "s are" : " is"} complete.</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const consensusModeLabels: Record<ConsensusReport["mode"], string> = {
  "multi-model": "3 models compared",
  "single-model": "1 model available",
  deterministic: "Grounded fallback",
};

function Consensus({ brief, consensus, decisionStatus, onStartMission, onNewDecision }: { brief: DecisionBrief; consensus: ConsensusReport | null; decisionStatus: "ready" | "working"; onStartMission: () => void; onNewDecision: () => void }) {
  const isWorking = decisionStatus === "working";
  const question = consensus?.question ?? brief.question;
  const recommendation = consensus?.recommendation ?? brief.recommendation;
  const confidence = consensus?.confidence ?? brief.confidence;
  const nextStep = consensus?.nextStep ?? brief.nextAction.title;

  return (
    <section className="reading-column decision-page">
      <PageTitle
        eyebrow="Model consensus"
        title="Where the models agree — and where they don't"
        description="Ask once. We send it to several models, show where they line up and where they conflict, and give you one trusted next step."
        action={<button className="button button-secondary desktop-action" onClick={onNewDecision} type="button"><Plus size={16} /> New decision</button>}
      />
      <div className="decision-question"><span className="question-icon"><Bot size={17} /></span><p>{question}</p></div>

      {isWorking ? (
        <div className="workflow-status" role="status"><span className="working-pulse" aria-hidden="true" /> Asking the models and reconciling their answers…</div>
      ) : (
        <>
          <article className="recommendation-card">
            <div className="recommendation-top"><span className="eyebrow">One trusted next step</span><Confidence value={`${confidence.replace("-", " ")} confidence`} /></div>
            <h2>{recommendation}</h2>
            <p>{nextStep}</p>
            <div className="recommendation-actions"><button className="button button-primary" onClick={onStartMission} type="button">Start build mission <ArrowRight size={16} /></button><button className="button button-ghost" type="button">Save to project</button></div>
          </article>

          {consensus && consensus.models.length > 0 ? (
            <section className="decision-section">
              <div className="section-heading"><div><p className="eyebrow">The raw answers</p><h2>What each model said</h2></div><span className="quiet-label">{consensusModeLabels[consensus.mode]}</span></div>
              <div className="consensus-grid">
                {consensus.models.map((model) => (
                  <article className="model-card" key={model.model}>
                    <div className="model-card-head"><span className="model-badge">{model.label}</span></div>
                    <strong>{model.headline}</strong>
                    <p>{model.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {consensus && consensus.agreements.length > 0 ? (
            <section className="decision-section">
              <div className="section-heading"><div><p className="eyebrow">Where they agree</p><h2>Shared ground you can trust</h2></div></div>
              <ul className="agreement-list">
                {consensus.agreements.map((point) => <li key={point}><Check size={15} /> {point}</li>)}
              </ul>
            </section>
          ) : null}

          {consensus && consensus.conflicts.length > 0 ? (
            <section className="decision-section">
              <div className="section-heading"><div><p className="eyebrow">Where they conflict</p><h2>Decide these with your context</h2></div></div>
              <div className="conflict-list">
                {consensus.conflicts.map((conflict) => (
                  <article className="conflict-item" key={conflict.topic}>
                    <div className="conflict-title"><ShieldCheck size={16} /><strong>{conflict.topic}</strong>{conflict.models.length ? <span className="conflict-models">{conflict.models.join(" vs ")}</span> : null}</div>
                    <p>{conflict.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="decision-section">
            <div className="section-heading"><div><p className="eyebrow">Grounded in your sources</p><h2>Evidence matched to your constraints</h2></div><span className="quiet-label">{brief.evidence.length} sources</span></div>
            <div className="evidence-list">
              {brief.evidence.map((item) => (
                <article className="evidence-item" key={item.title}>
                  <div className="evidence-title"><FileCheck2 size={16} /><strong>{item.title}</strong><span>{item.tier}</span></div>
                  <p>{item.detail}</p>
                  {item.isExternal ? <a className="source-link" href={item.url} rel="noreferrer" target="_blank">View source context <ExternalLink size={13} /></a> : <span className="source-link source-context-label">Linked project context</span>}
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

function Projects({ brief, onDecision, project, roadmap }: { brief: DecisionBrief; onDecision: () => void; project: ActiveProject; roadmap: RoadmapMilestone[] }) {
  const currentMilestone = roadmap.find((milestone) => milestone.state === "now") ?? roadmap[0];
  return (
    <section className="reading-column">
      <PageTitle eyebrow="Active project" title={project.name} description={project.outcome} action={<button className="button button-primary desktop-action" onClick={onDecision} type="button"><Plus size={16} /> Ask a project decision</button>} />
      <article className="project-overview">
        <div className="project-overview-title"><div className="project-symbol"><FolderKanban size={20} /></div><div><p className="eyebrow">Portfolio project</p><h2>{project.outcome}</h2></div></div>
        <div className="project-facts"><div><span>Stack</span><strong>{project.stack.join(" · ")}</strong></div><div><span>Time this week</span><strong>{project.weeklyHours} hours</strong></div><div><span>Current phase</span><strong>{currentMilestone?.competency ?? "Project planning"}</strong></div></div>
      </article>
      <section className="decision-section">
        <div className="section-heading"><div><p className="eyebrow">Project constraints</p><h2>What the system should optimize for</h2></div><button className="text-link" type="button">Edit context</button></div>
        <div className="constraint-grid">{project.constraints.map((constraint) => <span key={constraint}>{constraint}</span>)}</div>
      </section>
      <section className="decision-section">
        <div className="section-heading"><div><p className="eyebrow">Latest decision</p><h2>{brief.recommendation}</h2></div><button className="text-link" onClick={() => onDecision()} type="button">Ask another <ChevronRight size={15} /></button></div>
        <button className="flat-row" type="button"><span className="roadmap-index">01</span><span><strong>{brief.recommendation}</strong><small>Recommendation made today · {brief.evidence.length} evidence sources</small></span><Confidence value={`${brief.confidence.replace("-", " ")} confidence`} /><ChevronRight size={17} /></button>
      </section>
    </section>
  );
}

function Challenges({ competencyId, onPass, onViewRoadmap }: { competencyId: string; onPass: (competencyId: string, score: number) => void; onViewRoadmap: () => void }) {
  const [challenge, setChallenge] = useState<PublicChallenge | null>(null);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"loading" | "ready" | "grading" | "graded" | "error">("loading");
  const [grade, setGrade] = useState<ChallengeGrade | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/challenges?competency=${encodeURIComponent(competencyId)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("load"))))
      .then((data: { challenge?: unknown }) => {
        if (!active) return;
        const parsed = data.challenge ? publicChallengeSchema.safeParse(data.challenge) : null;
        if (parsed?.success) {
          setChallenge(parsed.data);
          setCode(parsed.data.starterCode);
          setPhase("ready");
        } else {
          setPhase("error");
        }
      })
      .catch(() => active && setPhase("error"));
    return () => {
      active = false;
    };
  }, [competencyId]);

  async function submit() {
    if (!challenge) return;
    setPhase("grading");
    setError(null);
    const response = await fetch("/api/challenges/grade", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.id, code }),
    }).catch(() => null);

    const payload: unknown = response ? await response.json().catch(() => null) : null;
    if (!response?.ok) {
      setError("Grading failed. Please retry.");
      setPhase("ready");
      return;
    }
    const parsed = z.object({ grade: challengeGradeSchema, competencyId: z.string() }).safeParse(payload);
    if (!parsed.success) {
      setError("Could not read the grade. Please retry.");
      setPhase("ready");
      return;
    }
    setGrade(parsed.data.grade);
    setPhase("graded");
    if (parsed.data.grade.passed) onPass(parsed.data.competencyId, parsed.data.grade.score);
  }

  if (phase === "loading") {
    return (
      <section className="reading-column">
        <PageTitle eyebrow="Live coding challenge" title="Loading your challenge…" description="Fetching a framework-current task for your current focus." />
      </section>
    );
  }

  if (phase === "error" || !challenge) {
    return (
      <section className="reading-column">
        <PageTitle eyebrow="Live coding challenge" title="No challenge available" description="Try again shortly, or continue from your roadmap." />
        <button className="button button-primary" onClick={onViewRoadmap} type="button">Back to roadmap <ArrowRight size={16} /></button>
      </section>
    );
  }

  const isGrading = phase === "grading";

  return (
    <section className="reading-column">
      <PageTitle eyebrow="Live coding challenge" title={challenge.title} description="Write real code. An AI grader checks it against the criteria — this is not multiple choice." />
      <div className="challenge-meta">
        <span className="challenge-badge"><Code2 size={13} /> {challenge.language}</span>
        <span className="challenge-badge">{challenge.framework}</span>
        <span className="challenge-badge">{challenge.difficulty}</span>
      </div>
      <p className="challenge-scenario">{challenge.scenario}</p>

      <div className="criteria-block">
        <p className="eyebrow">What the grader checks</p>
        <ul className="acceptance-list">
          {challenge.criteria.map((criterion) => <li key={criterion}><Check size={15} /> {criterion}</li>)}
        </ul>
      </div>

      <label className="code-editor-label" htmlFor="challenge-code">Your solution</label>
      <textarea
        className="code-editor"
        id="challenge-code"
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        value={code}
      />

      <div className="mission-actions">
        <button className="button button-primary" disabled={isGrading || code.trim().length === 0} onClick={submit} type="button">
          {isGrading ? "Grading…" : "Submit for grading"} <ArrowRight size={16} />
        </button>
        {grade?.passed ? <button className="button button-ghost" onClick={onViewRoadmap} type="button">View updated roadmap</button> : null}
      </div>
      {error ? <p className="inline-error" role="alert">{error}</p> : null}

      {phase === "graded" && grade ? (
        <article className={`grade-card ${grade.passed ? "is-pass" : "is-fail"}`}>
          <div className="grade-top">
            <span className={`grade-verdict ${grade.passed ? "is-pass" : "is-fail"}`}>{grade.passed ? "Passed" : "Not yet"}</span>
            <span className="grade-score">{grade.score}/100</span>
          </div>
          <div className="gap-bar"><span className={`gap-fill ${grade.passed ? "validated" : "emerging"}`} style={{ width: `${grade.score}%` }} /></div>
          <ul className="grade-criteria">
            {grade.criteria.map((result) => (
              <li className={result.met ? "is-met" : "is-missed"} key={result.criterion}>
                {result.met ? <Check size={15} /> : <X size={15} />}
                <span><strong>{result.criterion}</strong>{result.note ? <small>{result.note}</small> : null}</span>
              </li>
            ))}
          </ul>
          <p className="grade-feedback">{grade.feedback}</p>
          <p className="grade-source">{grade.gradedBy === "ai" ? "Graded by AI against the criteria." : "Graded offline by heuristic — add an AI provider key for correctness-aware grading."}</p>
        </article>
      ) : null}
    </section>
  );
}

function Timeline({ missionComplete, projectName }: { missionComplete: boolean; projectName: string }) {
  const events = [
    ...(missionComplete ? [{ title: "Build mission completed", detail: "RAG evaluation evidence updated to Practicing.", icon: Check }] : []),
    { title: "Decision recorded", detail: "Use a simple workflow for the first DocuQuery release.", icon: BrainCircuit },
    { title: "Roadmap created", detail: "Three milestones were prioritized from project context and time availability.", icon: Target },
    { title: "Project context added", detail: `${projectName} and its current constraints are now visible to your decisions.`, icon: FolderKanban },
  ];
  return (
    <section className="reading-column">
      <PageTitle eyebrow="Learning history" title="Your decisions are becoming evidence" description="A concise record of what you chose, built, and learned—not a stream of chat messages." />
      <div className="timeline-list">
        {events.map((event) => {
          const Icon = event.icon;
          return <article className="timeline-item" key={event.title}><span className="timeline-marker"><Icon size={15} /></span><div><p className="timeline-date">Today</p><h2>{event.title}</h2><p>{event.detail}</p></div><ChevronRight size={16} /></article>;
        })}
      </div>
    </section>
  );
}

function Memory({ project, skillState }: { project: ActiveProject; skillState: string }) {
  return (
    <section className="reading-column">
      <PageTitle eyebrow="Visible memory" title="What GenPHD remembers" description="Memory is scoped to your projects, editable by you, and used only to improve the next decision or build mission." action={<button className="button button-secondary desktop-action" type="button">Export memory</button>} />
      <section className="memory-group"><p className="eyebrow">Project context</p><MemoryRow label="Active project" value={`${project.name} — ${project.outcome}`} source="You set this during onboarding" /><MemoryRow label="Project constraint" value={project.constraints.join(" · ")} source="You set this in project context" /></section>
      <section className="memory-group"><p className="eyebrow">Learning evidence</p><MemoryRow label="RAG evaluation" value={skillState} source={skillState === "Practicing" ? "Build mission completed today" : "Baseline diagnostic"} /><MemoryRow label="Prompt design" value="Validated" source="Project explanation review" /></section>
      <section className="memory-group"><p className="eyebrow">Decision history</p><MemoryRow label="Workflow choice" value="Simple application workflow for v1" source="Decision brief · today" /></section>
      <div className="privacy-note"><ShieldCheck size={18} /><p><strong>You control this memory.</strong> Edit, remove, or export any persistent item. GenPHD does not retain secrets or raw source code by default.</p></div>
    </section>
  );
}

function MemoryRow({ label, value, source }: { label: string; value: string; source: string }) {
  return <div className="memory-row"><div><strong>{label}</strong><span>{value}</span><small>{source}</small></div><button className="text-link" type="button">Edit</button></div>;
}

function SettingsPage() {
  return (
    <section className="reading-column settings-page">
      <PageTitle eyebrow="Workspace settings" title="Keep control of the system" description="Preferences shape presentation and reminders; they do not silently rewrite your project decisions." />
      <section className="settings-section"><div><h2>Decision notifications</h2><p>Receive updates only when an active decision may have changed.</p></div><label className="switch"><input defaultChecked type="checkbox" /><span aria-hidden="true" /></label></section>
      <section className="settings-section"><div><h2>Mission reminders</h2><p>One quiet reminder when a current build mission is due today.</p></div><label className="switch"><input defaultChecked type="checkbox" /><span aria-hidden="true" /></label></section>
      <section className="settings-section"><div><h2>Memory controls</h2><p>Review, correct, export, or remove every persistent memory item.</p></div><button className="button button-secondary" type="button">Review memory</button></section>
      <section className="settings-section"><div><h2>Cloud workspace</h2><p>Sign in to privately save decision briefs, completed missions, and learning evidence.</p></div><Link className="button button-secondary" href="/login">Connect account</Link></section>
      <section className="danger-section"><div><h2>Delete workspace data</h2><p>Removes projects, decisions, learning evidence, and stored memory.</p></div><button className="button button-danger" type="button">Delete workspace</button></section>
    </section>
  );
}
