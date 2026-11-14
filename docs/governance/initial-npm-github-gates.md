# Read-only GitHub staging gates

This unwired verifier supplies only the GitHub portion of a future staging observation. It cannot
grant npm authority and is not invoked by the hosted preflight.

The verifier binds the approved commit and run attempt to GitHub-hosted runner context, the public
repository and owner IDs, the in-progress manual run, current protected main, and `npm-release` with
owner review, disabled admin bypass, and a main-only branch policy. It requires strict branch
protection and a successful required check from the GitHub Actions app and the same check suite as
the exact commit's main-push quality workflow. It reads the branch head again after collecting that
evidence.

GitHub's
[run review history](https://docs.github.com/en/rest/actions/workflow-runs#get-the-review-history-for-a-workflow-run)
is run-scoped. For a future staging execution, require exactly one review for the release
environment: an approval from the pinned owner with the exact comment
`wayglass-staging-approval-sha256:<canonical approval digest>`. The record itself includes the exact
run and attempt. A plain approval or review from another attempt is insufficient. Ambiguous history,
including multiple reviews for this environment, stops the verifier; this slice does not add a retry
path. No approval was submitted to test the verifier.

The wrapper must provide genuine runner context and a separately reviewed GitHub read credential.
[Branch protection readback](https://docs.github.com/en/rest/branches/branch-protection#get-branch-protection)
requires repository Administration read; this change does not grant it or assume the default
workflow token has it. API requests are GET-only, scoped to the fixed GitHub host/repository,
redirect-rejecting, collectively time-bounded, and response-size-bounded. Permission failures,
partial lists, missing fields and ambiguous data all fail closed without logging raw responses.

The returned evidence omits npm account, package collision, and advisory decisions. Those checks,
durable remote journal retention, signer policy and wrapper wiring remain separate work. The expired
advisory is not refreshed here.
