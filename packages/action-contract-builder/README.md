# @soulverse/action-contract-builder

Deterministic construction of validated Action Contracts from Resolved Intent objects.

## Current action family

- `payment.send`

## Safety rules

- material ambiguity returns BLOCKED_AMBIGUITY;
- no model output enters signing;
- builder cannot mark Trust Protocol or REV as passed;
- builder cannot approve an action;
- newly built actions are NOT_READY;
- material terms are normalized and bound to a domain-separated SHA-256 hash;
- output is validated through @soulverse/schema-validation.
