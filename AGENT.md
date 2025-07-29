Five-Person Development Team Deployment Plan (AGENT.md)
This document assigns responsibilities to a five-person development team for improving and maintaining the Pixelate-MVP repository. Each agent has distinct tasks based on the deep-dive analysis of the codebase, including bug fixes, feature enhancements, testing, and deployment.

Overview
The project is a Node.js/Express application using Firebase for authentication, storage, and data, with EJS templates for the UI. Our analysis identified issues around test configuration, input validation, asynchronous upload logic, UI consistency, and testing coverage. The plan below distributes these tasks among five developers.

Agent 1 – Build & Repository Management
Fix test configuration: Remove the leading space in jest.config.js so that Jest loads /tests/setupEnv.js.

Script improvements: Add npm scripts for linting (eslint .), auditing (npm audit), starting the server (node index.js), and running tests. Update package.json with Node.js engine constraints.

Dependency & environment management: Integrate dotenv to load environment variables in development and ensure required keys (Firebase, CSRF, cookie secrets) are validated at startup.

Compile & run: After modifications, run npm install, npm run lint, npm test, and npm start to verify the build passes and the server starts without errors. Document any build or runtime issues.

Agent 2 – Authentication & Security
Input validation: Implement express-validator middleware for signup and login routes to enforce valid email formats and minimum password strength.

Session cookie settings: Always set httpOnly and SameSite=Lax cookie attributes; parameterize the Secure flag via an environment variable.

Account management features: Implement password reset and email verification flows using Firebase Auth.

Error handling: Centralize error responses for authentication failures to avoid exposing internal errors. Ensure CSRF errors return clear messages rather than generic 500 responses.

Testing: Write unit tests for the validation middleware and new account management routes to verify correct behaviour and error handling.

Agent 3 – Upload & Data Logic
Asynchronous uploads: Refactor post_upload and post_uploadMultiple handlers to use async/await consistently and wrap upload streams in Promise objects to wait for the upload to finish before sending responses.

Unique identifiers: Replace the current generateUniqueId (which uses Math.random) with a more secure crypto.randomBytes implementation.

Signed URL handling: Destructure the array returned by fileRef.getSignedUrl to obtain the signed URL directly.

Database updates: Batch updates to Firebase when updating hashtag counts and token allocations to avoid race conditions.

Configuration: Make the file size limit configurable via a MAX_UPLOAD_BYTES environment variable and validate file types.

Testing: Develop tests to verify correct EXIF extraction, price calculation, and concurrent uploads. Address any bugs discovered during testing.

Agent 4 – UI & Frontend Enhancements
Template refactoring: Review all EJS templates to escape user-provided data and ensure partials (header, footer, navigation) are used consistently.

Flash messages: Integrate connect-flash to provide users with feedback after actions such as sign-up, login, logout, and image upload.

Accessibility & responsiveness: Ensure all forms and buttons have proper labels, alt attributes, and ARIA tags. Use Bootstrap to maintain responsiveness across devices.

CSRF integration: Ensure client-side scripts include CSRF tokens from res.locals.cspNonce in AJAX requests.

Testing: Perform manual and automated UI testing to confirm pages render correctly, flash messages appear as expected, and no unescaped content leads to XSS vulnerabilities.

Agent 5 – Testing & Continuous Integration
Test suite expansion: Correct the path in jest.config.js and verify setupEnv.js loads during tests. Increase test coverage by adding tests for upload handlers, hashtag logic, validation failures, and concurrency scenarios.

CSV export tests: Add integration tests that confirm the CSV export route returns expected headers and content.

CI/CD pipeline: Create a GitHub Actions workflow in .github/workflows/ci.yml to run linting, tests, and security audits on each pull request.

Monitoring & reporting: Generate coverage reports and review failing tests. Work with other agents to diagnose and fix issues uncovered by the expanded test suite.

By following this plan, the five-person development team will systematically improve the Pixelate-MVP codebase, address known bugs, enhance security and user experience, and establish robust testing and deployment processes.
