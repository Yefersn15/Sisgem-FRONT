# SisGem - Sistema de Gestión Comercial

Este proyecto es una aplicación web de comercio electrónico (e-commerce) desarrollada con React + Vite. Permite gestionar una tienda en línea con catálogo de productos, carrito de compras, pedidos, sistema de usuarios y panel de administración.

> **Nota**: La documentación detallada del API REST se encuentra en `../API_PROYECTO/README.md`

---

## Configuración de conexión al API remoto

El frontend se conecta a la API mediante variables de entorno de Vite:

- `VITE_API_BASE_URL` — URL base del API. Si no se define, `src/services/dataService.js` usa `http://localhost:3000` en desarrollo (`vite dev`) y `https://sisgem-api.onrender.com` en producción como valores por defecto.
- `VITE_USE_REMOTE_API` — Variable heredada (`true`/`false`). Actualmente **no tiene efecto** en el comportamiento de la app: todas las peticiones (productos, categorías, marcas, carrito, pedidos, etc.) se hacen siempre contra la API a través de `dataService`; ya no existen fallbacks de datos en LocalStorage.

Agrega estas variables en un archivo `.env.local` en la raíz del proyecto. El repositorio no incluye actualmente un archivo `.env.example`.

---

## Funcionamiento del Proyecto

### 1. Home (Página Principal)

La página de inicio (`/`) es el punto de entrada principal de la tienda. Muestra:

- **Banners publicitarios**: Carrusel de imágenes rotativas con controles de navegación. Los administradores pueden agregar, editar y eliminar banners desde esta sección (requiere permiso "Banners").
- **Marcas**: Carrusel infinito con los logos de las marcas disponibles. Al hacer clic, navega a `/productos/por-marca/:id` para filtrar productos por marca.
- **Productos Destacados**: Muestra los 6 productos más recientes (ordenados por fecha de creación). Cada producto se muestra como una tarjeta con su imagen. Al hacer clic, abre un modal con:
  - Nombre del producto
  - Categoría y marca (como enlaces navegables)
  - Código único
  - Precio formateado
  - Stock disponible
  - Descripción completa
  - Selector de cantidad
  - Botón para agregar al carrito

### 2. Productos

La página de productos (`/productos`) muestra el catálogo completo con:

- **Barra de búsqueda**: Búsqueda en tiempo real (con debounce de 500ms) que filtra por nombre o descripción.
- **Filtros y ordenamiento**:
  - Ir a Categorías o Marcas
  - Ordenar por nombre (A-Z / Z-A), precio (menor a mayor / mayor a menor), o stock.
- **Grid de productos**: Tarjetas con imagen, nombre, descripción corta, precio y stock. Muestra badge de "Agotado" si no hay stock.
- **Modal de producto**: Al hacer clic en una tarjeta, abre un modal con detalles completos, permitiendo seleccionar cantidad y agregar al carrito.

**Productos por Categoría** (`/productos/por-categoria/:id`): Filtra los productos de una categoría específica.

**Productos por Marca** (`/productos/por-marca/:id`): Filtra los productos de una marca específica.

### 3. Marcas

Ya no existe una página pública independiente de listado de marcas: la ruta `/marcas` redirige automáticamente a `/productos`. La navegación por marca se hace desde el carrusel de marcas del Home y desde los enlaces de marca del modal de producto, que llevan a `/productos/por-marca/:id`.

Existe el panel de administración de marcas (`/admin/marcas`) para crear, editar y gestionar marcas, y una vista de detalle de marca en `/marcas/:id` (protegida, requiere el permiso "Marcas").

### 4. Categorías

Al igual que Marcas, ya no existe una página pública `/categorias`: la ruta redirige a `/productos`. La navegación por categoría se hace desde los enlaces de categoría del modal de producto, que llevan a `/productos/por-categoria/:id`.

Existe el panel de administración de categorías (`/admin/categorias`) para crear, editar y gestionar categorías.

### 5. Carrito de Compras

El carrito (`/carrito`) permite gestionar los productos seleccionados:

- **Lista de productos**: Muestra imagen, nombre, descripción, precio unitario, selector de cantidad (con límites de stock), y botón de eliminar.
- **Validación**: Impide agregar más cantidad de la disponible en stock.
- **Resumen**: Muestra el total de productos y el subtotal.
- **Acciones**:
  - "Proceder al pago": Navega al checkout.
  - "Vaciar carrito": Limpia todos los items (con confirmación).

El carrito funciona mediante el contexto `CartContext` que gestiona el estado global de los items agregados.

### 6. Registro de Usuario

La página de registro (`/register`) permite crear una nueva cuenta con:

- **Información Personal**: Nombre, apellido, tipo de documento (CC, CE, NIT, PAS), número de documento, género.
- **Información de Contacto**: Dirección, barrio.
- **Credenciales**: Email y contraseña.
- **Validaciones**:
  - Las contraseñas deben coincidir.
  - Mínimo 6 caracteres en la contraseña.
- Al completar el registro, redirige al login para iniciar sesión.

### 7. Inicio de Sesión

La página de login (`/login`) permite autenticar usuarios:

- **Credenciales**: Email y contraseña.
- **Comportamiento**: Tras iniciar sesión exitosamente, redirige a la página original que intentó acceder (protected route).
- **Opciones adicionales**:
  - Link a registro para nuevos usuarios.
  - Link a recuperación de contraseña.

#### 7.1 Recuperación de Contraseña

El flujo tiene dos pasos, contra los endpoints reales del backend (`POST /api/auth/forgot-password` y `POST /api/auth/reset-password`, ver `src/pages/auth/hooks/useForgotPasswordForm.js` y `useResetPasswordForm.js`):

1. **Solicitar recuperación** (`/forgot-password`): el usuario ingresa su email (validado con una expresión regular antes de enviarlo). Sin importar si la cuenta existe o no, la app siempre muestra el mismo mensaje genérico ("Si el correo está registrado, recibirás un enlace...") — este comportamiento lo define el backend a propósito, para no revelar qué correos están registrados en el sistema.
2. **Restablecer contraseña** (`/reset-password?token=...`): el enlace enviado por correo trae un token de un solo uso (válido 1 hora). La página valida que la nueva contraseña tenga al menos 6 caracteres y coincida con su confirmación, y envía el `token` junto con la nueva contraseña al backend. Si el token es inválido o expiró, se muestra el error devuelto por la API con opción de solicitar un enlace nuevo.

El envío real del correo lo hace el backend (SMTP vía `nodemailer`); el frontend no tiene lógica de envío, solo consume los dos endpoints.

### 8. Checkout (Confirmar Pedido)

El checkout (`/checkout`) es el proceso de confirmación del pedido:

- **Verificación de autenticación**: Requiere que el usuario haya iniciado sesión.
- **Selección de entrega**:
  - **Recoger en tienda**: Para ventas mostrador.
  - **Solicitar Domicilio**: Para delivery a la dirección del cliente.
- **Gestión de direcciones**:
  - Lista de direcciones guardadas.
  - Opción de agregar nueva dirección.
  - Datos de dirección, barrio y teléfono.
- **Métodos de pago**: Efectivo, Transferencia, Abono.
- **Notas adicionales**: Campo para notas al repartidor (si es domicilio).
- **Resumen del pedido**: Lista de productos con cantidades y precios, subtotal, envío (si aplica), y total.
- **Confirmación**: Al confirmar, se crea el pedido y se redirige a la página de detalles del pedido.

### 9. Pedidos y Pagos del Cliente

No existe una ruta `/pedidos` o `/mis-pedidos` con un listado propio: el historial del cliente se consulta desde **Mis Pagos y Abonos** (`/mis-pagos`, con alias `/ventas`), a la que se accede desde el menú de usuario del Header:

- **Tabla de pedidos/ventas**: Muestra ID, fecha, total, saldo pendiente (cuando es un abono), método de pago, estado y tipo de entrega.
- **Filtros**: Por búsqueda (ID o método de pago) y por estado de pago (Pendiente/Pagado).
- **Estados del pedido**: Pendiente, Aprobado, Asignado, En camino, Entregado, Recibido, Cancelado, Anulado.
- **Detalle del pedido**: Al hacer clic en "Ver", navega a `/pedidos/:id` (o `/ventas/:id`, ambas rutas usan el mismo componente `VentaDetails`) para ver el detalle completo, la línea de tiempo del domicilio y la gestión de abonos.

### 10. Panel de Administración

El admin se sirve bajo `/admin/*` con un layout propio (`AdminLayout`, en `src/components/AdminLayout.jsx`) que permite alternar entre modo barra lateral y modo barra superior (`LayoutModeSwitcher`). Incluye:

- **Dashboard** (`/admin`): Panel principal con estadísticas, gráficas (Recharts) y accesos rápidos.
- **Ventas** (`/admin/ventas`): Lista de todas las ventas realizadas.
- **Pedidos** (`/admin/pedidos`): Gestión de pedidos de clientes.
- **Domicilios** (`/admin/domicilios`): Gestión de entregas a domicilio.
- **Pagos** (`/admin/pagos`): Control de pagos y abonos.
- **Usuarios** (`/admin/usuarios`): Lista y gestión de usuarios del sistema.
- **Roles** (`/admin/roles`): Gestión de roles y permisos.
- **Categorías** (`/admin/categorias`): CRUD completo de categorías.
- **Marcas** (`/admin/marcas`): CRUD completo de marcas.
- **Productos** (`/admin/productos`): CRUD completo de productos.
- **Banners** (`/admin/banners`): CRUD de los banners publicitarios del Home, con selector de plantilla/layout, posicionamiento de texto y subida de imágenes.

### 11. Sistema de Roles y Permisos

El sistema cuenta con un mecanismo de permisos que protege las rutas mediante el componente `PrivateRoute` y `AuthContext.hasPermission`:

- **Rutas públicas**: Home, Productos (listado y filtros por marca/categoría), Carrito, Login, Register.
- **Rutas protegidas**: Requieren autenticación y, en la mayoría de rutas administrativas, un permiso de módulo específico. Los usuarios con rol ADMIN tienen acceso a todo.
- **Módulos usados para proteger rutas**: `Ventas`, `Inventario` (agrupa productos/marcas/categorías del admin), `Usuarios`, `Configuración` (roles) y `Banners`, además de `Productos`, `Marcas` y `Categorías` para algunas rutas públicas de creación/edición.
- **Roles**: El administrador puede crear y editar roles (`/admin/roles`) asignando permisos granulares con formato `modulo.accion` (por ejemplo `ventas.read`, `productos.write`, `reportes.read`).

### 12. Perfil de Usuario

En `/perfil` el usuario puede:

- Ver su información personal.
- Editar sus datos.
- Cambiar contraseña (`/cambiar-password`).

---

## Procesos del Sistema

### Proceso 1: Flujo de Pedido a Venta

El sistema maneja dos estados principales para las transacciones: **Pedido** y **Venta**. Este proceso explica cómo un pedido del cliente se convierte eventualmente en una venta confirmada.

El flujo varía según el tipo de entrega y el método de pago seleccionados por el cliente en el Checkout:

#### Tipos de Entrega

1. **Recoger en tienda (Mostrador)**: El cliente paga y retira el producto en la tienda física.
2. **Solicitar Domicilio (Delivery)**: El producto se entrega en la dirección del cliente.

#### Métodos de Pago

1. **Efectivo**: Pago inmediato al recibir o retirar el producto.
2. **Transferencia**: Pago por transferencia bancaria inmediata.
3. **Abono**: Pago a crédito/partial - el cliente paga una parte inicial y el resto después.

---

#### Escenario A: Pedido por Mostrador (Pago en Tienda)

Este es el flujo para pedidos donde el cliente choose "Recoger en tienda".

**Paso 1: Creación del Pedido**
1. El cliente agrega productos al carrito.
2. En Checkout selecciona "Recoger en tienda".
3. Selecciona método de pago: Efectivo, Transferencia o Abono.
4. Confirma el pedido → Estado: **Pendiente**.

**Paso 2: Gestión del Pedido**
- El administrador видит el pedido en `/admin/pedidos`.
- Si el método es Efectivo/Transferencia:
  - El cliente llega a la tienda, paga y el administrador cambia el estado a **"Entregado"**.
  - El administrador puede convertir a Venta inmediatamente (estado "Completada").
- Si el método es Abono:
  - El administrador debe aprobar o rechazar el abono.
  - Al aprobar → Estado: **"Aprobado"**.
  - El cliente paga el abono inicial en tienda.
  - Cuando el cliente completa el pago total → Estado: **"Recibido"** → Se convierte en Venta.

**Conversión a Venta**:
- Para Efectivo/Transferencia: Cuando el estado es **"Entregado"**.
- Para Abono: Cuando el estado es **"Recibido"** Y el total pagado ≥ total del pedido.

---

#### Escenario B: Pedido por Domicilio (Delivery)

Este es el flujo para pedidos donde el cliente choose "Solicitar Domicilio".

**Paso 1: Creación del Pedido**
1. El cliente agrega productos al carrito.
2. En Checkout selecciona "Solicitar Domicilio".
3. Ingresa/selecciona dirección de entrega y teléfono.
4. Selecciona método de pago: Efectivo, Transferencia o Abono.
5. Confirma el pedido → Estado: **Pendiente**.

**Paso 2: Gestión del Pedido (Administrador)**
El administrador ve el pedido en `/admin/pedidos` y gestiona el ciclo de vida del domicilio:

1. **Pendiente**: El pedido llegó, esperando revisión.
2. **Aprobado**: El administrador aprueba el pedido.
3. **En preparación**: Se prepara el pedido para envío.
4. **Asignado**: Se asigna un repartidor/domiciliario.
5. **En camino**: El repartidor está en ruta de entrega.
6. **Entregado**: El pedido llegó al cliente.
7. **Recibido**: El cliente confirma recepción (requerido para abonos).

**Gestión de Pagos por Domicilio**:
- **Efectivo**: El cliente paga al repartidor cuando recibe el pedido. El repartidor reporta el pago y el administrador cambia el estado a "Entregado".
- **Transferencia**: El cliente paga por transferencia antes de la entrega. El administrador verifica y aprueba el pedido.
- **Abono**: 
  - El cliente paga un abono inicial.
  - El administrador debe aprobar el abono → Estado "Aprobado".
  - El resto se paga al recibir el producto.
  - Cuando el cliente paga el total → Estado "Recibido" → Se convierte en Venta.

**Notas adicionales**: El cliente puede agregar notas para el repartidor (instrucciones de entrega, timbres, etc.).

**Conversión a Venta**:
- Para Efectivo/Transferencia: Cuando el estado es **"Entregado"**.
- Para Abono: Cuando el estado es **"Recibido"** Y el total pagado ≥ total del pedido.

---

#### Escenario C: Pedido con Método de Pago "Abono"

El método "Abono" es un pago a crédito/partial donde el cliente no paga el total inmediatamente.

**Flujo del Abono**:

1. **Solicitud de Abono**: El cliente selecciona "Abono" en el Checkout → El pedido queda en estado **"Pendiente"** esperando aprobación del administrador.

2. **Aprobación del Abono** (por el admin):
   - El administrador recibe una notificación del abono pendiente.
   - Debe revisar y decidir:
     - **Aprobar**: El pedido pasa a estado **"Aprobado"** y el abono inicial se registra.
     - **Rechazar**: El pedido se marca como **"Cancelado"**.

3. **Registro de Abonos Parciales**:
   - El administrador puede registrar abonos parciales desde `/admin/pagos`.
   - Cada abono se registra con: monto, fecha, método, referencia.
   - El sistema calcula automáticamente:
     - Total vendido
     - Total pagado
     - Saldo pendiente

4. **Seguimiento del Pago**:
   - En `/admin/pagos` se visualiza:
     - Total de la venta
     - Total pagado hasta el momento
     - Saldo pendiente
   - El cliente puede ver el estado de sus abonos en `/mis-pagos`.

5. **Conversión a Venta**:
   - El pedido solo se convierte en venta cuando:
     - El estado del pedido es **"Recibido"** (cliente recibió y confirmó)
     - El total pagado es **mayor o igual** al total del pedido
   - Al convertir → El estado de la venta es **"Completada"**.

---

#### Resumen de Estados y Conversión

| Método de Pago | Estados Requeridos para Convertir a Venta |
|----------------|------------------------------------------|
| Efectivo | Pendiente → Aprobado → ... → **Entregado** |
| Transferencia | Pendiente → Aprobado → ... → **Entregado** |
| Abono | Pendiente → Aprobado → ... → **Recibido** + **Total pagado ≥ Total** |

**Estados del Pedido**:
- **Pendiente**: Esperando confirmación/aprobación
- **Aprobado**: Aprobado por el administrador
- **En preparación**: Preparando el pedido
- **Asignado**: Asignado a un repartidor
- **En camino**: En tránsito hacia el cliente
- **Entregado**: Entregado al cliente (para pagos inmediatos)
- **Recibido**: Cliente confirmó recepción (para abonos)
- **Cancelado**: Cancelado por el cliente o administrador
- **Anulado**: Anulado completamente

---

#### Gestión de Pagos/Abonos (Admin)

El sistema permite control de pagos desde `/admin/pagos`:

1. **Registro de pagos**: El administrador puede registrar pagos/abonos para cualquier venta.
2. **Estados de pago**: Pendiente, Aplicado, Rechazado, Anulado.
3. **Seguimiento**:
   - Muestra el total de la venta
   - Muestra el total pagado
   - Calcula el saldo pendiente
4. **Exportación/Importación**: Permite exportar e importar registros de pagos en Excel.

---

### Proceso 2: Creación de Venta Directa (Administrador)

El administrador también puede crear ventas directamente desde `/admin/ventas`:

1. **Nueva Venta**: Botón para abrir formulario.
2. **Datos de la venta**:
   - Método de pago.
   - Si es delivery, indicar dirección y teléfono.
   - Agregar productos manualmente (nombre, cantidad, precio).
3. **Guardar**: Crea la venta directamente en estado "Completada" o "Pendiente".

---

### Proceso 3: Gestión de Usuarios y Roles

1. **Registro de cliente**: El cliente se registra en `/register` con datos personales y credenciales.
2. **Login**: El cliente inicia sesión en `/login`.
3. **Roles**: El administrador crea roles en `/admin/roles` con permisos específicos:
   - **Permisos de módulo**: Inventario (productos/marcas/categorías en el admin), Productos, Marcas, Categorías, Ventas, Usuarios, Configuración, Reportes, Banners.
4. **Protección de rutas**: Las rutas administrativas verifican que el usuario tenga el permiso correspondiente.

---

### Proceso 4: Catálogo de Productos

1. **Marca y Categoría**: Primero se crean marcas y categorías desde el panel admin.
2. **Producto**: Se crea el producto asignándole marca y categoría.
3. **Visualización**: Los productos aparecen en el Home (los 6 más recientes), en `/productos`, y filtrados por categoría o marca.

---

## Rutas del Sistema

La aplicación tiene dos árboles de rutas independientes montados en `src/App.jsx`: `/admin/*` (resuelto por `AdminLayout`, en `src/components/AdminLayout.jsx`) y `/*` (resuelto por `Layout` + `Rutas`, en `src/components/Rutas.jsx`, para tienda/cliente).

### Rutas Públicas y de Tienda

| Ruta | Descripción |
|------|-------------|
| `/` | Home - Página principal |
| `/productos` | Catálogo de productos |
| `/productos/:id`, `/productos/ver/:id` | Detalle de producto (requiere permiso "Productos") |
| `/productos/nuevo` | Crear producto (requiere permiso "Productos") |
| `/productos/editar/:id` | Editar producto (requiere permiso "Productos") |
| `/productos/por-categoria/:id` | Productos filtrados por categoría |
| `/productos/por-marca/:id` | Productos filtrados por marca |
| `/marcas` | Redirige a `/productos` |
| `/marcas/:id` | Detalle de marca (requiere permiso "Marcas") |
| `/marcas/nueva`, `/marcas/editar/:id` | Crear / editar marca (requiere permiso "Marcas") |
| `/categorias` | Redirige a `/productos` |
| `/categorias/nueva`, `/categorias/editar/:id` | Crear / editar categoría (requiere permiso "Categorías") |
| `/carrito` | Carrito de compras |
| `/checkout` | Confirmar pedido |

### Autenticación y Cuenta

| Ruta | Descripción |
|------|-------------|
| `/login` | Iniciar sesión (solo invitados) |
| `/register` | Registro de usuario (solo invitados) |
| `/forgot-password` | Solicitar recuperación de contraseña (solo invitados) |
| `/reset-password` | Restablecer contraseña (solo invitados) |
| `/auth-router` | Redirección post-login según el rol del usuario |
| `/perfil` | Perfil del usuario (requiere sesión) |
| `/cambiar-password` | Cambiar contraseña (requiere sesión) |
| `/ventas`, `/mis-pagos` | Mis Pagos y Abonos - historial de pedidos/ventas del cliente (requiere sesión) |
| `/ventas/:id`, `/pedidos/:id` | Detalle de un pedido/venta (componente `VentaDetails`) |

### Panel de Administración (bajo `/admin`)

Todas requieren sesión; las que indican un permiso están protegidas además por ese módulo (los usuarios ADMIN acceden a todas).

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard con estadísticas y gráficas (permiso "Ventas") |
| `/admin/ventas` | Administración de ventas (permiso "Ventas") |
| `/admin/pedidos` | Administración de pedidos (permiso "Ventas") |
| `/admin/domicilios` | Administración de domicilios (permiso "Ventas") |
| `/admin/pagos`, `/admin/pagos/nuevo`, `/admin/pagos/:id` | Administración de pagos/abonos (permiso "Ventas") |
| `/admin/productos` | Administración de productos (permiso "Inventario") |
| `/admin/marcas` | Administración de marcas (permiso "Inventario") |
| `/admin/categorias` | Administración de categorías (permiso "Inventario") |
| `/admin/banners`, `/admin/banners/nuevo`, `/admin/banners/editar/:id` | Administración de banners del Home (permiso "Banners") |
| `/admin/usuarios`, `/admin/usuarios/nuevo`, `/admin/usuarios/editar/:id` | Administración de usuarios (permiso "Usuarios") |
| `/admin/roles`, `/admin/roles/nuevo`, `/admin/roles/editar/:id` | Administración de roles y permisos (permiso "Configuración") |

---

## API del Proyecto

### Conexión al API

El frontend Sisgem se conecta a la API REST del proyecto `API_PROYECTO`. La comunicación se realiza mediante el servicio `dataService` que utiliza Fetch API para realizar peticiones HTTP.

#### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base del API | `http://localhost:3000` en desarrollo, `https://sisgem-api.onrender.com` en producción |
| `VITE_USE_REMOTE_API` | Variable heredada, sin efecto actual en el comportamiento de la app | `false` |

#### Funcionamiento del dataService

El archivo `src/services/dataService.js` centraliza todas las peticiones al API a través de una única función `request(path, options)` (no hay métodos `get/post/put/...` separados):

```javascript
export const request = async (path, options = {}) => {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const headers = {
    'Content-Type': 'application/json', // se omite si el body es FormData
    ...(options.headers || {}),
  };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  // La API responde { success, message, data }; request() devuelve solo `data`
  // y lanza un Error (con `err.status`) si `success` es false o la respuesta no es 2xx.
};
```

Todas las funciones exportadas por `dataService` (`getProductos`, `createPedido`, `getPagos`, etc.) usan internamente `request()` indicando el `method` y, si aplica, el `body`.

#### Autenticación

El frontend maneja autenticación JWT mediante `AuthContext`:

1. **Login**: Envía credenciales a `/api/auth/login`
2. **Registro**: Envía datos a `/api/auth/register`
3. **Token**: Se almacena en localStorage y se incluye en todas las peticiones protegidas

**Estructura del token:**
```javascript
// Header de Authorization
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Endpoints Consumidos

| Módulo | Endpoint | Métodos |
|--------|----------|---------|
| Auth | `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/change-password`, `/api/auth/forgot-password`, `/api/auth/reset-password` | POST, GET |
| Usuarios | `/api/usuarios`, `/api/usuarios/:id`, `/api/usuarios/:id/estado`, `/api/usuarios/email/:email` | GET, POST, PUT, PATCH, DELETE |
| Direcciones | `/api/usuarios/direcciones`, `/api/usuarios/direcciones/:id` | GET, POST, PUT, DELETE |
| Productos | `/api/productos`, `/api/productos/:id`, `/api/productos/:id/estado`, `/api/productos/export` | GET, POST, PUT, PATCH, DELETE |
| Categorías | `/api/categorias`, `/api/categorias/:id`, `/api/categorias/:id/estado`, `/api/categorias/export` | GET, POST, PUT, PATCH, DELETE |
| Marcas | `/api/marcas`, `/api/marcas/:id`, `/api/marcas/:id/estado`, `/api/marcas/export` | GET, POST, PUT, PATCH, DELETE |
| Pedidos / Ventas | `/api/pedidos`, `/api/pedidos/mis-pedidos`, `/api/pedidos/ventas`, `/api/pedidos/:id`, `/api/pedidos/:id/estado`, `/api/pedidos/:id/convertir-venta`, `/api/pedidos/:id/aprobar`, `/api/pedidos/:id/rechazar-abono` | GET, POST, PUT, PATCH, DELETE |
| Pagos | `/api/pagos`, `/api/pagos/:id`, `/api/pagos/:id/estado` | GET, POST, PUT, PATCH, DELETE |
| Domicilios | `/api/domicilios`, `/api/domicilios/:id/estado`, `/api/domicilios/:id/convertir`, `/api/domicilios/:id/tarifa`, `/api/domicilios/:id/repartidor` | GET, POST, PUT, PATCH |
| Tarifas de Domicilio | `/api/tarifas-domicilio`, `/api/tarifas-domicilio/:id` | GET, POST, PUT, DELETE |
| Carrito | `/api/carrito`, `/api/carrito/items`, `/api/carrito/items/:id` | GET, POST, PUT, DELETE |
| Dashboard | `/api/dashboard` | GET |
| Banners | `/api/banners`, `/api/banners/:id` | GET, POST, PUT, DELETE |
| Roles | `/api/roles`, `/api/roles/:id`, `/api/roles/seed` | GET, POST, PUT, DELETE |
| Subida de imágenes | `/api/upload` (Cloudinary) | GET, POST, DELETE |

#### Manejo de Errores

El dataService maneja errores HTTP comunes:

| Código | Acción en Frontend |
|--------|-------------------|
| 401 | Redirigir a login, limpiar token |
| 403 | Mostrar mensaje "No tienes permiso" |
| 404 | Mostrar "Recurso no encontrado" |
| 500 | Mostrar "Error del servidor" |

#### Uso de LocalStorage

El proyecto ya no usa LocalStorage como fallback de datos de negocio: productos, categorías, marcas, pedidos, pagos y el carrito del cliente siempre se leen y escriben contra la API (la variable `VITE_USE_REMOTE_API` está definida pero no cambia este comportamiento). LocalStorage se usa únicamente para:

- **Sesión**: token JWT y datos del usuario (`auth_token`, `auth_user`).
- **Preferencia de tema** claro/oscuro (`theme`).

---

## Tecnologías Utilizadas

- **Frontend**: React 19 + Vite
- **Enrutamiento**: React Router DOM 7
- **Estilos**: Bootstrap 5 + CSS personalizado
- **Iconos**: Font Awesome (`@fortawesome/fontawesome-free`)
- **Estado global**: React Context (AuthContext, CartContext)
- **HTTP Client**: Fetch API con `dataService`
- **Gráficas**: Recharts, usado en el Dashboard de administración (`src/pages/dashboard/AdminDashboard.jsx`) para ventas por período y rankings (top productos/marcas/categorías)
- **Excel**: `xlsx`, usado en `dataService` para importar y exportar catálogos completos (productos, categorías, marcas, usuarios, pagos, domicilios, ventas) desde/hacia archivos `.xlsx`
- **Descarga de archivos**: `file-saver`, usado junto con `xlsx` para generar y descargar los archivos Excel exportados
- **Generación de PDF**: `html2pdf.js`, usado en `src/services/printService.js` como respaldo para generar/descargar el voucher de una venta cuando el navegador bloquea la ventana de impresión
- **Linting**: ESLint 9

---

## Estructura del Proyecto

```
src/
├── assets/            # Imágenes estáticas
├── components/        # Componentes reutilizables y layouts
│   ├── admin/           # Navegación del admin (AdminSidebarNav, AdminTopNav, LayoutModeSwitcher, navConfig)
│   ├── AdminLayout.jsx  # Layout y rutas internas de /admin/*
│   ├── Layout.jsx       # Layout público (Header + Footer)
│   ├── Header.jsx / Footer.jsx
│   ├── Rutas.jsx        # Rutas públicas / tienda (montadas en /*)
│   ├── PrivateRoute.jsx # Guard de autenticación y permisos
│   └── ImageUploadField.jsx / ImageGalleryModal.jsx  # Subida y selección de imágenes (Cloudinary)
├── context/           # Contextos (AuthContext, CartContext)
├── hooks/             # Hooks compartidos (useDebounce, useAdminLayoutMode, useImageUpload)
├── pages/             # Páginas del sistema, organizadas por módulo
│   ├── auth/            # Login, ForgotPassword, ResetPassword
│   ├── banners/         # CRUD de banners del Home (services/, hooks/, components/)
│   ├── carrito/         # Carrito y Checkout (services/, hooks/, components/)
│   ├── categorias/      # Categorías (público y admin) (services/, hooks/, components/)
│   ├── dashboard/       # Dashboard admin (services/, hooks/, components/)
│   ├── domicilios/      # Domicilios admin y "Mis Domicilios" (services/, hooks/, components/)
│   ├── home/            # Home (services/, hooks/, components/)
│   ├── marcas/          # Marcas (público y admin) (services/, hooks/, components/)
│   ├── pagos/           # Pagos admin y "Mis Pagos" (hooks/)
│   ├── pedidos/         # Pedidos admin (services/, hooks/, components/)
│   ├── productos/       # Productos (services/, hooks/, components/)
│   ├── roles/           # Roles y permisos (services/, hooks/, components/)
│   ├── usuarios/        # Usuarios, Perfil, Registro, Cambiar contraseña
│   └── ventas/          # Ventas y detalle de venta/pedido (services/, hooks/, components/)
├── services/          # dataService (API + Excel) y printService (voucher en PDF)
└── main.jsx           # Punto de entrada
```

> La mayoría de los módulos dentro de `pages/` siguen el mismo patrón: el componente de página en la raíz del módulo, con subcarpetas `services/` (llamadas a `dataService`), `hooks/` (lógica de estado) y `components/` (piezas de UI del propio módulo).
