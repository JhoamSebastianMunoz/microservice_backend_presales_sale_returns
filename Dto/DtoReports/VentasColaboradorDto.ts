        class VentaColaboradorDTO {
            private _id_colaborador: number;
            private _nombre_colaborador: string;
            private _cantidad_ventas: number;
            private _total_ventas: number;

            constructor(id_colaborador: number, nombre_colaborador: string, cantidad_ventas: number, total_ventas: number) {
                this._id_colaborador = id_colaborador;
                this._nombre_colaborador = nombre_colaborador;
                this._cantidad_ventas = cantidad_ventas;
                this._total_ventas = total_ventas;
            }

            // Getters
            get id_colaborador(): number {
                return this._id_colaborador;
            }

            get nombre_colaborador(): string {
                return this._nombre_colaborador;
            }

            get cantidad_ventas(): number {
                return this._cantidad_ventas;
            }

            get total_ventas(): number {
                return this._total_ventas;
            }

            // Setters
            set id_colaborador(value: number) {
                this._id_colaborador = value;
            }

            set nombre_colaborador(value: string) {
                this._nombre_colaborador = value;
            }

            set cantidad_ventas(value: number) {
                this._cantidad_ventas = value;
            }

            set total_ventas(value: number) {
                this._total_ventas = value;
            }
        }

        export default VentaColaboradorDTO;
