import { createClient } from "npm:@supabase/supabase-js@2";

const PASSWORD_HASH = "67541863bd267f78446b60b489625bdd452dca1bd003fa1e620dd98de2fb6c6d";
const ORIGIN = "https://aqoon.live";
const STAGES = ["lead","contacted","discovery","proposal_sent","decision_review","won","delivery","expansion","closed_lost"];
const HEALTH = ["on_track","waiting","at_risk","blocked"];
const TYPES = ["email","call","meeting","proposal","report","note","task","stage_change"];
const EVENT_TYPES = ["call","meeting","deadline","task"];
const EVENT_STATUS = ["planned","done","cancelled"];
const headers = () => ({
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "content-type, x-tracker-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
});
async function sha(v:string){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,"0")).join("");}
const text = (v:unknown, max=6000) => typeof v === "string" ? v.trim().slice(0,max) : null;
const arr = (v:unknown) => Array.isArray(v) ? v.map(x=>text(x,1000)).filter(Boolean).slice(0,30) : [];
const date = (v:unknown) => { if(!v) return null; const d=new Date(String(v)); return Number.isNaN(d.getTime())?null:d.toISOString(); };
const json = (body:unknown, status:number, h:Record<string,string>) => new Response(JSON.stringify(body),{status,headers:h});

Deno.serve(async req => {
  const h=headers();
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:h});
  if(req.method!=="POST") return json({error:"method_not_allowed"},405,h);
  const password=req.headers.get("x-tracker-password")||"";
  if(!password || await sha(password)!==PASSWORD_HASH) return json({error:"unauthorized"},401,h);
  const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key) return json({error:"server_config"},500,h);
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  let b:any={}; try{b=await req.json()}catch{}
  const action=String(b.action||"list");

  if(action==="list"){
    const [or,ar,er,fr]=await Promise.all([
      db.from("sales_opportunities").select("*").order("updated_at",{ascending:false}).limit(500),
      db.from("sales_activities").select("*").order("created_at",{ascending:false}).limit(2000),
      db.from("ops_events").select("*").gte("starts_at",new Date(Date.now()-14*86400000).toISOString()).order("starts_at",{ascending:true}).limit(1000),
      db.from("family_leads").select("id,name,phone,city,main_need,next_follow_up_at,latest_interview:family_interviews(next_action)").not("next_follow_up_at","is",null).order("next_follow_up_at",{ascending:true}).limit(500)
    ]);
    const error=or.error||ar.error||er.error||fr.error;
    if(error) return json({error:"db_error",detail:error.message},500,h);
    return json({opportunities:or.data||[],activities:ar.data||[],events:er.data||[],family_followups:fr.data||[]},200,h);
  }

  if(action==="save_opportunity"){
    const organization=text(b.organization,200);
    if(!organization) return json({error:"organization_required"},400,h);
    const payload:any={
      organization, contact_name:text(b.contact_name,160), contact_role:text(b.contact_role,160),
      stage:STAGES.includes(b.stage)?b.stage:"lead", health:HEALTH.includes(b.health)?b.health:"on_track",
      summary:text(b.summary), goal:text(b.goal), success_definition:text(b.success_definition),
      completed_steps:arr(b.completed_steps), next_steps:arr(b.next_steps), next_action:text(b.next_action,1500),
      next_action_at:date(b.next_action_at), probability:b.probability!==null&&b.probability!==""&&Number.isFinite(Number(b.probability))?Math.max(0,Math.min(100,Number(b.probability))):null,
      source:text(b.source,200), updated_at:new Date().toISOString()
    };
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
    const payload={opportunity_id,activity_type,title,notes:text(b.notes),happened_at:date(b.happened_at),due_at:date(b.due_at),completed_at:date(b.completed_at)};
    const {data:record,error}=await db.from("sales_activities").insert(payload).select().single();
    if(error)return json({error:"db_error",detail:error.message},500,h);
    return json({activity:record},200,h);
  }

  if(action==="save_event"){
    const title=text(b.title,300), starts_at=date(b.starts_at);
    if(!title||!starts_at)return json({error:"missing_fields"},400,h);
    const payload:any={title,starts_at,ends_at:date(b.ends_at),event_type:EVENT_TYPES.includes(b.event_type)?b.event_type:"task",status:EVENT_STATUS.includes(b.status)?b.status:"planned",notes:text(b.notes),opportunity_id:b.opportunity_id||null,family_lead_id:b.family_lead_id||null,updated_at:new Date().toISOString()};
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
