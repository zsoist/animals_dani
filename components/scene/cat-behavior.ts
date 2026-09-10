export type CatPose='idle'|'walk'|'play'|'sleep'|'groom'|'stretch'|'social'|'happy'|'eat';
export type Point={x:number;y:number};
export type CatMotion={position:Point;target:Point;pose:CatPose;arrival:CatPose;remaining:number;direction:number};
export const places={ball:{x:.68,y:.87},bed:{x:.23,y:.84},box:{x:.78,y:.72},food:{x:.43,y:.82},treat:{x:.57,y:.88}};
export function chooseActivity(personality:string,current:Point,peers:Point[],hasBed:boolean,rng:()=>number):Pick<CatMotion,'target'|'pose'|'arrival'|'remaining'> {
 const roll=rng();
 if((personality==='dormilón'&&roll<.6)||(hasBed&&roll<.13))return {target:hasBed?places.bed:current,pose:hasBed?'walk':'sleep',arrival:'sleep',remaining:9+rng()*7};
 if(roll<.3)return {target:places.ball,pose:'walk',arrival:'play',remaining:5+rng()*4};
 if(roll<.48&&peers.length&&personality!=='tímido') {const peer=peers[Math.floor(rng()*peers.length)];return {target:{x:Math.max(.12,Math.min(.86,peer.x-.09)),y:peer.y+.015},pose:'walk',arrival:'social',remaining:4+rng()*4};}
 if(roll<.62)return {target:current,pose:'groom',arrival:'groom',remaining:4+rng()*4};
 if(roll<.74)return {target:current,pose:'stretch',arrival:'stretch',remaining:3+rng()*3};
 return {target:{x:.12+rng()*.74,y:.59+rng()*.3},pose:'walk',arrival:'idle',remaining:2+rng()*3};
}
export function moveCat(motion:CatMotion,seconds:number,speed:number):boolean {
 const dx=motion.target.x-motion.position.x,dy=motion.target.y-motion.position.y;
 const distance=Math.hypot(dx,dy),step=Math.min(seconds,.05)*speed;
 if(distance<=step){motion.position={...motion.target};motion.pose=motion.arrival;return true;}
 motion.position={x:motion.position.x+dx/distance*step,y:motion.position.y+dy/distance*step};
 if(Math.abs(dx)>.01)motion.direction=dx>0?1:-1;
 return false;
}
