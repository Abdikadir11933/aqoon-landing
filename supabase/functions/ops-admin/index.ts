import { createClient } from "npm:@supabase/supabase-js@2";
import { requireOperator } from "../_shared/operator-auth.ts";
import { buildDemandRows, demandAggregate, opportunityDemand } from "../_shared/demand-aggregate.mjs";

const ORIGIN = "https://aqoon.live";
const STAGES = ["lead","contacted","discovery","proposal_sent","decision_review","won","delivery","expansion","closed_lost"];
const HEALTH = ["on_track","waiting","at_risk","blocked"];
const TYPES = ["email","call","meeting","proposal","report","note","task","stage_change"];
const EVENT_TYPES = ["call","meeting","deadline","task"];
const EVENT_STATUS = ["planned","done","cancelled"];
const DEMAND_DOMAINS = ["work","education","school","daycare","hobby","live_programme","service_support","family_finances","housing_debt_family","entrepreneurship","general"];
const DEMAND_TIMING = ["any","now","within_6_months","within_12_months","later"];
const DEMAND_INTEREST = ["stated_need","ready_future","stated_or_ready"];
const headers = () => ({
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
});
const text = (v:unknown, max=6000) => typeof v === "string" ? v.trim().slice(0,max) : null;
const arr = (v:unknown) => Array.isArray(v) ? v.map(x=>text(x,1000)).filter(Boolean).slice(0,30) : [];
const date = (v:unknown) => { if(!v) return null; const d=new Date(String(v)); return Number.isNaN(d.getTime())?null:d.toISOString(); };
const resolveOperatorId = (jwtOperatorId:string, _b:any) => jwtOperatorId;
const json = (body:unknown, status:number, h:Record<string,string>) => new Response(JSON.stringify(body),{status,headers:h});

// PII-free aggregate of unmatched family demand, for buyer-facing conversations.
// Per docs/architecture/business-operating-model.md: buyers are never sold raw
// family contact data, only agreed outcomes and anonymized aggregate counts.
// This receives only main_need/city/journey_stage/status - never name, phone,
// or any other identifying field - by construction of the caller's select().
// Per-opportunity demand: how many active families match the need/city this
// deal is actually about, and how many of those are past their first
// interview. Counts only - the same rows never carry name/phone here either.

Deno.serve(async req => {
  const h=headers();
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:h});
  if(req.method!=="POST") return json({error:"method_not_allowed"},405,h);
  const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key) return json({error:"server_config"},500,h);
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const auth=await requireOperator(req,db);
  if(!auth) return json({error:"unauthorized"},401,h);
  const jwtOperatorId=auth.operator.id;
  let b:any={}; try{b=await req.json()}catch{}
  const action=String(b.action||"list");

  if(action==="operators"){
    const {data,error}=await db.from("operators").select("id,display_name,active").eq("active",true).order("display_name",{ascending:true});
    if(error) return json({error:"db_error",detail:error.message},500,h);
    return json({operators:data||[]},200,h);
  }

  if(action==="list"){
    const [or,ar,er,fr,opr,dr,nr,pr,fur,hr]=await Promise.all([
      db.from("sales_opportunities").select("*").order("updated_at",{ascending:false}).limit(500),
      db.from("sales_activities").select("*").order("created_at",{ascending:false}).limit(2000),
      db.from("ops_events").select("*").gte("starts_at",new Date(Date.now()-14*86400000).toISOString()).order("starts_at",{ascending:true}).limit(1000),
      db.from("family_leads").select("id,name,phone,city,main_need,next_follow_up_at,latest_interview:family_interviews(next_action)").not("next_follow_up_at","is",null).order("next_follow_up_at",{ascending:true}).limit(500),
      db.from("operators").select("id,display_name,active").eq("active",true).order("display_name",{ascending:true}),
      db.from("family_leads").select("id,household_id,city,status,interview_status").neq("status","resolved").limit(2000),
      db.from("family_needs").select("id,household_id,need_domain,status,source_lead_id,timing").eq("status","active").limit(4000),
      db.from("family_case_plans").select("family_need_id,plan_status").not("family_need_id","is",null).limit(4000),
      db.from("family_future_opportunities").select("family_lead_id,need_domain,status,earliest_contact_at,contact_permission_status").in("status",["watching","ready","offered","accepted"]).limit(4000),
      db.from("family_partner_handoffs").select("sales_opportunity_id,handoff_status,consent_status").limit(4000)
    ]);
    const error=or.error||ar.error||er.error||fr.error||opr.error||dr.error||nr.error||pr.error||fur.error||hr.error;
    if(error) return json({error:"db_error",detail:error.message},500,h);
    const familyRows=buildDemandRows({leads:dr.data||[],needs:nr.data||[],plans:pr.data||[],futureOpportunities:fur.data||[]});
    const opportunities=(or.data||[]).map((o:any)=>{const handoffs=(hr.data||[]).filter((handoff:any)=>handoff.sales_opportunity_id===o.id);return {...o,matched_demand:opportunityDemand(familyRows,o.demand_need_domain,o.demand_city,o.demand_interest_state,o.demand_timing),handoff_counts:{sent:handoffs.length,outcomes:handoffs.filter((handoff:any)=>["partner_accepted","partner_declined","outcome_confirmed"].includes(handoff.handoff_status)).length,withdrawn:handoffs.filter((handoff:any)=>handoff.handoff_status==="family_withdrew").length}}});
    return json({opportunities,activities:ar.data||[],events:er.data||[],family_followups:fr.data||[],operators:opr.data||[],demand:demandAggregate(familyRows)},200,h);
  }

  if(action==="save_opportunity"){
    const organization=text(b.organization,200);
    if(!organization) return json({error:"organization_required"},400,h);
    const operatorId=resolveOperatorId(jwtOperatorId,b);
    const payload:any={
      organization, contact_name:text(b.contact_name,160), contact_role:text(b.contact_role,160),
      stage:STAGES.includes(b.stage)?b.stage:"lead", health:HEALTH.includes(b.health)?b.health:"on_track",
      summary:text(b.summary), goal:text(b.goal), success_definition:text(b.success_definition),
      completed_steps:arr(b.completed_steps), next_steps:arr(b.next_steps), next_action:text(b.next_action,1500),
      next_action_at:date(b.next_action_at), probability:b.probability!==null&&b.probability!==""&&Number.isFinite(Number(b.probability))?Math.max(0,Math.min(100,Number(b.probability))):null,
      source:text(b.source,200),
      demand_need:Object.prototype.hasOwnProperty.call(b,"demand_need")?text(b.demand_need,120):undefined,
      demand_need_domain:DEMAND_DOMAINS.includes(b.demand_need_domain)?b.demand_need_domain:null,
      demand_city:text(b.demand_city,100),
      demand_timing:DEMAND_TIMING.includes(b.demand_timing)?b.demand_timing:"any",
      demand_interest_state:DEMAND_INTEREST.includes(b.demand_interest_state)?b.demand_interest_state:"stated_or_ready",
      updated_at:new Date().toISOString()
    };
    if(Object.prototype.hasOwnProperty.call(b,"owner_operator_id")) payload.owner_operator_id=b.owner_operator_id?String(b.owner_operator_id):null;
    else if(!b.id&&operatorId) payload.owner_operator_id=operatorId;
    let q=b.id?db.from("sales_opportunities").update(payload).eq("id",String(b.id)):db.from("sales_opportunities").insert(payload);
    const {data:record,error}=await q.select().single();
    if(error) return json({error:"db_error",detail:error.message},500,h);
    return json({opportunity:record},200,h);
  }

  if(action==="delete_opportunity"){
    const id=String(b.id||""); if(!id)return json({error:"missing_id"},400,h);
    const {error}=await db.from("sales_opportunities").delete().eq("id",id);
    if(error)return json({error:"db_error",detail:error.message},500,h);
    return json({ok:true},200,h);
  }

  if(action==="add_activity"){
    const opportunity_id=String(b.opportunity_id||""), title=text(b.title,300), activity_type=TYPES.includes(b.activity_type)?b.activity_type:"note";
    if(!opportunity_id||!title)return json({error:"missing_fields"},400,h);
    const operatorId=resolveOperatorId(jwtOperatorId,b);
    const payload:any={opportunity_id,activity_type,title,notes:text(b.notes),happened_at:date(b.happened_at),due_at:date(b.due_at),completed_at:date(b.completed_at),operator_id:operatorId};
    const {data:record,error}=await db.from("sales_activities").insert(payload).select().single();
    if(error)return json({error:"db_error",detail:error.message},500,h);
    return json({activity:record},200,h);
  }

  if(action==="save_event"){
    const title=text(b.title,300), starts_at=date(b.starts_at);
    if(!title||!starts_at)return json({error:"missing_fields"},400,h);
    const operatorId=resolveOperatorId(jwtOperatorId,b);
    const payload:any={title,starts_at,ends_at:date(b.ends_at),event_type:EVENT_TYPES.includes(b.event_type)?b.event_type:"task",status:EVENT_STATUS.includes(b.status)?b.status:"planned",notes:text(b.notes),opportunity_id:b.opportunity_id||null,family_lead_id:b.family_lead_id||null,updated_at:new Date().toISOString()};
    if(operatorId) payload.operator_id=operatorId;
    let q=b.id?db.from("ops_events").update(payload).eq("id",String(b.id)):db.from("ops_events").insert(payload);
    const {data:record,error}=await q.select().single();
    if(error)return json({error:"db_error",detail:error.message},500,h);
    return json({event:record},200,h);
  }

  if(action==="delete_event"){
    const id=String(b.id||""); if(!id)return json({error:"missing_id"},400,h);
    const {error}=await db.from("ops_events").delete().eq("id",id);
    if(error)return json({error:"db_error",detail:error.message},500,h);
    return json({ok:true},200,h);
  }

  return json({error:"unknown_action"},400,h);
});
