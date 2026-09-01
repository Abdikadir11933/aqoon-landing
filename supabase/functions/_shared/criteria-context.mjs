export const CRITERIA_BRIDGE = {
  preferred_area: ["preferred_area", "preferred_provider_or_area"],
  preferred_provider_or_area: ["preferred_provider_or_area", "preferred_area"],
  child_age: ["child_age", "child_age_or_birth_date"],
  school_age_or_grade: ["school_age_or_grade", "grade"],
  child_age_or_grade: ["child_age_or_grade", "grade"],
  school_or_area: ["school_or_area", "school_name"],
  current_school_or_enrolment: ["current_school_or_enrolment", "school_route"],
  language_learning_concern: ["language_learning_concern", "s2", "child_finnish"],
  support_need_description: ["support_need_description", "school_goal"],
  jobseeker_registration_status: ["jobseeker_registration_status", "jobseeker_active"],
  work_status: ["work_status", "main_status", "primary_situation"],
  main_status: ["main_status", "work_status", "primary_situation"],
  right_to_work_known_when_relevant: ["right_to_work_known_when_relevant", "right_to_work_known"],
  availability: ["availability", "days", "hobby_time"],
  care_need_schedule: ["care_need_schedule", "care_schedule"],
};

export const joinedFact = (value) =>
  Array.isArray(value) ? value.join(", ") : value || "";

export function routeFacts(lead = {}, answers = {}) {
  const city = String(lead.city || "").toLowerCase();
  return {
    ...answers,
    city,
    municipality: city,
    interest: answers.interest || lead.sub_need || "",
    child_age_or_birth_date: answers.child_age_or_birth_date || "",
    permanent_vantaa_residence_context:
      answers.permanent_vantaa_residence_context ||
      (answers.home_municipality === "Yes"
        ? "yes"
        : answers.home_municipality === "No"
          ? "no"
          : ""),
  };
}

export function valueForRouteFact(facts, key) {
  const keys = CRITERIA_BRIDGE[key] || [key];
  for (const candidate of keys) {
    if (facts[candidate]) return joinedFact(facts[candidate]);
  }
  return "";
}
