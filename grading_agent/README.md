# ChatKit Starter Template

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

This repository is the simplest way to bootstrap a [ChatKit](http://openai.github.io/chatkit-js/) application. It ships with a minimal Next.js UI, the ChatKit web component, and a ready-to-use session endpoint so you can experiment with OpenAI-hosted workflows built using [Agent Builder](https://platform.openai.com/agent-builder).

## What You Get

- Next.js app with `<openai-chatkit>` web component and theming controls
- API endpoint for creating a session at [`app/api/create-session/route.ts`](app/api/create-session/route.ts)
- Config file for starter prompts, theme, placeholder text, and greeting message
- **Intelligent Grading Workflow** - Automated assignment evaluation system with multi-agent architecture

---

## 🎓 Grading Workflow System

This project includes a sophisticated multi-agent grading system built with OpenAI Agents SDK that automates the evaluation of student assignments.

### Features

The grading workflow consists of three specialized agents:

#### 1. **Grading Agent**
Evaluates student submissions against assignment criteria and produces structured numeric grades with detailed per-criterion feedback.

**Key Capabilities:**
- Systematic evaluation workflow (5-step process)
- Criterion-by-criterion scoring
- Structured JSON output with individual grades and remarks
- Reasoning-enhanced evaluation with GPT-5-mini

#### 2. **Feedback Agent**
Generates constructive, actionable feedback for students based on their performance.

**Key Capabilities:**
- Balanced feedback (strengths + areas for improvement)
- Actionable suggestions for student growth
- No numeric scores in feedback (focuses on learning)
- Personalized commentary tied to specific submission details

#### 3. **Submission Reminder Agent**
Handles cases where students haven't submitted their work yet.

**Key Capabilities:**
- Polite, encouraging reminder messages
- Non-threatening tone
- Clear call-to-action for file upload

### Workflow Logic

The system intelligently routes requests based on submission status:

```typescript
if (state.student_submission == null) {
  // Route to Submission Reminder Agent
  return polite reminder message;
} else {
  // Route to Grading Agent → Feedback Agent
  return comprehensive evaluation + feedback;
}
```

### Assignment Details

The included assignment: **"Find One Real Agentic AI Use Case"**

**Grading Criteria (10 points total):**
- Real, documented use case accuracy (2 pts)
- Clarity of explanation (2 pts)
- Research depth (2 pts)
- Source/evidence quality (1 pt)
- Presentation & grammar (1 pt)
- Public LinkedIn post requirement (1 pt)
- Bonus: Video explanation (+2 pts)

**Feedback Framework:**
- ✨ Strengths identification
- ⚙️ Areas for improvement
- 🚀 Actionable next steps

### File Structure

```
├── grading-workflow.ts          # Main workflow implementation
│   ├── GradingAgent            # Evaluates and scores submissions
│   ├── FeedbackAgent           # Generates student feedback
│   └── SubmissionReminderAgent # Handles missing submissions
```

### Example Usage

The workflow is invoked via the `runWorkflow` function:

```typescript
const result = await runWorkflow({
  input_as_text: "Student's submission text or request"
});
```

**Outputs:**
- If no submission: Friendly reminder message
- If submission exists: Complete grade breakdown + personalized feedback

### Agent Configuration

All agents use:
- Model: `gpt-5-mini`
- Reasoning effort: `minimal` to `low`
- Summary mode: `auto`
- Store: `true` (for tracing and debugging)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy the example file and fill in the required values:

```bash
cp .env.example .env.local
```

You can get your workflow id from the [Agent Builder](https://platform.openai.com/agent-builder) interface, after clicking "Publish":

<img src="./public/docs/workflow.jpg" width=500 />

You can get your OpenAI API key from the [OpenAI API Keys](https://platform.openai.com/api-keys) page.

### 3. Configure ChatKit credentials

Update `.env.local` with the variables that match your setup.

- `OPENAI_API_KEY` — This must be an API key created **within the same org & project as your Agent Builder**. If you already have a different `OPENAI_API_KEY` env variable set in your terminal session, that one will take precedence over the key in `.env.local` one (this is how a Next.js app works). So, **please run `unset OPENAI_API_KEY` (`set OPENAI_API_KEY=` for Windows OS) beforehand**.
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` — This is the ID of the workflow you created in [Agent Builder](https://platform.openai.com/agent-builder), which starts with `wf_...`
- (optional) `CHATKIT_API_BASE` - This is a customizable base URL for the ChatKit API endpoint

> Note: if your workflow is using a model requiring organization verification, such as GPT-5, make sure you verify your organization first. Visit your [organization settings](https://platform.openai.com/settings/organization/general) and click on "Verify Organization".

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` and start chatting. Use the prompts on the start screen to verify your workflow connection, then customize the UI or prompt list in [`lib/config.ts`](lib/config.ts) and [`components/ChatKitPanel.tsx`](components/ChatKitPanel.tsx).

### 5. Deploy your app

```bash
npm run build
```

Before deploying your app, you need to verify the domain by adding it to the [Domain allowlist](https://platform.openai.com/settings/organization/security/domain-allowlist) on your dashboard.

## Customization Tips

- Adjust starter prompts, greeting text, [chatkit theme](https://chatkit.studio/playground), and placeholder copy in [`lib/config.ts`](lib/config.ts).
- Update the event handlers inside [`components/ChatKitPanel.tsx`](components/ChatKitPanel.tsx) to integrate with your product analytics or storage.
- **Customize grading criteria** - Modify the `grading_criteria` and `feedback_framework` in the workflow state to match your assignment requirements.
- **Adjust agent instructions** - Fine-tune the evaluation workflow steps in each agent's instruction function.

## Architecture Highlights

### Multi-Agent System
The grading workflow demonstrates a robust multi-agent pattern:
- **Sequential execution** - Grading Agent → Feedback Agent
- **Conditional routing** - Submission Reminder for missing work
- **Shared context** - All agents access assignment materials and rubrics
- **Structured outputs** - Zod schema validation for type safety

### Tracing & Observability
All workflow runs are traced using `withTrace` for debugging and performance monitoring:
```typescript
await withTrace("Grading system ps", async () => {
  // workflow execution
});
```

## References

- [ChatKit JavaScript Library](http://openai.github.io/chatkit-js/)
- [Advanced Self-Hosting Examples](https://github.com/openai/openai-chatkit-advanced-samples)
- [OpenAI Agents SDK Documentation](https://github.com/openai/openai-agents-js)
- [Zod Schema Validation](https://zod.dev/)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ using OpenAI Agents SDK and Next.js**