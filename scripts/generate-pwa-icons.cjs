// Dependency-free PNG app mark: a white stepped route and emerald destination.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const dir = path.join(__dirname, '../public/icons'); fs.mkdirSync(dir, { recursive: true });
function crc(b) { let c=0xffffffff; for(const v of b){ c^=v; for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0); } return (c^0xffffffff)>>>0; }
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,sum]);}
for(const size of [192,512]){
  const raw=Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const a=x/size,b=y/size;
    let color=[15,41,74];
    if((a>.28&&a<.40&&b>.43&&b<.73)||(a>.28&&a<.65&&b>.43&&b<.55)||(a>.55&&a<.67&&b>.29&&b<.55))color=[248,250,252];
    if((a-.61)**2+(b-.29)**2<.075**2)color=[52,211,153];
    const i=y*(size*4+1)+1+x*4;raw[i]=color[0];raw[i+1]=color[1];raw[i+2]=color[2];raw[i+3]=255;
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  fs.writeFileSync(path.join(dir,`icon-${size}.png`),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
}

