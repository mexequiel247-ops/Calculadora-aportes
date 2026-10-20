(()=>{
let original,image,angle=0,applying=false,loading=false;
const dialog=$('photo-editor'),canvas=$('editor-canvas');
function reset(){angle=0;for(const id of ['photo-brightness','photo-contrast','photo-zoom'])$(id).value=100;$('photo-gray').checked=false}
window.rememberReceiptPhoto=file=>{if(!applying){original=file;image=null;reset()}};
window.resetReceiptPhoto=()=>{original=null;image=null;dialog.close()};
function zoom(){if(!image)return;const z=Number($('photo-zoom').value);$('zoom-value').value=z+'%';canvas.style.width=Math.max(1,$('editor-view').clientWidth-2)*z/100+'px';canvas.style.height='auto'}
function render(){if(!image)return;const scale=Math.min(1,2400/Math.max(image.naturalWidth,image.naturalHeight)),w=Math.round(image.naturalWidth*scale),h=Math.round(image.naturalHeight*scale);canvas.width=angle%180?h:w;canvas.height=angle%180?w:h;const ctx=canvas.getContext('2d');ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(image,-w/2,-h/2,w,h);const p=ctx.getImageData(0,0,canvas.width,canvas.height),d=p.data,b=Number($('photo-brightness').value)/100,c=Number($('photo-contrast').value)/100,gray=$('photo-gray').checked;for(let i=0;i<d.length;i+=4){const g=.299*d[i]+.587*d[i+1]+.114*d[i+2];for(let k=0;k<3;k++)d[i+k]=Math.max(0,Math.min(255,((gray?g:d[i+k])*b-128)*c+128))}ctx.putImageData(p,0,0);zoom()}
function auto(){ $('photo-brightness').value=110;$('photo-contrast').value=135;$('photo-gray').checked=true;render()}
async function open(enhance){if(!original||loading)return;loading=true;try{if(!image){const file=original,url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(file!==original)return;image=img}finally{URL.revokeObjectURL(url)}}dialog.showModal();$('editor-feedback').textContent=ocrBusy?'Esperá a que termine la lectura para aplicar cambios.':'';if(enhance)auto();else render()}catch{$('ocr-status').textContent='No se pudo abrir la foto. Elegí una imagen JPG o PNG.'}finally{loading=false}}
$('enlarge-photo').onclick=()=>open(false);$('photo-preview').onclick=()=>open(false);$('enhance-photo').onclick=()=>open(true);$('photo-zoom').oninput=zoom;
for(const id of ['photo-brightness','photo-contrast','photo-gray'])$(id).oninput=render;
$('photo-auto').onclick=auto;$('photo-rotate').onclick=()=>{angle=(angle+90)%360;render()};$('photo-reset').onclick=()=>{reset();render()};$('photo-cancel').onclick=()=>dialog.close();
$('photo-apply').onclick=()=>{if(ocrBusy){$('editor-feedback').textContent='La lectura sigue en curso. Esperá a que termine y volvé a aplicar.';return}if(applying)return;applying=true;$('photo-apply').disabled=true;canvas.toBlob(async blob=>{try{if(!blob){$('editor-feedback').textContent='No se pudo preparar la imagen. Probá de nuevo.';return}dialog.close();await readPhoto(new File([blob],'recibo-mejorado.png',{type:'image/png'}))}finally{applying=false;$('photo-apply').disabled=false}},'image/png')};
window.addEventListener('resize',()=>{if(dialog.open)zoom()});
})();
