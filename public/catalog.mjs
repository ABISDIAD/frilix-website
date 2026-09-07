export let pieces = [
  {id:'black-tokyo-winter-parka',price:129,currency:'USD',stockStatus:'in_stock',name:'Black Tokyo Winter Parka',type:'Parkas',collection:'Adolla Flames Collection',color:'Black / Silver',image:'/assets/black-tokyo-winter-parka.png',description:'A black hooded parka concept with silver bands, utility pockets and TOKYO lettering across the back.',keywords:'jacket jackets coat coats outerwear winter black'},
  {id:'white-tokyo-winter-parka',price:129,currency:'USD',stockStatus:'out_of_stock',name:'White Tokyo Winter Parka',type:'Parkas',collection:'Adolla Flames Collection',color:'White / Ice blue',image:'/assets/white-tokyo-winter-parka.png',description:'The Tokyo Winter silhouette in white, with ice-blue bands, utility details and bold lettering on the back.',keywords:'jacket jackets coat coats outerwear winter white blue'},
  {id:'knight-king-hoodie',price:74,currency:'USD',stockStatus:'in_stock',name:'Knight King Hoodie',type:'Hoodies',collection:'Adolla Flames Collection',color:'Black / Ivory',image:'/assets/knight-king-hoodie.png',description:'A black-and-ivory zip hoodie with contrasting shoulder panels, TOKYO FFS chest lettering and a statement back emblem.',keywords:'hoodie hooded zip sweatshirt sweatshirts knight king'},
  {id:'ashen-reaper-sweats',price:58,currency:'USD',stockStatus:'in_stock',name:'Ashen Reaper Sweats',type:'Sweatpants',collection:'Adolla Flames Collection',color:'Black / Charcoal',image:'/assets/ashen-reaper-sweats.png',description:'Dark graphic sweats with skull details, winding artwork and crisscross bands down one leg.',keywords:'sweats sweatpants sweat pants pants trousers bottoms joggers ashen reaper'},
  {id:'joker-shirt',price:36,currency:'USD',stockStatus:'out_of_stock',name:'Joker Shirt',type:'Shirts',collection:'Adolla Flames Collection',color:'Black / Ivory',image:'/assets/joker-shirt.png',description:'A two-tone shirt featuring a Joker illustration, card-suit sleeve graphics and a patterned hem.',keywords:'shirt shirts tee tees t-shirt tshirt top tops joker'},
  {id:'adolla-shirt',price:38,currency:'USD',stockStatus:'in_stock',name:'Adolla Shirt',type:'Shirts',collection:'Adolla Flames Collection',color:'Ivory / Black',image:'/assets/adolla-shirt.png',description:'An ivory shirt with smoky black edges, skeletal artwork at the hem and a small back emblem.',keywords:'shirt shirts tee tees t-shirt tshirt top tops adolla'},
  {id:'sho-fleece',price:89,currency:'USD',stockStatus:'coming_soon',name:'Sho Fleece',type:'Fleece',collection:'Adolla Flames Collection',color:'Ivory / Red',image:'/assets/sho-fleece.png',description:'An ivory zip fleece concept with a striking red cross motif and subtle feather details across the shoulders.',keywords:'jacket jackets outerwear fleece zip sho white red'}
];
export function filterPieces({query='',type='All',collection='All'}={}) {
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return pieces.filter(piece=>(type==='All'||piece.type===type)&&(collection==='All'||piece.collection===collection)&&words.every(word=>`${piece.name} ${piece.type} ${piece.collection} ${piece.color} ${piece.keywords}`.toLowerCase().includes(word)));
}

export function productPrice(piece){
  return piece.price===null||!piece.currency?'Price coming soon':new Intl.NumberFormat('en',{style:'currency',currency:piece.currency}).format(piece.price);
}
export function productStock(piece){return ({in_stock:'In stock',out_of_stock:'Out of stock',coming_soon:'Coming soon',unconfirmed:'Availability to be confirmed'})[piece.stockStatus]||'Availability to be confirmed';}
export const viewBounds={
'black-tokyo-winter-parka':{front:[.09,.03,.405,.93],back:[.50,.03,.40,.93]},
'white-tokyo-winter-parka':{front:[.10,.025,.395,.94],back:[.50,.025,.39,.94]},
'knight-king-hoodie':{front:[.045,.07,.455,.865],back:[.50,.07,.455,.865]},
'ashen-reaper-sweats':{front:[.205,.005,.29,.98],back:[.525,.005,.285,.98]},
'joker-shirt':{front:[.035,.035,.465,.915],back:[.50,.035,.445,.915]},
'adolla-shirt':{front:[.055,.065,.445,.89],back:[.50,.065,.445,.89]},
'sho-fleece':{front:[.02,.09,.48,.83],back:[.515,.09,.48,.83]}
};

export const demoSizes=['XS','S','M','L','XL','XXL'];

export let featuredCollection=null;
export async function loadCatalog(){const response=await fetch('/api/catalog');const data=await response.json();if(!response.ok)throw new Error(data.error||'The catalog is temporarily unavailable.');pieces=data.pieces;featuredCollection=data.featured;return pieces;}
