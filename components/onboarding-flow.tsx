"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { diagnosticResultSchema, onboardingResultSchema } from "../lib/workspace/onboarding";

type OnboardingDraft = {
  goal: string;
  projectName: string;
  projectDescription: string;
  stack: string;
  weeklyHours: string;
  blocker: string;
};

const initialDraft: OnboardingDraft = {
  goal: "Build a credible AI engineering portfolio project",
  projectName: "DocuQuery",
  projectDescription: "A source-grounded document assistant that makes retrieval quality visible.",
  stack: "Python, FastAPI, pgvector",
  weeklyHours: "6",
  blocker: "Deciding which evaluation work proves that retrieval is reliable enough to ship.",
};

const questions = [
  ["What outcome are you working toward?", "GenPHD uses one clear goal to prioritize the next practical step."],
  ["What are you building?", "A project and stack are enough to make the first Decision Brief specific."],
  ["What is blocking progress right now?", "Time and the current blocker set the scope for your first roadmap."],
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("genphd-onboarding-draft");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<OnboardingDraft>;
      const restoreTimer = window.setTimeout(() => {
        setDraft((current) => ({ ...current, ...parsed }));
      }, 0);
      return () => window.clearTimeout(restoreTimer);
    } catch {
      window.localStorage.removeItem("genphd-onboarding-draft");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("genphd-onboarding-draft", JSON.stringify(draft));
  }, [draft]);

  function update(field: keyof OnboardingDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function nextStep() {
    const requiredFields: Array<Array<keyof OnboardingDraft>> = [["goal"], ["projectName", "projectDescription", "stack"], ["weeklyHours", "blocker"]];
    if (requiredFields[step].some((field) => !draft[field].trim())) {
      setError("Complete this step before continuing.");
      return;
    }
    setStep((current) => Math.min(current + 1, questions.length - 1));
  }

  async function finish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < questions.length - 1) {
      nextStep();
      return;
    }

    setIsSaving(true);
    setError(null);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: draft.goal,
        projectName: draft.projectName,
        projectDescription: draft.projectDescription,
        stack: draft.stack.split(",").map((item) => item.trim()).filter(Boolean),
        weeklyHours: Number(draft.weeklyHours),
        blocker: draft.blocker,
      }),
    }).catch(() => null);

    const payload: unknown = response ? await response.json().catch(() => null) : null;
    if (!response?.ok) {
      const message = typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Your project setup could not be saved. Please retry.";
      setError(message);
      setIsSaving(false);
      return;
    }

    const savedWorkspace = onboardingResultSchema.safeParse(payload);
    if (!savedWorkspace.success) {
      setError("Your project setup could not be read. Please retry.");
      setIsSaving(false);
      return;
    }

    // The roadmap is generated after the diagnostic, so clear any stale workspace caches.
    window.localStorage.removeItem("genphd-onboarding-draft");
    window.sessionStorage.removeItem("genphd-active-brief");
    window.sessionStorage.removeItem("genphd-mission-status");
    window.sessionStorage.removeItem("genphd-roadmap");
    window.sessionStorage.removeItem("genphd-gap-vector");
    window.sessionStorage.setItem("genphd-active-project", JSON.stringify(savedWorkspace.data.project));
    router.push("/diagnostic");
  }

  const [title, description] = questions[step];

  return (
    <main className="setup-shell">
      <section className="setup-panel" aria-labelledby="onboarding-title">
        <p className="tour-step-count">Step {step + 1} of {questions.length}</p>
        <h1 id="onboarding-title">{title}</h1>
        <p className="page-description">{description}</p>

        <form onSubmit={finish}>
          {step === 0 ? (
            <label className="setup-field" htmlFor="goal">Career or project goal
              <input id="goal" onChange={(event) => update("goal", event.target.value)} value={draft.goal} />
            </label>
          ) : null}

          {step === 1 ? (
            <div className="setup-field-group">
              <label className="setup-field" htmlFor="project-name">Active project
                <input id="project-name" onChange={(event) => update("projectName", event.target.value)} value={draft.projectName} />
              </label>
              <label className="setup-field" htmlFor="project-description">Outcome you want to prove
                <textarea id="project-description" onChange={(event) => update("projectDescription", event.target.value)} rows={4} value={draft.projectDescription} />
              </label>
              <label className="setup-field" htmlFor="stack">Stack, separated by commas
                <input id="stack" onChange={(event) => update("stack", event.target.value)} value={draft.stack} />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="setup-field-group">
              <label className="setup-field" htmlFor="weekly-hours"><span><Clock3 aria-hidden="true" size={15} /> Time available this week</span>
                <select id="weekly-hours" onChange={(event) => update("weeklyHours", event.target.value)} value={draft.weeklyHours}>
                  <option value="2">2 hours</option><option value="4">4 hours</option><option value="6">6 hours</option><option value="10">10 hours</option><option value="15">15 hours</option>
                </select>
              </label>
              <label className="setup-field" htmlFor="blocker">Current blocker
                <textarea id="blocker" onChange={(event) => update("blocker", event.target.value)} rows={5} value={draft.blocker} />
              </label>
            </div>
          ) : null}

          {error ? <p className="inline-error" role="alert">{error}</p> : null}
          <div className="setup-actions">
            {step > 0 ? <button className="button button-ghost" onClick={() => setStep((current) => current - 1)} type="button"><ArrowLeft size={16} /> Back</button> : <span />}
            {step < questions.length - 1 ? <button className="button button-primary" type="submit">Continue <ArrowRight size={16} /></button> : <button className="button button-primary" disabled={isSaving} type="submit">{isSaving ? "Saving project…" : "Start the diagnostic"} <ArrowRight size={16} /></button>}
          </div>
        </form>
      </section>
    </main>
  );
}

// Client-safe question shapes (answer keys never leave the server).
type PublicMcq = { id: string; competencyId: string; difficulty: string; prompt: string; options: { id: string; text: string }[] };
type PublicOpen = { id: string; competencyId: string; prompt: string };
type PublicCompetency = { competencyId: string; label: string; mcq: PublicMcq[]; open: PublicOpen };
type GapEntry = { competencyId: string; label: string; score: number; state: "emerging" | "practicing" | "validated" };

const stateLabels: Record<GapEntry["state"], string> = {
  emerging: "Emerging",
  practicing: "Practicing",
  validated: "Validated",
};

export function DiagnosticFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "quiz" | "submitting" | "result" | "error">("loading");
  const [competencies, setCompetencies] = useState<PublicCompetency[]>([]);
  const [step, setStep] = useState(0);
  const [mcq, setMcq] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, string>>({});
  const [gapVector, setGapVector] = useState<GapEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/diagnostic", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("load"))))
      .then((data: { competencies?: PublicCompetency[] }) => {
        if (!active) return;
        if (Array.isArray(data.competencies) && data.competencies.length > 0) {
          setCompetencies(data.competencies);
          setPhase("quiz");
        } else {
          setPhase("error");
        }
      })
      .catch(() => active && setPhase("error"));
    return () => {
      active = false;
    };
  }, []);

  async function submit(skipped: boolean) {
    setPhase("submitting");
    setError(null);
    const response = await fetch("/api/diagnostic", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(skipped ? { skipped: true } : { mcq, open }),
    }).catch(() => null);

    const payload: unknown = response ? await response.json().catch(() => null) : null;
    if (!response?.ok) {
      setError("Your diagnostic could not be saved. Please retry.");
      setPhase("quiz");
      return;
    }

    const result = diagnosticResultSchema.safeParse(payload);
    if (!result.success) {
      setError("Your results could not be read. Please retry.");
      setPhase("quiz");
      return;
    }

    window.localStorage.setItem("genphd-diagnostic-complete", "true");
    window.sessionStorage.setItem("genphd-roadmap", JSON.stringify({ milestones: result.data.milestones }));
    window.sessionStorage.setItem("genphd-gap-vector", JSON.stringify(result.data.gapVector));
    setGapVector(result.data.gapVector as GapEntry[]);
    setPhase("result");
  }

  if (phase === "loading") {
    return (
      <main className="setup-shell">
        <section className="setup-panel" aria-busy="true">
          <p className="tour-step-count">Baseline diagnostic</p>
          <h1>Preparing your placement test…</h1>
          <p className="page-description"><Loader2 className="spin" aria-hidden="true" size={16} /> Loading questions.</p>
        </section>
      </main>
    );
  }

  if (phase === "error") {
    return (
      <main className="setup-shell">
        <section className="setup-panel">
          <p className="tour-step-count">Baseline diagnostic</p>
          <h1>The diagnostic is unavailable right now</h1>
          <p className="page-description">You can go straight to your workspace and build evidence through completed missions instead.</p>
          <div className="setup-actions"><span /><button className="button button-primary" onClick={() => router.push("/dashboard")} type="button">Go to dashboard <ArrowRight size={16} /></button></div>
        </section>
      </main>
    );
  }

  if (phase === "result") {
    return (
      <main className="setup-shell">
        <section className="setup-panel diagnostic-panel" aria-labelledby="diagnostic-result-title">
          <p className="tour-step-count">Your skill-gap vector</p>
          <h1 id="diagnostic-result-title">Here is where you stand</h1>
          <p className="page-description">Your roadmap now targets the weakest areas first, in the order they build on each other.</p>
          <div className="gap-vector">
            {gapVector.map((entry) => (
              <div className="gap-row" key={entry.competencyId}>
                <div className="gap-row-head"><strong>{entry.label}</strong><span className={`gap-state ${entry.state}`}>{stateLabels[entry.state]}</span></div>
                <div className="gap-bar" role="img" aria-label={`${entry.label}: ${entry.score} of 100`}><span className={`gap-fill ${entry.state}`} style={{ width: `${entry.score}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="setup-actions"><span /><button className="button button-primary" onClick={() => router.push("/roadmap")} type="button">See my roadmap <ArrowRight size={16} /></button></div>
        </section>
      </main>
    );
  }

  const current = competencies[step];
  const isSubmitting = phase === "submitting";
  const isFinalStep = step === competencies.length - 1;

  return (
    <main className="setup-shell">
      <section className="setup-panel diagnostic-panel" aria-labelledby="diagnostic-title">
        <p className="tour-step-count">Baseline diagnostic · {step + 1} of {competencies.length}</p>
        <h1 id="diagnostic-title">{current.label}</h1>
        <p className="page-description">Answer what you can. Skipping a question just marks that area as a bigger gap.</p>

        <div className="diagnostic-questions">
          {current.mcq.map((question) => (
            <fieldset className="diagnostic-question" key={question.id}>
              <legend>{question.prompt}</legend>
              {question.options.map((option) => (
                <label className={`diagnostic-option ${mcq[question.id] === option.id ? "is-selected" : ""}`} key={option.id}>
                  <input
                    checked={mcq[question.id] === option.id}
                    name={question.id}
                    onChange={() => setMcq((current) => ({ ...current, [question.id]: option.id }))}
                    type="radio"
                    value={option.id}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </fieldset>
          ))}

          <label className="setup-field" htmlFor={current.open.id}>{current.open.prompt} <small>(optional)</small>
            <textarea
              id={current.open.id}
              onChange={(event) => setOpen((current) => ({ ...current, [event.target.id]: event.target.value }))}
              placeholder="A sentence or two is enough."
              rows={3}
              value={open[current.open.id] ?? ""}
            />
          </label>
        </div>

        {error ? <p className="inline-error" role="alert">{error}</p> : null}

        <div className="setup-actions">
          {step > 0 ? (
            <button className="button button-ghost" disabled={isSubmitting} onClick={() => setStep((current) => current - 1)} type="button"><ArrowLeft size={16} /> Back</button>
          ) : (
            <button className="button button-ghost" disabled={isSubmitting} onClick={() => submit(true)} type="button">Skip diagnostic</button>
          )}
          {isFinalStep ? (
            <button className="button button-primary" disabled={isSubmitting} onClick={() => submit(false)} type="button">{isSubmitting ? "Scoring…" : "Finish & build roadmap"} <Check size={16} /></button>
          ) : (
            <button className="button button-primary" disabled={isSubmitting} onClick={() => setStep((current) => Math.min(current + 1, competencies.length - 1))} type="button">Next area <ArrowRight size={16} /></button>
          )}
        </div>
      </section>
    </main>
  );
}
