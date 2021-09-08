// TODO: change this:
let id = 0;
const HEIGHT = 120;
const WIDTH = 90;
const output = document.getElementById('output');
const imageInput = document.getElementById('imageInput');
const item0 = document.getElementById('item0');
item0.remove();
item0.style.display='';
const img0 = new Image(WIDTH, HEIGHT);
const canvas = document.createElement('canvas');
[canvas.width, canvas.height] = [WIDTH, HEIGHT];

function getListItem(id){
    const newItem = item0.cloneNode(true);
    newItem.setAttribute('id', id);
    newItem.querySelector('textarea').addEventListener('change', e => {
        console.log(`item ${id} changed.`);
    });
    return newItem;
}

function Line(image, text='', done=false){
    this.image = image;
    this.text  = text;
    this.done  = done;
}

imageInput.addEventListener('change', e => {
    const imgURL = URL.createObjectURL(e.target.files[0]);
    img0.onload = () => {
        URL.revokeObjectURL(imgURL);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img0, 0, 0, WIDTH, HEIGHT);
        const item = getListItem(++id);
        const itemImage = item.querySelector('img');
        itemImage.classList.remove('camera');
        canvas.toBlob(blob => {
            const itemURL = URL.createObjectURL(blob);
            itemImage.onload = () => {
                URL.revokeObjectURL(itemURL);
            }
            itemImage.src = itemURL;
            document.body.append(item);
            const line = new Line(blob);
            idbKeyval.set(id, line).then(console.log(`image stored in line ${id}`));
        }, 'image/jpeg', 0.9);
    };
    img0.src = imgURL;
});