//defino las constantes para luego usarlas:

const cards = document.getElementById('cards'); //div donde se aplica el contenido
const items = document.getElementById('items'); // contenido del buy lleno
const footer = document.getElementById('footer'); //contenido del buy
const templateCard = document.getElementById('template-card').content; //para el detalle de buy
const templateFooter = document.getElementById('template-footer').content; //para total buy
const templatebuy = document.getElementById('template-buy').content; //para el detalle de buy
const fragment = document.createDocumentFragment();
const btnBuy = document.getElementById('btnBuy');
let buy = {}; //coleccion de objetos vacios


document.addEventListener('DOMContentLoaded', () => {
    fetchData()
    if (localStorage.getItem('buy')) {
        buy = JSON.parse(localStorage.getItem('buy'));
        paintbuy();
    }
});
cards.addEventListener('click', e => {
    addbuy(e)
})


items.addEventListener('click', e => { //para identif. el contenido del carrito
    btnAction(e);
})


const fetchData = async () => {
    try {
        const res = await fetch('directorio.json');
        const data = await res.json();
        /* console.log(data); */
        paintCard(data);
    } catch (error) {
        console.log(error);
    }
}

const paintCard = data => { //esta funcion me permite armar las cards y su estructura

    data.forEach(product => { //uso forEach porque tengo mi base de datos en un .json
        //templateCard.querySelector('h5').textContent = `Con glúten: ${product.gluten}`;
        templateCard.querySelector('h3').textContent = product.pan;
        templateCard.querySelector('p').textContent = product.precio;
        templateCard.querySelector('img').setAttribute('src', product.img);
        templateCard.querySelector('.btn-dark').dataset.id = product.id;
        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment);
}

const addbuy = e => {
    //console.log(e.target);
    //console.log(e.target.classList.contains('btn-dark'));
    if (e.target.classList.contains('btn-dark')) {
        setbuy(e.target.parentElement);     //agregar info al buy  como si fuera un push  
        /* libreria sweetAlert */
        Swal.fire({
            title:'Excelente!',
            text:'Agregaste al carrito!',
            confirmButtonColor: '#eaa721',
            confirmButtonText: 'Ok!'
        }
            
        )

    }
    e.stopPropagation()
}

const setbuy = objeto => { //captura los elementos del buy
    console.log(objeto);
    const product = {
        id: objeto.querySelector('.btn-dark').dataset.id, //se accede a la info del boton
        pan: objeto.querySelector('h3').textContent, //se accede a la info del boton
        precio: objeto.querySelector('p').textContent, //se accede a la info del boton
        cantidad: 1
    }
    //para acceder al buy
    if (buy.hasOwnProperty(product.id)) { //con esto le va a sumar 1 cada vez que le hace clic al boton
        product.cantidad = buy[product.id].cantidad + 1;
    }

    buy[product.id] = { ...product }; //adquiero una copia de producto con los 3 puntos
    paintbuy();
}

const paintbuy = () => { //buy de compras
    /* console.log(buy) */;
    items.innerHTML = '' //para que no se sobre escriba la informacion
    Object.values(buy).forEach(product => {
        templatebuy.querySelector('th').textContent = product.id;
        templatebuy.querySelectorAll('td')[0].textContent = product.pan;
        templatebuy.querySelectorAll('td')[1].textContent = product.cantidad;
        templatebuy.querySelector('.btn-info').dataset.id = product.id;
        templatebuy.querySelector('.btn-danger').dataset.id = product.id;
        templatebuy.querySelector('span').textContent = product.precio * product.cantidad;

        const clone = templatebuy.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);

    paintFooter()

    localStorage.setItem('buy', JSON.stringify(buy))
}

const paintFooter = () => { //funcion para definir el footer de totales
    footer.innerHTML = '' //para que no se sobre escriba la informacion
    if (Object.keys(buy).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `
        return
    }

    const nCantidad = Object.values(buy).reduce((acc, { cantidad }) => acc + cantidad, 0);
    const nPrecio = Object.values(buy).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0);
    //console.log(nPrecio);
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;//para que muestre la cantidad
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const btnEmpty = document.getElementById('vaciar-buy');//vaciar buy con boton
    btnEmpty.addEventListener('click', () => {
        /* libreria sweetAlert */
        Swal.fire({
            title: 'Vaciar Carrito?',
            text: "Seguro que quieres vaciar carrito!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#eaa721',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Si, vaciar!'
        }).then((result) => {
            if (result.isConfirmed) {
                buy = {};//si no quiero las alertas de la libreria, saco la libreria y dejo esto en la funcion
                paintbuy();//si no quiero las alertas de la libreria, saco la libreria y dejo esto en la funcion
                Swal.fire({
                    title:'Carrito vacio',
                    text: 'Has borrado los elementos del carrito',
                    confirmButtonColor: '#eaa721',
                    confirmButtonText: 'Ok!'
                }
                
                )
            }
        })
        
    })
}

const btnAction = e => {
    console.log(e.target);
    //hay que acceder a la coleccion de objetos
    //acccion de aumentar
    if (e.target.classList.contains('btn-info')) {
        console.log(buy[e.target.dataset.id]);
        // buy[e.target.dataset.id];
        const product = buy[e.target.dataset.id];
        product.cantidad++;
        buy[e.target.dataset.id] = { ...product };
        paintbuy()
    }

    if (e.target.classList.contains('btn-danger')) { //disminuir
        const product = buy[e.target.dataset.id];
        product.cantidad--;
        if (product.cantidad === 0) {
            delete buy[e.target.dataset.id]
        }
        paintbuy()
    }

    e.stopPropagation();
}
