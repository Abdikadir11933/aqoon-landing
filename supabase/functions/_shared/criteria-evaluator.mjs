export function hasValue(value) {
  if (Array.isArray(value)) return value.some(hasValue);
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function canonical(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\+/g, " and ")
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function ageFrom(value, now = new Date()) {
  const raw = String(value ?? "").trim();
  if (/^\d{1,2}$/.test(raw)) return Number(raw);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const born = new Date(raw + "T00:00:00Z");
    if (Number.isNaN(born.getTime()) || born > now) return null;
    let age = now.getUTCFullYear() - born.getUTCFullYear();
    const beforeBirthday =
      now.getUTCMonth() < born.getUTCMonth() ||
      (now.getUTCMonth() === born.getUTCMonth() &&
        now.getUTCDate() < born.getUTCDate());
    if (beforeBirthday) age--;
    return age;
  }
  return null;
}

function semantic(fieldKey, value) {
  const v = canonical(value);
  if (fieldKey === "municipal_ece_status") {
    if (v === "yes") return "attending";
    if (v === "no") return "not_attending";
  }
  if (fieldKey === "same_child_parental_or_private_daycare_allowance") {
    if (v === "yes") return "paid_for_same_child";
    if (v === "no") return "not_paid_for_same_child";
  }
  if (fieldKey === "earnings_related_status") {
    if (v === "yes") return "currently_receiving";
    if (v === "no") return "not_currently_receiving";
  }
  return v;
}

function ageExpectation(fieldKey, value, expected, now) {
  if (!["child_age", "child_age_or_birth_date", "youngest_child_age", "school_age_or_grade"].includes(fieldKey)) return null;
  const age = ageFrom(value, now);
  if (age === null) {
    const v = canonical(value);
    if (expected === "under_3" && v === "under_3") return true;
    if (expected === "under_3" && ["3_or_older", "3_older"].includes(v)) return false;
    if (expected === "under_17" && v === "under_17") return true;
    return null;
  }
  if (expected === "under_3") return age < 3;
  if (expected === "under_17") return age < 17;
  if (expected === "age_7_to_17") return age >= 7 && age <= 17;
  if (expected === "turning_five_this_year") {
    const raw = String(value ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return new Date(raw + "T00:00:00Z").getUTCFullYear() === now.getUTCFullYear() - 5;
    }
    return age === 5;
  }
  return null;
}

function result(criterion, outcome, reason, value) {
  return {
    label: criterion.label,
    type: criterion.criterion_type,
    field_key: criterion.field_key,
    outcome,
    reason,
    value,
  };
}

export function evaluateCriterion(criterion, rawValue, now = new Date()) {
  const rule = criterion.rule_json && typeof criterion.rule_json === "object"
    ? criterion.rule_json
    : {};
  const fieldKey = String(criterion.field_key || "");
  if (!hasValue(rawValue)) return result(criterion, "missing", "Required fact is not recorded.", null);

  const value = semantic(fieldKey, rawValue);
  const expected = rule.expected ?? rule.equals;
  if (expected !== undefined) {
    const expectedValue = canonical(expected);
    const ageMatch = ageExpectation(fieldKey, rawValue, expectedValue, now);
    const matches = ageMatch === null ? value === expectedValue : ageMatch;
    return result(
      criterion,
      matches ? "met" : "conflict",
      matches ? "Recorded fact matches the verified rule." : "Recorded fact conflicts with the verified rule.",
      rawValue,
    );
  }

  if (Array.isArray(rule.expected_any)) {
    const matches = rule.expected_any.map(canonical).includes(value);
    return result(
      criterion,
      matches ? "met" : "conflict",
      matches ? "Recorded fact matches an allowed verified value." : "Recorded fact is outside the verified allowed values.",
      rawValue,
    );
  }

  if (rule.must_not_be !== undefined) {
    const conflicts = value === canonical(rule.must_not_be);
    return result(
      criterion,
      conflicts ? "conflict" : "met",
      conflicts ? "Recorded fact matches a verified exclusion." : "Recorded fact does not match the verified exclusion.",
      rawValue,
    );
  }

  if (Array.isArray(rule.eligible_route_when)) {
    if (fieldKey === "earnings_related_status" && value === "currently_receiving") {
      return result(criterion, "conflict", "Current earnings-related allowance conflicts with this route.", rawValue);
    }
    const matches = rule.eligible_route_when.map(canonical).includes(value);
    return result(
      criterion,
      matches ? "met" : "needs_confirmation",
      matches ? "Recorded status is one of the verified route states." : "The recorded answer is not specific enough to prove an allowed route state.",
      rawValue,
    );
  }

  if (rule.must_confirm !== undefined) {
    if (typeof rule.must_confirm === "string") {
      const ageMatch = ageExpectation(fieldKey, rawValue, canonical(rule.must_confirm), now);
      if (ageMatch === false) return result(criterion, "conflict", "Recorded age conflicts with the verified range.", rawValue);
    }
    return result(criterion, "needs_confirmation", "Operator, provider, or authority confirmation is still required.", rawValue);
  }

  if (criterion.criterion_type === "authority_confirmation") {
    return result(criterion, "needs_confirmation", "This decision belongs to the provider or authority.", rawValue);
  }

  if (rule.required === true) {
    return result(criterion, "met", "The required fact is recorded.", rawValue);
  }

  return result(criterion, "needs_confirmation", "The verified rule does not support an automatic conclusion.", rawValue);
}

export function evaluateRouteCriteria(criteria, valueFor, now = new Date()) {
  const results = (criteria || []).map((criterion) =>
    evaluateCriterion(criterion, valueFor(criterion.field_key), now)
  );
  return {
    results,
    missing: [...new Set(results.filter((x) => x.outcome === "missing").map((x) => x.field_key).filter(Boolean))],
    conflicts: results.filter((x) => x.outcome === "conflict").map((x) => x.label || x.field_key),
    needsConfirmation: results.filter((x) => x.outcome === "needs_confirmation").map((x) => x.label || x.field_key),
  };
}
