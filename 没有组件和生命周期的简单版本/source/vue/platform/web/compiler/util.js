import { makeMap } from "../../../shared/util";



export const isUnaryTag = makeMap(                                          //检测是否为一元标签
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
)
export const canBeLeftOpenTag = makeMap(                                    
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)

export const isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
)