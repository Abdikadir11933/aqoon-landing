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
function txt(v:unknown,max=4000){return typeof v==="string"?v.trim().slice(0,max):"";}
function validPhone(v:string){return v.replace(/\D/g,"").length>=6;}

Deno.serve(async(req)=>{
  const h=H();
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:h});
  if(req.method!=="POST")return new Response(JSON.stringify({error:"method_not_allowed"}),{status:405,headers:h});
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)return new Response(JSON.stringify({error:"server_config"}),{status:500,headers:h});
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  if(!await requireOperator(req,db))return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:h});
  let b:any={};try{b=await req.json()}catch{}
  const action=String(b.action||"");

  if(action==="create"){
    const name=txt(b.name,160),phone=txt(b.phone,80);
    if(name.length<2||!validPhone(phone))return new Response(JSON.stringify({error:"invalid_contact",detail:"Name and a valid phone number are required."}),{status:400,headers:h});
    const {data:existing,error:lookupError}=await db.from("family_leads").select("id,name,phone").eq("phone",phone).limit(1);
    if(lookupError)return new Response(JSON.stringify({error:"db_error",detail:lookupError.message}),{status:500,headers:h});
    if(existing?.length)return new Response(JSON.stringify({error:"duplicate_phone",detail:"A CRM family with this exact phone number already exists.",existing:existing[0]}),{status:409,headers:h});
    const manualSource=txt(b.manual_source,60)||"manual";
    const payload={
      name,
      phone,
      city:txt(b.city,120)||"Not asked yet",
      main_need:txt(b.main_need,180)||"Not asked yet",
      sub_need:txt(b.sub_need,260)||"Not asked yet",
      age_group:txt(b.age_group,120)||null,
      notes:txt(b.notes,4000)||null,
      source:`manual:${manualSource}`,
      lang:"so",
      form_version:"manual-v1",
      additional_needs:[],
      status:"new",
      journey_stage:"reach",
      interview_status:"not_started",
      urgency:"normal",
      tier:2
    };
    const {data,error}=await db.from("family_leads").insert(payload).select("id,created_at,name,phone,city,main_need,sub_need,source,status,journey_stage,interview_status,form_version").single();
    if(error)return new Response(JSON.stringify({error:"db_error",detail:error.message}),{status:500,headers:h});
    return new Response(JSON.stringify({lead:data}),{headers:h});
  }

  if(action==="update"){
    const id=txt(b.id,80),name=txt(b.name,160),phone=txt(b.phone,80);
    if(!id)return new Response(JSON.stringify({error:"missing_id"}),{status:400,headers:h});
    if(name.length<2||!validPhone(phone))return new Response(JSON.stringify({error:"invalid_contact",detail:"Name and a valid phone number are required."}),{status:400,headers:h});
    const {data:existing,error:lookupError}=await db.from("family_leads").select("id").eq("phone",phone).neq("id",id).limit(1);
    if(lookupError)return new Response(JSON.stringify({error:"db_error",detail:lookupError.message}),{status:500,headers:h});
    if(existing?.length)return new Response(JSON.stringify({error:"duplicate_phone",detail:"Another CRM family already uses this exact phone number."}),{status:409,headers:h});
    const payload={name,phone,city:txt(b.city,120)||"Not asked yet",main_need:txt(b.main_need,180)||"Not asked yet",sub_need:txt(b.sub_need,260)||"Not asked yet",age_group:txt(b.age_group,120)||null,notes:txt(b.notes,4000)||null};
    const {data,error}=await db.from("family_leads").update(payload).eq("id",id).select("id,name,phone,city,main_need,sub_need,age_group,notes,status,journey_stage,interview_status").single();
    if(error)return new Response(JSON.stringify({error:"db_error",detail:error.message}),{status:500,headers:h});
    return new Response(JSON.stringify({lead:data}),{headers:h});
  }

  if(action==="move_phase"){
    const id=txt(b.id,80),phase=txt(b.phase,40);
    if(!id)return new Response(JSON.stringify({error:"missing_id"}),{status:400,headers:h});
    const moves:any={first_contact:{status:"new",journey_stage:"reach"},followup:{status:"contacted",journey_stage:"guide"}};
    const patch=moves[phase];
    if(!patch)return new Response(JSON.stringify({error:"invalid_phase"}),{status:400,headers:h});
    const {data,error}=await db.from("family_leads").update(patch).eq("id",id).select("id,status,journey_stage,interview_status").single();
    if(error)return new Response(JSON.stringify({error:"db_error",detail:error.message}),{status:500,headers:h});
    return new Response(JSON.stringify({lead:data}),{headers:h});
  }

  if(action==="delete"){
    const id=txt(b.id,80);
    if(!id)return new Response(JSON.stringify({error:"missing_id"}),{status:400,headers:h});
    const {data:lead,error:findError}=await db.from("family_leads").select("id,name,intake_request_id").eq("id",id).maybeSingle();
    if(findError)return new Response(JSON.stringify({error:"db_error",detail:findError.message}),{status:500,headers:h});
    if(!lead)return new Response(JSON.stringify({error:"not_found"}),{status:404,headers:h});
    const {error}=await db.from("family_leads").delete().eq("id",id);
    if(error)return new Response(JSON.stringify({error:"db_error",detail:error.message}),{status:500,headers:h});
    if(lead.intake_request_id){
      const intakeDelete=await db.from("family_intake_contacts").delete().eq("request_id",lead.intake_request_id);
      if(intakeDelete.error)return new Response(JSON.stringify({error:"intake_cleanup_failed",detail:intakeDelete.error.message}),{status:500,headers:h});
    }
    return new Response(JSON.stringify({deleted:{id:lead.id,name:lead.name}}),{headers:h});
  }

  return new Response(JSON.stringify({error:"unknown_action"}),{status:400,headers:h});
});
