export const CURRENT_INTERVIEW_SCHEMA = "first-interview-v5";

const ALLOWED_TOPICS = new Set([
  "work", "education", "entrepreneurship", "daycare", "hobby",
  "school_child", "program", "service_support", "general",
]);

const TOPIC_ANCHORS = {
  work: ["primary_situation", "work_search_scope", "work_intent", "right_to_work_known", "availability", "start_when", "travel_limit", "childcare_limit"],
  education: ["education_entry_reason"],
  entrepreneurship: ["business_stage", "business_idea", "business_plan"],
  daycare: ["care_reason", "child_age_or_birth_date", "desired_start_date", "preferred_area"],
  hobby: ["activity_goal"],
  school_child: ["school_situation"],
  program: ["program_reason"],
  service_support: ["authority_issue"],
  general: ["issue_context", "desired_help"],
};

const present = value => value !== undefined && value !== null && value !== "" &&
  (!Array.isArray(value) || value.length > 0);

export function validateCompletedInterview(input = {}) {
  if (input.status !== "completed") return [];
  const errors = [];
  if (input.schemaVersion !== CURRENT_INTERVIEW_SCHEMA) errors.push("interview_schema_version");
  if (!String(input.nextAction || "").trim()) errors.push("next_action");
  const answers = input.answers && typeof input.answers === "object" && !Array.isArray(input.answers)
    ? input.answers
    : {};
  const topics = [...new Set(String(input.interviewType || "").split("+").filter(Boolean))];
  if (!topics.length || topics.some(topic => !ALLOWED_TOPICS.has(topic))) errors.push("interview_type");
  const workLinkedEducation = topics.includes("work") && topics.includes("education") &&
    (answers.work_search_scope === "Work plus training options" ||
      ["Yes", "Maybe / needs explanation"].includes(answers.apprenticeship_interest));
  for (const topic of topics) {
    // Education can be derived from a work interview when the person asks for
    // work-linked training. In that branch the three decisive training facts
    // below are the contract; the generic education intake anchor was never
    // displayed and must not block a valid save.
    if (topic === "education" && workLinkedEducation) continue;
    for (const key of TOPIC_ANCHORS[topic] || []) if (!present(answers[key])) errors.push(key);
  }
  if (topics.includes("work") && answers.work_search_scope === "Work plus training options") {
    for (const key of ["qualification_status", "work_study_route", "training_schedule"]) if (!present(answers[key])) errors.push(key);
  }
  if (topics.includes("work") && answers.primary_situation === "Unemployed / seeking work") {
    for (const key of ["jobseeker_active", "unemployment_duration", "employment_plan", "palkkatuki"]) if (!present(answers[key])) errors.push(key);
  }
  return [...new Set(errors)];
}
