# Skill: Content Accuracy Audit

## Purpose

Cross-check AI assistant responses against the user's actual health profile to detect factual inaccuracies, wrong units, missed vulnerabilities, directive violations, and timing errors. The core self-improvement capability that makes a health AI unbeatable.

## When to Run

- Nightly via cron (automated, after daily-summary)
- Ad-hoc via `npm run audit:vigo` (global) or `npm run audit:vigo:user -- --id <user-id>` (single user)
- On demand when investigating quality issues for specific users

## Inputs

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--scope` | `user` | `user` (single), `users` (multiple), `random` (N random), or `all` |
| `--id <user-id>` | none | Required when scope=user |
| `--ids <id1,id2,...>` | none | Required when scope=users |
| `--count <N>` | `5` | Number of random users when scope=random |
| `--days <N>` | `1` | How many days back to analyze |
| `--sample <N>` | `10` | Max substantive messages to audit per user |
| `--output` | `summary` | `summary` (human-readable) or `json` (structured) |

## Accuracy Checks

For each substantive assistant message, verify against the user's current profile:

| Check | What It Verifies |
|-------|-----------------|
| **Medication accuracy** | Did Vigo reference medications the user is actually on? Miss any? |
| **Condition awareness** | Did Vigo account for known conditions and vulnerabilities? |
| **Unit correctness** | Did Vigo use the user's preferred unit system consistently? |
| **Directive adherence** | Did Vigo follow the user's standing directives and preferences? |
| **Dietary respect** | Did Vigo respect dietary restrictions in food/supplement advice? |
| **Temporal accuracy** | Did time-sensitive advice align with the user's timezone? |
| **Vulnerability safety** | Did Vigo avoid risky advice for known vulnerable areas? |
| **Factual consistency** | Do referenced height, weight, age, activity level match the profile? |

## Outputs

### Per-User Accuracy Report

```json
{
  "user_id": "...",
  "period": { "start": "...", "end": "..." },
  "messages_audited": 8,
  "accuracy_score": 0.92,
  "findings": [
    {
      "type": "medication_miss",
      "severity": "high",
      "message_id": "...",
      "message_excerpt": "Consider adding magnesium...",
      "expected": "User already takes Magnesium 400mg daily",
      "profile_field": "medications_supplements",
      "recommendation": "Check active medications before supplement suggestions"
    }
  ],
  "by_category": {
    "medications": { "checked": 3, "accurate": 2, "score": 0.67 },
    "units": { "checked": 8, "accurate": 8, "score": 1.0 },
    "directives": { "checked": 5, "accurate": 5, "score": 1.0 },
    "vulnerabilities": { "checked": 2, "accurate": 2, "score": 1.0 }
  }
}
```

### Global Summary

```json
{
  "period": { "start": "...", "end": "..." },
  "users_audited": 15,
  "overall_accuracy": 0.94,
  "worst_categories": ["medications", "temporal"],
  "users_below_90": ["user-id-1"],
  "prompt_suggestions": [
    {
      "section": "## Medication Safety",
      "suggestion": "Always cross-reference active medications before suggesting supplements",
      "evidence_count": 4,
      "confidence": "high"
    }
  ]
}
```

## Invocation

```bash
# Single user
bash .agent/skills/global/content-accuracy-audit/content-accuracy-audit.sh --scope user --id <user-id>

# Multiple users
bash .agent/skills/global/content-accuracy-audit/content-accuracy-audit.sh --scope users --ids <id1>,<id2>

# Random 5 users (fast spot-check)
bash .agent/skills/global/content-accuracy-audit/content-accuracy-audit.sh --scope random --count 5

# Random 10 users over last 3 days
bash .agent/skills/global/content-accuracy-audit/content-accuracy-audit.sh --scope random --count 10 --days 3

# All active users
bash .agent/skills/global/content-accuracy-audit/content-accuracy-audit.sh --scope all --days 1

# JSON output for further processing
bash .agent/skills/global/content-accuracy-audit/content-accuracy-audit.sh --scope all --output json
```
