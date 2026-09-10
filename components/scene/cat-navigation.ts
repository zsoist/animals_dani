import type {Point} from './cat-behavior';
export type Footprint={width:number;height:number};
export type Obstacle={x:number;y:number;width:number;height:number};
export const footprintAt=(p:Point,size:Footprint):Obstacle=>({x:p.x-size.width/2,y:p.y-size.height,width:size.width,height:size.height});
export function overlaps(a:Obstacle,b:Obstacle){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
export function canStand(p:Point,size:Footprint,obstacles:Obstacle[]){return p.x-size.width/2>=.025&&p.x+size.width/2<=.975&&p.y>=.53&&p.y<=.96&&!obstacles.some(o=>overlaps(footprintAt(p,size),o));}
export function clearSegment(a:Point,b:Point,size:Footprint,obstacles:Obstacle[]){
 const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/.008));
 for(let i=1;i<=steps;i++)if(!canStand({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps},size,obstacles))return false;
 return true;
}
// Search a small courtyard grid only when choosing an activity, never on every frame.
export function routeTo(start:Point,wanted:Point,size:Footprint,obstacles:Obstacle[]):Point[]{
 const columns=37,rows=24,points:Point[]=[];
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)points.push({x:.025+x*.95/(columns-1),y:.53+y*.43/(rows-1)});
 const valid=points.map(p=>canStand(p,size,obstacles));
 const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
 const starts=points.map((p,i)=>({i,d:distance(p,start)})).filter(v=>valid[v.i]).sort((a,b)=>a.d-b.d);
 const first=starts.find(v=>clearSegment(start,points[v.i],size,obstacles));if(!first)return [];
 const queue=[first.i],parents=new Map<number,number>([[first.i,-1]]);let best=first.i;
 for(let head=0;head<queue.length;head++){
  const i=queue[head];if(distance(points[i],wanted)<distance(points[best],wanted))best=i;
  const x=i%columns,y=Math.floor(i/columns);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const nx=x+dx,ny=y+dy,n=ny*columns+nx;
   if(nx<0||nx>=columns||ny<0||ny>=rows||parents.has(n)||!valid[n]||!clearSegment(points[i],points[n],size,obstacles))continue;
   parents.set(n,i);queue.push(n);
  }
 }
 const path:Point[]=[];for(let i=best;i!==-1;i=parents.get(i)??-1)path.unshift(points[i]);
 // Remove intermediate grid corners only when the complete segment stays clear.
 const result:Point[]=[];let from=start;
 for(let i=0;i<path.length;){let next=path.length-1;while(next>i&&!clearSegment(from,path[next],size,obstacles))next--;result.push(path[next]);from=path[next];i=next+1;}
 return result;
}
