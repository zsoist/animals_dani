export function CatArt({body = "#c79765", sleeping = false}:{body?:string;belly?:string;sleeping?:boolean}) {
  const variants:Record<string,number>={"#c79765":0,"#8d9298":3,"#ddd8cb":2,"#756c66":4};
  const variant=sleeping?2:variants[body]??(body==="#e7a65a"?0:1);
  return <div className={`cat-art illustrated-cat kitten-${variant} ${sleeping?'kitten-sleeping':''}`} aria-hidden="true" style={{backgroundPosition:`${(variant%3)*50}% ${Math.floor(variant/3)*100}%`}}/>;
}
