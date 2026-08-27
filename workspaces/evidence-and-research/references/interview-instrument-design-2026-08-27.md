# AQOON first-interview instrument design — 27 Aug 2026

Purpose: design a fast operational first interview that simultaneously supports case matching, deep research and aggregate programme/funder evidence.

## External design principles reviewed

Primary/current references reviewed on 27 Aug 2026:
- CDC Program Evaluation Framework (2024): evaluation questions should be limited to questions that are useful, timely and tied to intended decisions; distinguish process/reach/barrier questions from outcome questions; define indicators and data sources before collection.
- SurveyMonkey survey logic guidance: conditional/skip logic reduces irrelevant questions, respondent burden and random/noisy answers.
- Qualtrics skip/branch logic guidance: route people forward according to their answers rather than showing every question to everyone.
- RE-AIM implementation/evaluation literature: keep denominators and unit of analysis explicit; reach, implementation and outcomes are different constructs; denominator ambiguity weakens claims.
- Questionnaire-development literature: pre-test questions with real users, look for confusion/misinterpretation and refine wording/response options before treating a measure as stable.

## AQOON implementation decision

Do **not** use one giant questionnaire where every caller answers every programme question. Use:

1. route-specific matching questions;
2. a fixed universal evidence baseline;
3. short life-stage gates;
4. conditional modules for work, daycare, school/hobbies and current research questions;
5. outcome follow-up later.

This allows statements such as:
- “Among interviewed people who were looking for work, X/Y did not have active job search.”
- “Among Vantaa families with a child in grades 1–9, X/Y had not heard of Harrastusten Vantaa.”
- “Among households with a daycare-age child, X/Y did not understand private daycare as a realistic option.”

Do not use all interviewees as the denominator when the question was relevant only to a subgroup.

## Stable constructs

Every interview should support these aggregate constructs:
- AQOON awareness before contact;
- awareness of the entry service/programme;
- ability to self-navigate;
- barriers before action;
- household/life-stage gates;
- additional needs discovered;
- return intent;
- relevant-update permission;
- outcome-follow-up permission.

Conditional constructs:
- work: active job search, plan status, awareness of support routes;
- daycare: private-daycare awareness, upcoming need, application navigation;
- Vantaa hobbies: awareness, possible child need, next-round reminder;
- school: possible support/Wilma need.

## Data-quality rules

- “Heard of it” is not the same as “understood it.”
- Intent is not an outcome.
- Multi-select must be reserved for genuinely coexisting answers.
- Exclusive answers such as “none” must not coexist with positive selections.
- Hidden/irrelevant branch answers must not be saved.
- Keep `Not sure` where it is a legitimate response.
- Never infer an answer from the caller’s demographic/profile data.
- Do not lead a respondent into claiming a need simply because AQOON can help with it.
- New rotating questions require a new stable field ID when meaning changes.
- Pre-test new wording in a handful of interviews and revise if repeated explanation is required.

## Operational target

The universal + conditional evidence layer should normally add about 1–3 minutes, not turn the help call into a research interview. The presenting problem is solved first; proof questions are woven into the conversation at the end.
