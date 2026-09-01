import { createClient } from "npm:@supabase/supabase-js@2";
import { requireOperator } from "../_shared/operator-auth.ts";

const ORIGIN="https://aqoon.live";
const H=()=>({
  "Access-Control-Allow-Origin":ORIGIN,
  "Access-Control-Allow-Headers":"content-type, authorization",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"no-store"
});

function text(v:unknown,max=12000){return typeof v==="string"?v.trim().slice(0,max):null;}
function norm(v:unknown){return String(v??"").trim().toLowerCase().replace(/\s+/g," ");}
function safeArray(v:any){return Array.isArray(v)?v.map(x=>typeof x==="string"?x.trim().slice(0,300):x).slice(0,40):[];}
function stable(v:any):string{
  if(v===null||typeof v!=="object")return JSON.stringify(v);
  if(Array.isArray(v))return "["+v.map(stable).sort().join(",")+"]";
  return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";
}
async function sha(v:string):Promise<string>{
  const bytes=new TextEncoder().encode(v);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("");
}
function ageBucket(v:any){
  const n=Number(v); if(!Number.isFinite(n))return norm(v)||null;
  if(n<3)return"0-2";if(n<7)return"3-6";if(n<16)return"7-15";if(n<18)return"16-17";if(n<30)return"18-29";if(n<45)return"30-44";if(n<65)return"45-64";return"65+";
}
const SAFE_KEYS=new Set([
  "finland_time","work_status","jobseeker","jobseeker_active","unemployment_duration","employment_plan","integration_plan","right_to_work_known","palkkatuki","availability","start_when","travel_limit","childcare_limit","work_tryout","apprenticeship",
  "child_age","grade","born_finland","fin_school_time","school_route","child_finnish","s2","support_tried","support_decision","care_goal","care_schedule","sudden_need","all_guardians","urgent_proof","care_options","cost_priority","has_place","applied","reason","private_ok",
  "finnish","finnish_match","literacy","basic_school","current_study","study_language","study_load","study_travel","study_start","yki_purpose","yki_level","documents","childcare","education_goal",
  "business_stage","fulltime_started","business_plan","business_numbers","starttiraha","business_help","integration_assessment","residence_status","first_permit_time","parent_status","kotihoidon_tuki","program_goal","program_time","program_childcare","program_cost","program_travel",
  "service_area","case_status","support_goal","authority_contacted","interest","cost","travel","concern","school_support","message","cv","barrier","training"
]);
function piiFreeDimensions(lead:any,route:string,answers:any){
  const selected:Record<string,any>={};
  if(answers&&typeof answers==="object")for(const [k,v] of Object.entries(answers)){
    if(!SAFE_KEYS.has(k)||v===null||v===undefined||v==="")continue;
    if(k==="child_age")selected[k]=ageBucket(v);
    else if(Array.isArray(v))selected[k]=safeArray(v).map(norm).filter(Boolean).sort();
    else selected[k]=norm(v);
  }
  return {
    version:1,
    route:norm(route)||"general",
    city:norm(lead.city),
    main_need:norm(lead.main_need),
    sub_need:norm(lead.sub_need),
    age_group:norm(lead.age_group)||null,
    criteria:selected
  };
}
function futureIso(v:any){
  if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d.toISOString();
}
function currentScenario(s:any){
  if(!s||s.status!=="verified")return false;
  if(!s.recheck_after)return true;
  return new Date(s.recheck_after).getTime()>Date.now();
}
function publicScenario(s:any){
  if(!s)return null;
  return {id:s.id,title:s.title,status:s.status,verified_answer:s.verified_answer||{},official_sources:s.official_sources||[],operator_guidance:s.operator_guidance||{},last_verified_at:s.last_verified_at,recheck_after:s.recheck_after,times_reused:s.times_reused||0,city_scope:s.city_scope,main_need:s.main_need,sub_need:s.sub_need,age_group:s.age_group};
}
function safeResearchQuestion(dimensions:any){
  return `Verify current official routes and conditions for this reusable PII-free AQOON scenario: ${stable(dimensions)}`.slice(0,16000);
}

Deno.serve(async(req)=>{
  const h=H();
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:h});
  if(req.method!=="POST")return new Response(JSON.stringify({error:"method_not_allowed"}),{status:405,headers:h});
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)return new Response(JSON.stringify({error:"server_config"}),{status:500,headers:h});
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  if(!await requireOperator(req,db))return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:h});
  let b:any={};try{b=await req.json()}catch{}
  const action=b.action||"";
  if(action==="ping")return new Response(JSON.stringify({ok:true}),{headers:h});

  if(action==="match_scenario"){
    const leadId=String(b.lead_id||""),interviewId=String(b.interview_id||"");
    if(!leadId||!interviewId)return new Response(JSON.stringify({error:"missing_fields"}),{status:400,headers:h});
    const [lr,ir]=await Promise.all([
      db.from("family_leads").select("id,city,main_need,sub_need,age_group").eq("id",leadId).single(),
      db.from("family_interviews").select("id,lead_id,interview_type,answers").eq("id",interviewId).eq("lead_id",leadId).single()
    ]);
    if(lr.error||ir.error)return new Response(JSON.stringify({error:"not_found",detail:lr.error?.message||ir.error?.message}),{status:404,headers:h});
    const lead=lr.data,interview=ir.data;
    const answers=(b.answers&&typeof b.answers==="object")?b.answers:(interview.answers||{});
    const route=text(b.route,120)||interview.interview_type||"general";
    const dimensions=piiFreeDimensions(lead,route,answers);
    const scenarioKey=await sha(stable(dimensions));
    let {data:scenario,error:sErr}=await db.from("family_scenarios").select("*").eq("scenario_key",scenarioKey).maybeSingle();
    if(sErr)return new Response(JSON.stringify({error:"db_error",detail:sErr.message}),{status:500,headers:h});
    let matchStatus="needs_research";
    const now=new Date().toISOString();
    if(!scenario){
      const title=[lead.sub_need||lead.main_need,lead.city].filter(Boolean).join(" · ").slice(0,240);
      const ins=await db.from("family_scenarios").upsert({scenario_key:scenarioKey,dimensions,title,main_need:lead.main_need||null,sub_need:lead.sub_need||null,city_scope:lead.city||null,age_group:lead.age_group||null,status:"draft",updated_at:now},{onConflict:"scenario_key"}).select("*").single();
      if(ins.error)return new Response(JSON.stringify({error:"db_error",detail:ins.error.message}),{status:500,headers:h});
      scenario=ins.data;matchStatus="needs_research";
    }else if(currentScenario(scenario)){
      matchStatus="matched";
      const upd=await db.from("family_scenarios").update({times_reused:(scenario.times_reused||0)+1,last_reused_at:now,updated_at:now}).eq("id",scenario.id).select("*").single();
      if(upd.error)return new Response(JSON.stringify({error:"db_error",detail:upd.error.message}),{status:500,headers:h});scenario=upd.data;
    }else if(scenario.status==="retired"){
      matchStatus="no_match";
    }else{
      matchStatus="possible_match";
    }
    const ui=await db.from("family_interviews").update({scenario_fingerprint:scenarioKey,matched_scenario_id:scenario.id,scenario_match_status:matchStatus,updated_at:now}).eq("id",interviewId);
    if(ui.error)return new Response(JSON.stringify({error:"db_error",detail:ui.error.message}),{status:500,headers:h});
    if(matchStatus!=="matched"){
      const existing=await db.from("family_scenario_research").select("id").eq("scenario_id",scenario.id).eq("interview_id",interviewId).in("research_status",["pending","in_progress"]).limit(1);
      if(!existing.error&&!(existing.data||[]).length){
        const queued=await db.from("family_scenario_research").insert({scenario_id:scenario.id,interview_id:interviewId,research_status:"pending",research_question:safeResearchQuestion(dimensions)});if(queued.error)return new Response(JSON.stringify({error:"db_error",detail:queued.error.message}),{status:500,headers:h});
      }
    }
    return new Response(JSON.stringify({match_status:matchStatus,scenario:publicScenario(scenario),fingerprint:scenarioKey}),{headers:h});
  }

  if(action==="get_scenario"){
    const id=String(b.scenario_id||"");if(!id)return new Response(JSON.stringify({error:"missing_id"}),{status:400,headers:h});
    const {data,error}=await db.from("family_scenarios").select("*").eq("id",id).single();
    if(error)return new Response(JSON.stringify({error:"not_found",detail:error.message}),{status:404,headers:h});
    return new Response(JSON.stringify({scenario:publicScenario(data)}),{headers:h});
  }

  if(action==="save_research"){
    const scenarioId=String(b.scenario_id||""),interviewId=String(b.interview_id||"");
    const structured=(b.structured&&typeof b.structured==="object")?b.structured:{};
    const sources=Array.isArray(structured.official_sources)?structured.official_sources.filter((x:any)=>x&&typeof x.url==="string"&&/^https:\/\//i.test(x.url)).slice(0,30):[];
    const verified=(structured.verified_answer&&typeof structured.verified_answer==="object")?structured.verified_answer:null;
    if(!scenarioId||!interviewId||!verified||!sources.length)return new Response(JSON.stringify({error:"invalid_research_output",detail:"A verified answer and at least one HTTPS official source URL are required."}),{status:400,headers:h});
    const sc=await db.from("family_scenarios").select("*").eq("id",scenarioId).single();
    const it=await db.from("family_interviews").select("id,matched_scenario_id").eq("id",interviewId).single();
    if(sc.error||it.error||it.data.matched_scenario_id!==scenarioId)return new Response(JSON.stringify({error:"not_found"}),{status:404,headers:h});
    const now=new Date().toISOString();
    const requested=futureIso(structured.recheck_after);
    const defaultRecheck=new Date(Date.now()+30*86400000).toISOString();
    const recheck=requested&&new Date(requested).getTime()>Date.now()?requested:defaultRecheck;
    const pending=await db.from("family_scenario_research").select("id").eq("scenario_id",scenarioId).eq("interview_id",interviewId).in("research_status",["pending","in_progress"]).order("created_at",{ascending:false}).limit(1).maybeSingle();
    const findings:any={verified_answer:verified,operator_guidance:structured.operator_guidance||{}};
    const summary=text(structured.research_summary,4000);
    if(summary)findings.research_summary=summary;
    const researchPayload={checked_at:now,research_status:"completed",findings,official_sources:sources,changed_canonical_knowledge:true,notes:text(structured.notes,4000)};
    if(pending.data?.id){const saved=await db.from("family_scenario_research").update(researchPayload).eq("id",pending.data.id);if(saved.error)return new Response(JSON.stringify({error:"db_error",detail:saved.error.message}),{status:500,headers:h});}
    else {const saved=await db.from("family_scenario_research").insert({...researchPayload,scenario_id:scenarioId,interview_id:interviewId,research_question:safeResearchQuestion(sc.data.dimensions||{})});if(saved.error)return new Response(JSON.stringify({error:"db_error",detail:saved.error.message}),{status:500,headers:h});}
    const patch:any={title:text(structured.title,240)||sc.data.title,verified_answer:verified,official_sources:sources,operator_guidance:(structured.operator_guidance&&typeof structured.operator_guidance==="object")?structured.operator_guidance:{},status:"verified",last_verified_at:now,recheck_after:recheck,updated_at:now};
    if(!sc.data.first_verified_at)patch.first_verified_at=now;
    const upd=await db.from("family_scenarios").update(patch).eq("id",scenarioId).select("*").single();
    if(upd.error)return new Response(JSON.stringify({error:"db_error",detail:upd.error.message}),{status:500,headers:h});
    const interviewUpdate=await db.from("family_interviews").update({scenario_match_status:"matched",updated_at:now}).eq("id",interviewId);if(interviewUpdate.error)return new Response(JSON.stringify({error:"db_error",detail:interviewUpdate.error.message}),{status:500,headers:h});
    return new Response(JSON.stringify({saved:true,scenario:publicScenario(upd.data)}),{headers:h});
  }

  return new Response(JSON.stringify({error:"unknown_action"}),{status:400,headers:h});
});
