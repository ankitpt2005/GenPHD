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
  Command,
  ExternalLink,
  FileCheck2,
  FolderKanban,
  History,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
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
  X,
} from "lucide-react";
import { seedDecisionBrief } from "../lib/decision/brief";
import { decisionBriefSchema, type DecisionBrief } from "../lib/decision/types";
import { SignOutButton } from "./auth/sign-out-button";
import { z } from "zod";
import {
  activeProjectSchema,
  decisionStateSchema,
  roadmapMilestoneSchema,
  type ActiveProject,
  type RoadmapMilestone,
} from "../lib/workspace/contracts";

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
  { id: "challenges", label: "Build missions", icon: ListChecks },
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
    id: "evaluate",
    state: "now",
    title: "Evaluate the retrieval pipeline",
    detail: "Create five realistic evaluation questions and inspect retrieved chunks.",
    estimateMinutes: 45,
    competency: "RAG evaluation",
  },
  {
    id: "trace",
    state: "next",
    title: "Add source-grounded answer traces",
    detail: "Make every answer explain the chunks it used and where it is uncertain.",
    estimateMinutes: 90,
    competency: "Grounded generation",
  },
  {
    id: "orchestrate",
    state: "later",
    title: "Introduce workflow state only if needed",
    detail: "Reconsider orchestration once the project gains branching tools or approval steps.",
    estimateMinutes: 120,
    competency: "Agentic workflows",
  },
];

const roadmapPayloadSchema = z.object({ milestones: z.array(roadmapMilestoneSchema) });

function formatEstimate(minutes: number) {
  return minutes >= 60 ? `${minutes / 60} hr` : `${minutes} min`;
}

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
  const hasSecureAuth = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [page, setPage] = useState<WorkspacePage>(initialPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [question, setQuestion] = useState("Should I use LangGraph for this two-day RAG project?");
  const [activeBrief, setActiveBrief] = useState<DecisionBrief>(seedDecisionBrief);
  const [decisionStatus, setDecisionStatus] = useState<"ready" | "working">("ready");
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [missionComplete, setMissionComplete] = useState(false);
  const [isCompletingMission, setIsCompletingMission] = useState(false);
  const [missionError, setMissionError] = useState<string | null>(null);
  const [skillState, setSkillState] = useState("Emerging");
  const [project, setProject] = useState<ActiveProject>(defaultProject);
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>(defaultRoadmap);
  const navigationKey = useRef<string | null>(null);

  const completedCount = useMemo(() => (missionComplete ? 2 : 1), [missionComplete]);
  const navigate = useCallback((nextPage: WorkspacePage) => {
    setPage(nextPage);
    setIsMobileMenuOpen(false);
    router.push(pagePaths[nextPage]);
  }, [router]);

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
        const parsedBrief = cachedBrief ? decisionBriefSchema.safeParse(JSON.parse(cachedBrief)) : null;
        const parsedProject = cachedProject ? activeProjectSchema.safeParse(JSON.parse(cachedProject)) : null;
        const parsedRoadmap = cachedRoadmap ? roadmapPayloadSchema.safeParse(JSON.parse(cachedRoadmap)) : null;

        if (parsedBrief?.success && isCurrent) {
          setActiveBrief(parsedBrief.data);
          const isCompleted = cachedMissionStatus === "completed";
          setMissionComplete(isCompleted);
          setSkillState(isCompleted ? "Practicing" : "Emerging");
        }

        if (parsedProject?.success && isCurrent) {
          setProject(parsedProject.data);
        }

        if (parsedRoadmap?.success && isCurrent) {
          setRoadmap(parsedRoadmap.data.milestones);
        }

        if (!parsedBrief?.success) {
          const response = await fetch("/api/decisions", { cache: "no-store" });
          const payload: unknown = await response.json();
          const state = decisionStateSchema.safeParse(payload);

          if (response.ok && state.success && isCurrent) {
            setActiveBrief(state.data.brief);
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

        if (!parsedRoadmap?.success) {
          const response = await fetch("/api/roadmap", { cache: "no-store" });
          const payload: unknown = await response.json();
          const roadmapPayload = roadmapPayloadSchema.safeParse(payload);
          if (response.ok && roadmapPayload.success && isCurrent) {
            setRoadmap(roadmapPayload.data.milestones);
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
      const response = await fetch("/api/decisions", {
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
          : "Decision Brief could not be created.";
        throw new Error(message);
      }

      const brief = decisionBriefSchema.safeParse(data);
      if (!brief.success) {
        throw new Error("Decision Brief could not be validated. Please retry.");
      }

      setActiveBrief(brief.data);
      window.sessionStorage.setItem("genphd-active-brief", JSON.stringify(brief.data));
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
            decisionStatus={decisionStatus}
            onStartMission={() => navigate("challenges")}
            onNewDecision={() => setIsComposerOpen(true)}
          />
        );
      case "projects":
        return <Projects brief={activeBrief} onDecision={() => setIsComposerOpen(true)} project={project} roadmap={roadmap} />;
      case "challenges":
        return <Challenges brief={activeBrief} isCompletingMission={isCompletingMission} missionError={missionError} missionComplete={missionComplete} onComplete={completeMission} onViewRoadmap={() => navigate("roadmap")} />;
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
            <span className="brand-mark">G</span>
            <span className="brand-name">GenPHD</span>
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

function Dashboard({ brief, completedCount, isCompletingMission, missionError, missionComplete, onComplete, onNewDecision, onNavigate, project, roadmap }: {
  brief: DecisionBrief;
  completedCount: number;
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
            <div className="skill-row"><span>Prompt design</span><strong>Validated</strong></div>
            <div className="skill-row"><span>Retrieval</span><strong>Practicing</strong></div>
            <div className="skill-row"><span>RAG evaluation</span><strong>{missionComplete ? "Practicing" : "Emerging"}</strong></div>
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
      <PageTitle eyebrow={`${projectName} roadmap`} title="Build capability through the project" description="Your milestones are ordered by delivery impact, learning value, and the time you have available." />
      {missionComplete ? <p className="success-note" role="status">Updated because your retrieval evaluation mission created new practical evidence.</p> : null}
      <div className="roadmap-list">
        {milestones.map((milestone, index) => (
          <article className={`roadmap-node ${milestone.state}`} key={milestone.title}>
            <span className="node-line" aria-hidden="true" />
            <span className="node-index">0{index + 1}</span>
            <div className="node-content">
              <div className="node-header"><div><p className="node-capability">{milestone.competency}</p><h2>{milestone.title}</h2></div><span className="time-estimate"><Clock3 size={14} /> {formatEstimate(milestone.estimateMinutes)}</span></div>
              <p>{milestone.detail}</p>
              {milestone.state === "now" ? <button className="button button-primary" onClick={onOpenMission} type="button">Start mission <ArrowRight size={16} /></button> : null}
              {milestone.state === "later" ? <p className="counterfactual"><ShieldCheck size={15} /> Re-evaluate only when the workflow becomes branched or persistent.</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Consensus({ brief, decisionStatus, onStartMission, onNewDecision }: { brief: DecisionBrief; decisionStatus: "ready" | "working"; onStartMission: () => void; onNewDecision: () => void }) {
  const isWorking = decisionStatus === "working";
  return (
    <section className="reading-column decision-page">
      <PageTitle eyebrow="Decision brief" title="What should you trust?" description="A recommendation is only useful when its evidence, tradeoffs, and limits are visible." action={<button className="button button-secondary desktop-action" onClick={onNewDecision} type="button"><Plus size={16} /> New decision</button>} />
      <div className="decision-question"><span className="question-icon"><Bot size={17} /></span><p>{brief.question}</p></div>
      {isWorking ? (
        <div className="workflow-status" role="status"><span className="working-pulse" aria-hidden="true" /> Reviewing current evidence and project constraints…</div>
      ) : (
        <>
          <article className="recommendation-card">
            <div className="recommendation-top"><span className="eyebrow">Recommended action</span><Confidence value={`${brief.confidence.replace("-", " ")} confidence`} /></div>
            <h2>{brief.recommendation}</h2>
            <p>{brief.summary}</p>
            <p className="confidence-reason">{brief.confidenceReason}</p>
            <div className="recommendation-actions"><button className="button button-primary" onClick={onStartMission} type="button">Start {brief.nextAction.title.toLowerCase()} <ArrowRight size={16} /></button><button className="button button-ghost" type="button">Save to project</button></div>
          </article>

          <section className="decision-section">
            <div className="section-heading"><div><p className="eyebrow">Why this fits</p><h2>Evidence matched to your constraints</h2></div><span className="quiet-label">{brief.evidence.length} sources</span></div>
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

          <section className="decision-section split-section">
            <div><p className="eyebrow">Real tradeoff</p><h2>{brief.conflicts[0]?.title ?? "Known tradeoff"}</h2><p className="body-copy">{brief.tradeoff}</p></div>
            <div className="counterfactual-box"><ShieldCheck size={18} /><div><strong>Choose the alternative if…</strong><p>{brief.counterfactual}</p></div></div>
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

function Challenges({ brief, isCompletingMission, missionError, missionComplete, onComplete, onViewRoadmap }: { brief: DecisionBrief; isCompletingMission: boolean; missionError: string | null; missionComplete: boolean; onComplete: () => void; onViewRoadmap: () => void }) {
  return (
    <section className="reading-column">
      <PageTitle eyebrow="Build mission" title={missionComplete ? "Mission complete" : brief.nextAction.title} description={missionComplete ? "Your reflection has updated the roadmap. Review the next milestone when you are ready." : "A focused task that improves the project and produces evidence about your engineering capability."} />
      <article className={`mission-detail ${missionComplete ? "is-complete" : ""}`}>
        <div className="mission-detail-header"><span className="mission-kicker"><Lightbulb size={15} /> {brief.nextAction.competency}</span><span className="time-estimate"><Clock3 size={14} /> {brief.nextAction.estimateMinutes} min</span></div>
        <h2>{missionComplete ? "You created evidence, not just another feature." : "Target outcome"}</h2>
        <p>{missionComplete ? `GenPHD recorded evidence for ${brief.nextAction.competency.toLowerCase()} and will use it in future roadmap updates.` : brief.nextAction.objective}</p>
        <div className="criteria-block"><p className="eyebrow">Acceptance criteria</p><ul className="acceptance-list">{brief.nextAction.acceptanceCriteria.map((criterion) => <li className={missionComplete ? "is-done" : ""} key={criterion}><Check size={15} /> {criterion}</li>)}</ul></div>
        {!missionComplete ? <div className="hint-box"><Lightbulb size={17} /><p><strong>Hint</strong> Begin with questions whose answer should be unambiguously present in one document. You are validating retrieval before generation.</p></div> : null}
        <div className="mission-actions">{missionComplete ? <button className="button button-primary" onClick={onViewRoadmap} type="button">View updated roadmap <ArrowRight size={16} /></button> : <button className="button button-primary" disabled={isCompletingMission} onClick={onComplete} type="button">{isCompletingMission ? "Saving outcome…" : "Complete mission"} <Check size={16} /></button>}<button className="button button-ghost" type="button">Save draft</button></div>
        {missionError ? <p className="inline-error" role="alert">{missionError}</p> : null}
      </article>
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
