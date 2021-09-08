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

window.addEventListener('load', async () => {
    let keys = await idbKeyval.keys();
    keys = keys.filter(x => x != 'index');
    for(let id of keys){
        const line = await idbKeyval.get(id);
        output.append(getListItem(id, line));
    }
});

async function nextIndex(){
    await idbKeyval.update('index', (idx) => (idx || 0) + 1);
    return idbKeyval.get('index');
}

function getListItem(id, line){
    const newItem = item0.cloneNode(true);
    newItem.setAttribute('id', id);
    if(line && line.image){
        const itemImage = newItem.querySelector('img');
        itemImage.classList.remove('blank-image');
        const imgURL = URL.createObjectURL(line.image);
        itemImage.onload = function(){
            URL.revokeObjectURL(imgURL)
        }
        itemImage.src = imgURL;
    }
    if(line && line.text){
        newItem.querySelector('textarea').textContent = line.text;
    }
    newItem.querySelector('textarea').addEventListener('change', e => {
        console.log(`item ${id}: ${e.target.value}`);
        idbKeyval.update(id, line => {
            line.text = e.target.value;
            return line;
        }).catch(err => {console.error(err)});
    });
    newItem.querySelector('.trash').addEventListener('click', e => {
        console.log(`Deleting item ${id}`);
        idbKeyval.del(id)
            .then(() => {
                newItem.remove();
            })
            .catch(err => {console.error(err)});
    });
    return newItem;
}

function Line(image, text='', done=false){
    this.image = image;
    this.text  = text;
    this.done  = done;
}

function clear(){
    idbKeyval.clear().then( () => {
        output.querySelectorAll('li').forEach(li => li.remove());
    }).catch(err => console.error(err));
}

// TODO: image input should be reset at some point
// TODO: if no file is selected, we are getting an error
imageInput.addEventListener('change', e => {
    const imgURL = URL.createObjectURL(e.target.files[0]);
    img0.onload = async () => {
        URL.revokeObjectURL(imgURL);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img0, 0, 0, WIDTH, HEIGHT);
        const id = await nextIndex();
        const item = getListItem(id);
        const itemImage = item.querySelector('img');
        itemImage.classList.remove('blank-image');
        canvas.toBlob(blob => {
            const itemURL = URL.createObjectURL(blob);
            itemImage.onload = () => {
                URL.revokeObjectURL(itemURL);
            }
            itemImage.src = itemURL;
            output.append(item);
            const line = new Line(blob);
            idbKeyval.set(id, line).then(console.log(`image stored in line ${id}`));
        }, 'image/jpeg', 0.9);
    };
    img0.src = imgURL;
});