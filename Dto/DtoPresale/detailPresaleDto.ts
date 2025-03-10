class DetailPresaleDTO {
    private _id_producto: string;
    private _precio_unitario: number;
    private _cantidad: number;
    private _subtotal: number;
    private _state: string;

    constructor(id_producto: string, precio_unitario: number, cantidad: number, subtotal: number, state: string) {
        this._id_producto = id_producto;
        this._precio_unitario = precio_unitario;
        this._cantidad = cantidad;
        this._subtotal = subtotal;
        this._state = state;
    }

    // Getters
    get id_producto(): string {
        return this._id_producto;
    }

    get precio_unitario(): number{
        return this._precio_unitario;
    }

    get cantidad(): number {
        return this._cantidad;
    }

    get subtotal(): number {
        return this._subtotal;
    }

    get state(): string {
        return this._state;
    }
    // Setters
    set id_producto(id_producto: string) {
        this._id_producto = id_producto;
    }

    set precio_unitario(precio_unitario:number){
        this._precio_unitario = precio_unitario;
    }

    set cantidad(cantidad: number) {
        this._cantidad = cantidad;
    }

    set subtotal(subtotal: number) {
        this._subtotal = subtotal;
    }

    set state(state: string) {
        this._state = state;
    }
}

export default DetailPresaleDTO;
