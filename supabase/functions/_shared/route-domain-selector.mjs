function normalized(value) {
  return String(value ?? "").trim().toLowerCase();
}

function workAlsoNeedsEducation(answers = {}) {
  const scope = normalized(answers.work_search_scope);
  const apprenticeship = normalized(answers.apprenticeship);
  const immediateGoal = normalized(answers.immediate_goal);
  return scope === "work plus training options" ||
    ["yes", "maybe"].includes(apprenticeship) ||
    immediateGoal === "study or course";
}

function workExplicitlyNeedsIncomeGuidance(answers = {}) {
  const immediateGoal = normalized(answers.immediate_goal);
  const situation = normalized(answers.current_situation);
  const authorityIssue = normalized(answers.authority_issue);
  const serviceArea = normalized(answers.service_area);
  return immediateGoal === "understand a letter or benefit" ||
    situation === "authority or benefit matter" ||
    serviceArea === "kela" ||
    /payment|support changed|benefit/.test(authorityIssue);
}

export function domainsForNeed(need = {}, answers = {}) {
  const main = normalized(need.main_need);
  const sub = normalized(need.sub_need);
  const ageGroup = normalized(need.age_group);

  if (/carruur|child|children/.test(main)) {
    if (/harrastus|hobby|ciyaar|activity/.test(sub)) return ["hobby"];
    if (/wilma|skuul|dugsi|school|s2|valmistava|taageerada ilmaha/.test(sub)) {
      return ["school"];
    }
    if (
      /päiväkoti|xannaano|daycare|varhaiskasvatus|esiopetus/.test(sub) ||
      (/codsi|diiwaangelin|application|registration/.test(sub) && ageGroup === "under7")
    ) return ["daycare"];
    if (/codsi|diiwaangelin|application|registration/.test(sub) && ageGroup === "over7") {
      return ["school"];
    }
    return ageGroup === "under7" ? ["daycare"] : ageGroup === "over7" ? ["school"] : [];
  }

  if (/waxbarasho|education|study|school/.test(main) || /finnish|yki|shahaad|koulutus|opisk/.test(sub)) {
    return ["education"];
  }

  if (/shaqo|work|employment|job/.test(main)) {
    if (/ganacsi|business|entrepreneur|starttiraha/.test(sub)) return ["entrepreneurship"];
    const domains = ["work"];
    if (workAlsoNeedsEducation(answers)) domains.push("education");
    if (workExplicitlyNeedsIncomeGuidance(answers)) domains.push("income_and_unemployment");
    return domains;
  }

  if (/kela|benefit|allowance|tuki|etuus|perhe-etuus/.test(sub)) return ["family_finances"];
  if (/housing|asum|debt|dayn/.test(sub)) return ["housing_debt_family"];
  if (/program|programme|barnaamij|hanke/.test(sub)) return ["live_programme"];
  if (/authority|service|adeeg|taageero/.test(sub)) return ["service_support"];
  return [];
}

export function needDomainsForLead(lead = {}, answers = {}) {
  const needs = [
    { main_need: lead.main_need, sub_need: lead.sub_need, age_group: lead.age_group },
    ...(Array.isArray(lead.additional_needs) ? lead.additional_needs : []),
  ];
  const domains = [...new Set(needs.flatMap((need, index) =>
    domainsForNeed(need, index === 0 ? answers : {})
  ))];
  const currentStudy = normalized(answers.current_study);
  const studyPath = normalized(answers.study_path);
  if (domains.includes("education") &&
      (currentStudy === "vocational" || /vocational/.test(studyPath))) {
    domains.push("education_current_student");
  }
  return domains;
}
