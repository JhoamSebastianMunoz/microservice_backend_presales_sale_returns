class VentaDetalleDTO {
    private _id_producto: string;
    private _cantidad: string;
    private _subtotal: number;

    constructor(id_producto: string, cantidad: string, subtotal: number) {
        this._id_producto = id_producto;
        this._cantidad = cantidad;
        this._subtotal = subtotal;
    }

    // Getters
    get id_producto(): string {
        return this._id_producto;
    }

    get cantidad(): string {
        return this._cantidad;
    }

    get subtotal(): number {
        return this._subtotal;
    }

    // Setters
    set id_producto(value: string) {
        this._id_producto = value;
    }

    set cantidad(value: string) {
        this._cantidad = value;
    }

    set subtotal(value: number) {
        this._subtotal = value;
    }
}

export default VentaDetalleDTO;
