# SSW-SERA Implementation Workspace

This repository is transitioning from controlled architecture into implementation under SSW-AI-IRR-02.

Start with:

```bash
npm install
npm run check
npm run bootstrap
```

The bootstrap is deliberately non-transactional. It proves repository boundaries and control-path ordering only.

Authoritative specifications remain under `docs/` and machine contracts under `contracts/`.
