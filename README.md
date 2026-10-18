<div align="center">

<img src="./public/logo.png" alt="TatSoft" width="180" />

# Microservicio de Preventas, Ventas y Devoluciones

**API REST para la gestión del ciclo comercial: preventas, confirmación de ventas, devoluciones, facturación y estadísticas.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539?logo=openapiinitiative&logoColor=white)](./swagger.yaml)
[![GitHub](https://img.shields.io/badge/GitHub-tatsoft--sales--service-181717?logo=github&logoColor=white)](https://github.com/JhoamSebastianMunoz/tatsoft-sales-service)

</div>

---

## Descripción

Microservicio backend desarrollado en **TypeScript + Express** que centraliza la operación comercial de la plataforma TatSoft. Gestiona el flujo completo desde la creación de una **preventa**, su **confirmación como venta**, el registro de **devoluciones**, la **generación de facturas en PDF** y la consulta de **métricas y reportes**.

Se integra con otros microservicios (clientes, productos y usuarios) vía HTTP para enriquecer la información, y persiste los datos en **MySQL**.

## Características

- **Preventas**: crear, listar, consultar por ID, actualizar, agregar productos, cancelar, confirmar y eliminar.
- **Ventas**: listado, detalle y consulta por preventa confirmada.
- **Devoluciones**: listado, detalle y consulta por preventa.
- **Facturación**: generación y descarga de facturas en PDF (`pdfkit`).
- **Reportes y estadísticas**: ventas por colaborador, top de clientes y productos más/menos vendidos.
- **Seguridad**: autenticación con JWT y control de acceso por rol (`ADMINISTRADOR`, `COLABORADOR`).
- **Validación**: validación de peticiones con `express-validator`.
- **Documentación**: Swagger UI interactiva servida en `/api-docs`.

## Stack tecnológico

| Categoría | Tecnología |
| --- | --- |
| Lenguaje | TypeScript |
| Runtime | Node.js 18.x |
| Framework | Express 4 |
| Base de datos | MySQL (`mysql2`) |
| Autenticación | JSON Web Tokens (`jsonwebtoken`) |
| Documentación | OpenAPI 3.0 + Swagger UI |
| PDF | PDFKit |
| Cliente HTTP | Axios |
| Validación | express-validator |

## Arquitectura del proyecto

El código sigue una arquitectura por capas que separa responsabilidades:

```
.
├── app.ts                  # Punto de entrada, configuración de Express, CORS, Swagger y health check
├── config/                 # Conexión a la base de datos (pool de MySQL)
├── routes/                 # Definición de rutas y middlewares por dominio
├── controllers/            # Manejo de request/response (preventas, ventas, devoluciones, facturas, reportes)
├── services/               # Lógica de negocio y orquestación con otros microservicios
├── repositories/           # Acceso a datos y consultas SQL
├── Dto/                    # Objetos de transferencia de datos
├── middleware/             # verifyToken, control de roles/permisos y validadores
├── Helpers/                # Utilidades (validación de tokens)
├── public/                 # Recursos estáticos (logo)
├── swagger.yaml            # Especificación OpenAPI
└── web.config              # Configuración de IIS para el despliegue en Azure
```

> [!NOTE]
> El servicio se comunica con microservicios externos de **clientes**, **productos** y **usuarios** mediante variables de entorno para completar los datos que devuelve la API.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18.x o superior
- [npm](https://www.npmjs.com/)
- Una instancia de **MySQL** accesible

## Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=10000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=microservicioPreventasVentasDevoluciones
DB_SSL=false

# Seguridad
JWT_SECRET=tu_secreto_jwt

# Microservicios externos
CLIENT_SERVICE_URL=http://localhost:3000/clients/
PRODUCT_SERVICE_URL=http://localhost:3000/products/
USER_SERVICE_URL=http://localhost:3000/users/
PRODUCT_SERVICE_URL_ACTUALIZAR_CANTIDAD=http://localhost:3000/products/stock/
```

> [!IMPORTANT]
> El archivo `.env` está excluido del control de versiones. Nunca subas credenciales al repositorio.

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/JhoamSebastianMunoz/tatsoft-sales-service.git
cd tatsoft-sales-service

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Iniciar el servidor
npm start
```

El servicio quedará disponible en `http://localhost:10000` (o el puerto definido en `PORT`).

## Base de datos

El esquema inicial se encuentra en [`dbMicroservicioPreventasVentasDevoluciones.sql`](./dbMicroservicioPreventasVentasDevoluciones.sql). Incluye las tablas `preventas` y `detalle_preventa`, con sus relaciones y estados (`Pendiente`, `Confirmada`, `Cancelada`, `vendido`, `devuelto`).

```bash
mysql -u root -p < dbMicroservicioPreventasVentasDevoluciones.sql
```

## Documentación de la API

La documentación interactiva está disponible con el servidor en marcha:

- **Swagger UI**: `http://localhost:10000/api-docs`
- **Especificación OpenAPI**: [`swagger.yaml`](./swagger.yaml)

### Endpoints principales

Todas las rutas (excepto el health check) requieren un token JWT en la cabecera `Authorization: Bearer <token>`.

**Health check**

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Estado del servicio |

**Preventas** — rol `ADMINISTRADOR`, `COLABORADOR`

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/registerPresale` | Registrar una preventa |
| POST | `/addProductsPresale/:id_presale` | Agregar productos a una preventa |
| GET | `/getAllPresales` | Listar preventas |
| GET | `/getPresaleById/:id_presale` | Consultar preventa por ID |
| GET | `/detailsPresale/:id_preventa` | Detalle completo de la preventa |
| PUT | `/cancelPreventa/:id_presale` | Cancelar una preventa |
| PUT | `/confirmPresale/:id_presale` | Confirmar preventa (genera venta) |
| PUT | `/updatePresale/:id_preventa` | Actualizar preventa |
| DELETE | `/deletePresale/:id_preventa` | Eliminar preventa |

**Ventas** — rol `ADMINISTRADOR`, `COLABORADOR`

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/getAllSales` | Listar ventas |
| GET | `/getSaleDetails/:id_presale` | Detalle de la venta |
| GET | `/getByIdSale/:id_presale` | Consultar venta por ID |

**Devoluciones** — rol `ADMINISTRADOR`, `COLABORADOR`

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/getAllRefund` | Listar devoluciones |
| GET | `/getRefundDetails/:id_presale` | Detalle de la devolución |
| GET | `/getByIdRefund/:id_presale` | Consultar devolución por ID |

**Facturación**

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/invoiceDownload/:id_preventa` | Generar y descargar la factura en PDF |

**Reportes**

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/ventas-por-colaborador` | Ventas por colaborador en un rango de fechas |
| GET | `/top-clientes` | Top de clientes |
| GET | `/top-productos-vendidos` | Top de productos más vendidos |
| GET | `/top-productos-menos-vendidos` | Top de productos menos vendidos |

## Despliegue

El proyecto cuenta con un flujo de **GitHub Actions** ([`.github/workflows/master_backendpresalessalereturns.yml`](./.github/workflows/master_backendpresalessalereturns.yml)) que compila la aplicación y la despliega en **Azure Web App** al hacer push a la rama `master`.

- **Frontend deployado**: `https://ambitious-sky-070d67b0f.4.azurestaticapps.net`
- **Backend (Azure Web App)**: `https://backendpresalessalereturns-g2cghudwf2emhnf4.eastus-01.azurewebsites.net`

> [!WARNING]
> **Despliegue en pausa**
>
> El pipeline de despliegue está **correctamente implementado y funcional**, pero actualmente se encuentra **pausado de forma temporal** debido a que el pago de los créditos de los servicios de **Azure** está suspendido momentáneamente. Por este motivo, tanto el frontend como el backend desplegados podrían no estar disponibles hasta que se restablezca la facturación de dichos servicios.
>
> El código, la configuración de despliegue y las integraciones permanecen intactos. Una vez reactivados los créditos de Azure, el flujo de CI/CD con GitHub Actions volverá a desplegar automáticamente con normalidad.

## Variables de CORS

Los orígenes permitidos se configuran directamente en [`app.ts`](./app.ts), e incluyen los entornos de desarrollo local y las URLs desplegadas en Azure.
