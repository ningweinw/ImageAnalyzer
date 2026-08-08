## Plan: Implement AI Image Analyzer MVP

Build an MVP that matches the updated requirements in [doc/user-stories.md](doc/user-stories.md) and [doc/architecture.md](doc/architecture.md): upload image, analyze with Azure OpenAI, render markdown result, package with Docker, and keep intentionally excluded areas out of scope.

**Steps**
1. Phase 1: Bootstrap frontend and backend foundations.
Dependency: none.
Parallelism: frontend and backend setup run in parallel.
Outcome: runnable React + Tailwind app and FastAPI service skeleton.

2. Phase 2: Implement backend analysis API.
Dependency: Phase 1 backend setup.
Parallelism: parallel with Phase 3 except integration points.
Outcome: API under /api, image validation (jpg/png, 10 MB), Azure OpenAI call, prompt enforcing required sections, stdout step/error logging, env-based config.

3. Phase 3: Implement frontend user flow.
Dependency: Phase 1 frontend setup.
Parallelism: parallel with Phase 2 until API wiring.
Outcome: upload control, 16:9 preview area with scrollbars and preserved ratio, analyze button, markdown result area, spinner + full interaction lock during request, clear error messaging.

4. Phase 4: Integrate frontend and backend.
Dependency: Phases 2 and 3.
Parallelism: blocked until both are complete.
Outcome: API client wiring, consistent loading/error states, end-to-end upload and analyze behavior.

5. Phase 5: Containerization and deploy readiness.
Dependency: Phase 4.
Parallelism: mostly sequential; Docker prep can start late in Phase 4.
Outcome: Dockerfile with full dependencies, container startup config, environment mapping for Azure Container Apps or AKS, managed identity assumption documented.

6. Phase 6: Requirement-level verification.
Dependency: Phase 5.
Parallelism: verification tasks can be shared across frontend/backend.
Outcome: manual verification evidence for happy path and error path, plus explicit confirmation of out-of-scope items.

**Relevant files**
- [doc/user-stories.md](doc/user-stories.md): source of UX flow, constraints, and interaction states.
- [doc/architecture.md](doc/architecture.md): source of stack, API path, logging, config, auth posture, and deployment direction.

**Verification**
1. Confirm upload flow: picker works, validation errors are clear, preview renders in fixed 16:9 area with scroll behavior.
2. Confirm analyze flow: spinner shows, all controls are disabled during processing, markdown blob renders below image with scrolling when needed.
3. Confirm error flow: clear message on format/size violations and analysis failures, with no automatic retry behavior.
4. Confirm backend contract behavior under /api and prompt output contains all required sections semantically.
5. Confirm Docker build/run succeeds with Azure endpoint and model deployment env values.
6. Confirm observability requirements: operation and error logs go to stdout.

**Decisions**
- Included scope: single-image analyze workflow, frontend/backend integration, containerized deployment readiness.
- Excluded scope by current docs: authentication, advanced security controls, privacy/compliance controls, NFR targets, automated testing.
- API request/response exact shape remains an implementation design choice constrained by user story behavior and /api path requirement.

**Further considerations**
1. Endpoint design choice.
Option A: single analyze endpoint receiving image and returning result.
Option B: separate upload and analyze endpoints.
Recommendation: Option A for MVP simplicity.

2. Deployment target choice.
Option A: Azure Container Apps.
Option B: AKS.
Recommendation: Option A for faster delivery and lower ops overhead.

3. Analysis output strategy.
Option A: backend returns markdown text directly.
Option B: backend returns structured fields, frontend formats markdown.
Recommendation: Option A to match current text-blob requirement with minimal transformation.