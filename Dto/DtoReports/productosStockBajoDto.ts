class productosStockBajoDTO {
    private _id_producto: string;
    private _nombre_producto: string;
    private _cantidad_ingreso: number;

    constructor(id_producto: string, nombre_producto: string, cantidad_ingreso: number) {
        this._id_producto = id_producto;
        this._nombre_producto = nombre_producto;
        this._cantidad_ingreso = cantidad_ingreso;
    }

    // Getters
    get id_producto(): string {
        return this._id_producto;
    }

    get nombre_producto(): string {
        return this._nombre_producto;
    }

    get cantidad_ingreso(): number {
        return this._cantidad_ingreso;
    }

    // Setters
    set id_producto(value: string) {
        this._id_producto = value;
    }

    set nombre_producto(value: string) {
        this._nombre_producto = value;
    }

    set cantidad_ingreso(value: number) {
        this._cantidad_ingreso = value;
    }
}

export default productosStockBajoDTO;
