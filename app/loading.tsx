import {Icon} from "@/components/game/icons";
export default function Loading(){return <main className="connection-state" role="status"><div className="paw-trail" aria-hidden="true">{[0,1,2,3].map(i=><span key={i}><Icon name="paw" size={34}/></span>)}</div><h1>Abriendo el refugio…</h1><p>Un paso a la vez también te lleva lejos.</p></main>;}
