(()=>{'use strict';
const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const response=await originalFetch(input,init);
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(!url.includes('/family-leads-admin')||!init||!init.body)return response;
    const requestBody=JSON.parse(init.body);
    if(requestBody.action!=='list')return response;
    const data=await response.clone().json();
    if(!data||!Array.isArray(data.leads))return response;
    data.leads=data.leads.map(lead=>{
      const extras=Array.isArray(lead.additional_needs)?lead.additional_needs:[];
      if(!extras.length)return lead;
      const line='Other needs: '+extras.map(x=>[x.main_need,x.sub_need].filter(Boolean).join(' · ')).filter(Boolean).join(' | ');
      return Object.assign({},lead,{notes:[line,lead.notes].filter(Boolean).join('\n')});
    });
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
  }catch(_){return response;}
};
})();
