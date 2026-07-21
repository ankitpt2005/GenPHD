"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { onboardingResultSchema } from "../lib/workspace/onboarding";
import { diagnosticQuestions, diagnosticResultSchema, type DiagnosticResult } from "../lib/diagnostic/baseline";

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

    window.localStorage.removeItem("genphd-onboarding-draft");
    window.sessionStorage.removeItem("genphd-active-brief");
    window.sessionStorage.removeItem("genphd-mission-status");
    window.sessionStorage.setItem("genphd-active-project", JSON.stringify(savedWorkspace.data.project));
    window.sessionStorage.setItem("genphd-roadmap", JSON.stringify({ milestones: savedWorkspace.data.milestones }));
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
            {step < questions.length - 1 ? <button className="button button-primary" type="submit">Continue <ArrowRight size={16} /></button> : <button className="button button-primary" disabled={isSaving} type="submit">{isSaving ? "Creating roadmap…" : "Create roadmap"} <Check size={16} /></button>}
          </div>
        </form>
      </section>
    </main>
  );
}

export function DiagnosticFlow() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function finish() {
    window.localStorage.setItem("genphd-diagnostic-complete", "true");
    router.push("/dashboard");
  }

  async function submit() {
    if (Object.keys(answers).length !== diagnosticQuestions.length) return setError("Choose one answer for each foundation before continuing.");
    setIsSaving(true); setError(null);
    const response = await fetch("/api/diagnostic", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) }).catch(() => null);
    const parsed = diagnosticResultSchema.safeParse(response ? await response.json().catch(() => null) : null);
    if (!response?.ok || !parsed.success) { setError("Your baseline could not be saved. Please retry."); setIsSaving(false); return; }
    setResult(parsed.data); window.sessionStorage.setItem("genphd-diagnostic", JSON.stringify(parsed.data)); setIsSaving(false);
  }

  return (
    <main className="setup-shell">
      <section className="setup-panel diagnostic-panel" aria-labelledby="diagnostic-title">
        <p className="tour-step-count">Baseline diagnostic · optional</p>
        <h1 id="diagnostic-title">Find the next skill your project needs.</h1>
        <p className="page-description">Six focused questions create a transparent baseline. This is not an exam; it keeps your next roadmap step appropriately scoped.</p>
        {result ? <><div className="diagnostic-result"><p className="eyebrow">Your baseline</p><h2>{result.summary}</h2>{result.scores.map((score) => <div className="skill-row" key={score.id}><span>{score.label}</span><strong>{score.state === "validated" ? "Validated" : "Emerging"}</strong></div>)}</div><div className="setup-actions"><button className="button button-primary" onClick={finish} type="button">Open my roadmap <ArrowRight size={16} /></button></div></> : <>
          <div className="diagnostic-questions">{diagnosticQuestions.map((question) => <fieldset className="setup-field" key={question.id}><legend>{question.label}</legend><p>{question.prompt}</p>{question.options.map((option, index) => <label className="diagnostic-option" key={option}><input checked={answers[question.id] === index} name={question.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))} type="radio" /> {option}</label>)}</fieldset>)}</div>
          {error ? <p className="inline-error" role="alert">{error}</p> : null}
          <div className="setup-actions"><button className="button button-ghost" onClick={finish} type="button">Skip for now</button><button className="button button-primary" disabled={isSaving} onClick={submit} type="button">{isSaving ? "Saving baseline…" : "Create my baseline"} <ArrowRight size={16} /></button></div>
        </>}
      </section>
    </main>
  );
}
