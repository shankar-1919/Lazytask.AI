import { AIServiceSettings, BreakdownResult, Granularity, Priority, TaskBreakdownDraft } from '../types';

export interface ITaskBreakdownProvider {
  breakdownTask(
    title: string,
    priority: Priority,
    availableMinutes: number,
    granularity: Granularity,
    subject?: string,
    notes?: string
  ): Promise<BreakdownResult>;
}

class DemoHeuristicProvider implements ITaskBreakdownProvider {
  async breakdownTask(
    title: string,
    priority: Priority,
    availableMinutes: number,
    granularity: Granularity,
    subject?: string,
    notes?: string
  ): Promise<BreakdownResult> {
    await new Promise((resolve) => setTimeout(resolve, 450));

    const lower = (title + ' ' + (subject || '') + ' ' + (notes || '')).toLowerCase();
    const isMicro = granularity === 'micro';

    let steps: TaskBreakdownDraft[] = [];
    let encouragement = 'The hardest part is simply sitting down. Take it one step at a time.';

    if (
      lower.includes('essay') ||
      lower.includes('paper') ||
      lower.includes('writing') ||
      lower.includes('draft') ||
      lower.includes('thesis')
    ) {
      encouragement = "Don't aim for great writing on step one. Just aim for words on the page.";
      if (isMicro) {
        steps = [
          { title: 'Open a blank doc and format title & heading', estimatedMinutes: 5, tip: 'Literally just set up the blank document and font.' },
          { title: 'Write down 3 messy ideas or bullet points', estimatedMinutes: 10, tip: 'Zero filter allowed; spelling and grammar do not matter yet.' },
          { title: 'Find 2 reliable references or articles', estimatedMinutes: 15, tip: 'Bookmark them; you only need two to get traction.' },
          { title: 'Draft a 3-sentence thesis statement', estimatedMinutes: 10, tip: 'Keep it direct and simple.' },
          { title: 'Write an unpolished first paragraph', estimatedMinutes: 15, tip: 'Expect it to be rough. Rough is better than empty.' },
          { title: 'Outline topic sentences for body paragraphs', estimatedMinutes: 15, tip: 'Just one sentence per paragraph.' },
          { title: 'Quick 5-minute proofread of what you wrote', estimatedMinutes: 5, tip: 'Read it out loud to catch awkward phrasing.' },
        ];
      } else {
        steps = [
          { title: 'Analyze prompt requirements & create outline', estimatedMinutes: 15, tip: 'Highlight required word count and sources.' },
          { title: 'Find and skim 3 relevant sources for key quotes', estimatedMinutes: 25, tip: 'Copy quotes into your notes doc with citations.' },
          { title: 'Draft rough introduction & thesis statement', estimatedMinutes: 20, tip: 'Do not edit while drafting. Keep forward momentum.' },
          { title: 'Write Body Section 1 & Section 2 arguments', estimatedMinutes: 35, tip: 'Use evidence gathered in step 2.' },
          { title: 'Draft Conclusion & assemble Works Cited', estimatedMinutes: 20, tip: 'Summarize your core discovery.' },
        ];
      }
    } else if (
      lower.includes('math') ||
      lower.includes('calc') ||
      lower.includes('algebra') ||
      lower.includes('physics') ||
      lower.includes('chemistry') ||
      lower.includes('problem') ||
      lower.includes('pset') ||
      lower.includes('homework')
    ) {
      encouragement = 'Focus only on the single easiest problem first to build confidence.';
      if (isMicro) {
        steps = [
          { title: 'Clear desk & take out textbook, notebook, and calculator', estimatedMinutes: 5, tip: 'A tidy desk cuts mental friction in half.' },
          { title: 'Review lecture formula sheet or reference notes', estimatedMinutes: 10, tip: 'Keep formulas open next to you.' },
          { title: 'Pick the simplest problem and write given variables', estimatedMinutes: 10, tip: 'Starting with an easy win gets the momentum going.' },
          { title: 'Solve problem 1 and verify units', estimatedMinutes: 15, tip: 'Confirm your units match.' },
          { title: 'Attempt problem 2: diagram the scenario', estimatedMinutes: 15, tip: 'Draw a picture if stuck.' },
          { title: 'Check answers with key or study notes', estimatedMinutes: 10, tip: 'Mark any question that needs teacher office hours.' },
        ];
      } else {
        steps = [
          { title: 'Review key formulas and relevant lecture examples', estimatedMinutes: 15, tip: 'Keep example problems side-by-side.' },
          { title: 'Complete first batch of basic practice problems', estimatedMinutes: 30, tip: 'Focus on setting up equations properly.' },
          { title: 'Tackle the 2 harder or multi-step word problems', estimatedMinutes: 35, tip: 'Break each complex problem into sub-equations.' },
          { title: 'Verify final calculations and box answers', estimatedMinutes: 15, tip: 'Double check units, negative signs, and decimals.' },
        ];
      }
    } else if (
      lower.includes('exam') ||
      lower.includes('test') ||
      lower.includes('midterm') ||
      lower.includes('final') ||
      lower.includes('study') ||
      lower.includes('quiz')
    ) {
      encouragement = 'Active recall beats passive reading every time. Test yourself early.';
      if (isMicro) {
        steps = [
          { title: 'Locate exam study guide or syllabus learning goals', estimatedMinutes: 5, tip: 'Identify the top 3 high-weight topics.' },
          { title: 'Brain dump everything you remember on blank paper', estimatedMinutes: 10, tip: 'Seeing what you know proves you are not starting from zero.' },
          { title: 'Review notes on your weakest topic only', estimatedMinutes: 15, tip: 'Do not re-read what you already know.' },
          { title: 'Do 5 active recall flashcards or practice questions', estimatedMinutes: 15, tip: 'Close notes before answering.' },
          { title: 'Take a brief stretch and write 2 questions to ask', estimatedMinutes: 5, tip: 'Hydrate and reset your posture.' },
          { title: 'Review 5 more practice questions', estimatedMinutes: 15, tip: 'Explain the solution out loud.' },
        ];
      } else {
        steps = [
          { title: 'Scope the exam topics & highlight priority weak spots', estimatedMinutes: 15, tip: 'Group topics into High / Med / Low mastery.' },
          { title: 'Create summary cheat sheet or active recall cards', estimatedMinutes: 30, tip: 'Condense ideas into diagrams and bullet lists.' },
          { title: 'Complete timed practice test section without notes', estimatedMinutes: 35, tip: 'Simulate real exam conditions.' },
          { title: 'Review wrong answers and annotate correct solutions', estimatedMinutes: 20, tip: 'Mistakes are the highest-yield study material.' },
        ];
      }
    } else if (
      lower.includes('read') ||
      lower.includes('chapter') ||
      lower.includes('book') ||
      lower.includes('article')
    ) {
      encouragement = 'Skim first, then dive in. You do not need to absorb every syllable in pass one.';
      steps = [
        { title: 'Inspect table of contents, headers, and chapter summary', estimatedMinutes: 10, tip: 'Gives your brain a mental map before diving in.' },
        { title: 'Read the first third of assigned pages with notes', estimatedMinutes: isMicro ? 15 : 25, tip: 'Only note 1 key takeaway per section.' },
        { title: 'Jot down 2 bullet points summarizing the first part', estimatedMinutes: 5, tip: 'In your own words, not verbatim.' },
        { title: 'Read the next section of the assigned material', estimatedMinutes: isMicro ? 15 : 25, tip: 'Stay focused on core concepts.' },
        { title: 'Answer chapter reflection questions or review main ideas', estimatedMinutes: 15, tip: 'Formulate one thought you could bring to class.' },
      ];
    } else if (
      lower.includes('presentation') ||
      lower.includes('slide') ||
      lower.includes('project') ||
      lower.includes('speech')
    ) {
      encouragement = 'Start with the story structure before opening slide software.';
      steps = [
        { title: 'Outline the 3 main takeaways on paper', estimatedMinutes: 10, tip: 'What should the audience remember 1 week from now?' },
        { title: 'Create slide deck structure with title headers only', estimatedMinutes: 15, tip: 'Set up slides for Intro, Problem, Solution, Evidence, Summary.' },
        { title: 'Add key bullet points and data to body slides', estimatedMinutes: 25, tip: 'Less text per slide is better.' },
        { title: 'Add visuals or diagrams to support the points', estimatedMinutes: 15, tip: 'Use clean charts or simple illustrations.' },
        { title: 'Do one rehearsal out loud with a timer', estimatedMinutes: 10, tip: 'Speaking out loud reveals what needs smoothing.' },
      ];
    } else {
      encouragement = 'Break the inertia. Doing 10 minutes today is infinitely better than zero.';
      if (isMicro) {
        steps = [
          { title: `Gather materials and open file for: "${title.slice(0, 30)}"`, estimatedMinutes: 5, tip: 'Set phone aside to minimize friction.' },
          { title: 'Read through assignment instructions carefully', estimatedMinutes: 10, tip: 'Clarify what "done" actually looks like.' },
          { title: 'Complete the first small sub-part or outline', estimatedMinutes: 15, tip: 'Keep the pace gentle.' },
          { title: 'Work through the main portion for 20 focused minutes', estimatedMinutes: 20, tip: 'Focus on progress over perfection.' },
          { title: 'Review your work and confirm formatting criteria', estimatedMinutes: 10, tip: 'Check font, name, date, and export format.' },
        ];
      } else {
        steps = [
          { title: `Clarify requirements & set up workspace for "${title.slice(0, 30)}"`, estimatedMinutes: 15, tip: 'Define the minimum viable deliverable.' },
          { title: 'Draft initial outline or start core phase 1', estimatedMinutes: 25, tip: 'Focus purely on progress, not perfection.' },
          { title: 'Execute main content / calculation / writing', estimatedMinutes: 35, tip: 'Work uninterrupted for one Pomodoro block.' },
          { title: 'Final review, polish, and save/submit', estimatedMinutes: 15, tip: 'Double check submission link or folder.' },
        ];
      }
    }

    if (availableMinutes > 0 && availableMinutes < 60) {
      const totalEstimated = steps.reduce((acc, s) => acc + s.estimatedMinutes, 0);
      if (totalEstimated > availableMinutes) {
        const scale = availableMinutes / totalEstimated;
        steps = steps.map((s) => ({
          ...s,
          estimatedMinutes: Math.max(5, Math.round((s.estimatedMinutes * scale) / 5) * 5),
        }));
      }
    }

    return {
      subtasks: steps,
      encouragement,
      source: 'demo-heuristic',
    };
  }
}

class OpenWeightLLMProvider implements ITaskBreakdownProvider {
  private endpointUrl: string;
  private modelName: string;
  private fallback: DemoHeuristicProvider;

  constructor(endpointUrl: string, modelName: string) {
    this.endpointUrl = endpointUrl || 'http://localhost:11434/api/generate';
    this.modelName = modelName || 'llama3.2';
    this.fallback = new DemoHeuristicProvider();
  }

  async breakdownTask(
    title: string,
    priority: Priority,
    availableMinutes: number,
    granularity: Granularity,
    subject?: string,
    notes?: string
  ): Promise<BreakdownResult> {
    try {
      const prompt = `You are LazyTask AI, an expert executive dysfunction coach for stressed students.
Decompose this student task into ${granularity === 'micro' ? '5 to 7 bite-sized micro-steps (5-15 mins each)' : '4 to 6 actionable steps (15-30 mins each)'}.
Task: "${title}"
Subject: "${subject || 'General'}"
Priority: "${priority}"
Available time: ${availableMinutes} minutes
Notes: "${notes || 'None'}"

Respond ONLY with valid JSON in this exact structure:
{
  "subtasks": [
    { "title": "Step description", "estimatedMinutes": 10, "tip": "Short supportive tip to lower friction" }
  ],
  "encouragement": "One short calming sentence for a stressed student"
}`;

      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM endpoint returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.response || data.text || (data.choices && data.choices[0]?.message?.content);
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed.subtasks) && parsed.subtasks.length > 0) {
        return {
          subtasks: parsed.subtasks.map((s: any) => ({
            title: String(s.title || 'Action step'),
            estimatedMinutes: Number(s.estimatedMinutes) || 10,
            tip: s.tip ? String(s.tip) : undefined,
          })),
          encouragement: parsed.encouragement || 'Take it one gentle step at a time.',
          source: 'open-weight-llm',
        };
      }
      throw new Error('Unexpected JSON format from local model');
    } catch (err) {
      console.warn('Open-weight LLM unavailable, using smart demo heuristic fallback:', err);
      return this.fallback.breakdownTask(title, priority, availableMinutes, granularity, subject, notes);
    }
  }
}

export async function generateTaskBreakdown(
  title: string,
  priority: Priority,
  availableMinutes: number,
  granularity: Granularity = 'standard',
  subject?: string,
  notes?: string,
  settings?: AIServiceSettings
): Promise<BreakdownResult> {
  if (settings?.mode === 'open-weight-llm' && settings.endpointUrl) {
    const provider = new OpenWeightLLMProvider(settings.endpointUrl, settings.modelName);
    return provider.breakdownTask(title, priority, availableMinutes, granularity, subject, notes);
  }

  const demoProvider = new DemoHeuristicProvider();
  return demoProvider.breakdownTask(title, priority, availableMinutes, granularity, subject, notes);
}
