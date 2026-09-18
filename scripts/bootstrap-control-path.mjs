const dryRun = process.env.SSW_DRY_RUN !== "false";
if (!dryRun) throw new Error("IMP-01 bootstrap refuses non-dry-run execution.");

const stages = [
  "intent.fixture",
  "action-contract.build",
  "authority.check",
  "risk.classify",
  "policy.evaluate",
  "device-runtime.check",
  "approval-or-mandate.check",
  "trust.stub",
  "rev.stub",
  "signing.dry-run",
  "execution.stub",
  "sael.evidence"
];

const trace = {
  actionId: "bootstrap-action-001",
  holderDid: "did:soul:bootstrap-holder",
  seraDid: "did:soul:agent:bootstrap-sera",
  authorityClass: "A2",
  riskClass: "R2",
  dryRun: true,
  stages: []
};

for (const stage of stages) {
  trace.stages.push({ stage, status: "PASS_BOOTSTRAP_ONLY" });
}

console.log(JSON.stringify(trace, null, 2));
