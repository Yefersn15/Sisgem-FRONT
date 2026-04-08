# SisGem - Sistema de Gestión Comercial

Este proyecto es una aplicación web de comercio electrónico (e-commerce) desarrollada con React + Vite. Permite gestionar una tienda en línea con catálogo de productos, carrito de compras, pedidos, sistema de usuarios y panel de administración.

---

## Configuración de conexión al API remoto

Para conectar el frontend con el API remoto (por ejemplo `https://sisgem-api.onrender.com`) utiliza variables de entorno de Vite:

- `VITE_API_BASE_URL` — URL base del API.
- `VITE_USE_REMOTE_API` — `true` o `false`. Si es `false`, el frontend usará los fallbacks locales (LocalStorage).

Agrega estas variables en un archivo `.env.local` en la carpeta `sisgem/` o usa el `.env.example` provisto.

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

Página pública (`/marcas`) que lista todas las marcas activas de la tienda. Cada marca es un enlace a la página de productos filtrados por esa marca.

Existe también el panel de administración de marcas (`/admin/marcas`) para crear, editar y gestionar marcas.

### 4. Categorías

Página pública (`/categorias`) que lista todas las categorías activas. Cada categoría es un enlace a la página de productos filtrados por esa categoría.

Existe también el panel de administración de categorías (`/admin/categorias`) para crear, editar y gestionar categorías.

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

### 9. Pedidos (Mis Pedidos)

La página de pedidos del cliente (`/mis-pedidos` o `/pedidos`) muestra el historial:

- **Tabla de pedidos**: Muestra ID, fecha, total, tipo (venta/pedido), estado, método de pago, tipo de entrega.
- **Filtros**: Por método de pago y búsqueda por ID, dirección, teléfono, estado.
- **Estados del pedido**: Pendiente, Aprobado, Asignado, En camino, Entregado, Recibido, Cancelado, Anulado.
- **Detalle del pedido**: Al hacer clic en "Ver", navega a `/pedidos/:id` para ver los detalles completos.

### 10. Panel de Administración

El admin (`/admin`) incluye múltiples secciones:

- **Dashboard** (`/admin`): Panel principal con estadísticas y métricas.
- **Ventas** (`/admin/ventas`): Lista de todas las ventas realizadas.
- **Pedidos** (`/admin/pedidos`): Gestión de pedidos de clientes.
- **Domicilios** (`/admin/domicilios`): Gestión de entregas a domicilio.
- **Pagos** (`/admin/pagos`): Control de pagos y abonos.
- **Usuarios** (`/admin/usuarios`): Lista y gestión de usuarios del sistema.
- **Roles** (`/admin/roles`): Gestión de roles y permisos.
- **Categorías** (`/admin/categorias`): CRUD completo de categorías.
- **Marcas** (`/admin/marcas`): CRUD completo de marcas.
- **Productos** (`/admin/productos`): CRUD completo de productos.

### 11. Sistema de Roles y Permisos

El sistema cuenta con un mecanismo de permisos que protege las rutas:

- **Rutas públicas**: Home, Productos, Marcas, Categorías, Carrito, Login, Register.
- **Rutas protegidas**: Requieren autenticación y/o permisos específicos según el módulo.
- **Roles**: El administrador puede crear y editar roles con permisos específicos.

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
   - **Permisos de módulo**: Productos, Marcas, Categorías, Proveedores, Compras, Ventas, Usuarios, Configuración, Reportes, Banners.
4. **Protección de rutas**: Las rutas administrativas verifican que el usuario tenga el permiso correspondiente.

---

### Proceso 4: Catálogo de Productos

1. **Marca y Categoría**: Primero se crean marcas y categorías desde el panel admin.
2. **Producto**: Se crea el producto asignándole marca y categoría.
3. **Visualización**: Los productos aparecen en el Home (los 6 más recientes), en `/productos`, y filtrados por categoría o marca.

---

### Proceso 5: Gestión de Proveedores y Órdenes de Compra

Este proceso permite gestionar la relación con proveedores y generar órdenes de compra para reabastecimiento de inventario.

#### 5.1 Proveedores

Los proveedores son las empresas o personas que surten productos a la tienda. Se gestionan desde `/proveedores`:

**Datos del proveedor**:
- Nombre / Razón social
- Tipo de persona: Natural o Jurídica
- Tipo de documento (CC, NIT, CE, Pasaporte)
- Número de documento
- Contacto (nombre de la persona de contacto)
- Teléfono (con código de país)
- Email
- Dirección
- Rubro (categoría del negocio)
- Logo (URL de imagen)
- Estado: Activo/Inactivo

**Funcionalidades**:
- CRUD completo de proveedores
- Activar/Desactivar proveedores
- Importar/Exportar proveedores desde Excel
- Ver detalle del proveedor con sus marcas y catálogo asociado
- Acceso directo al catálogo del proveedor

#### 5.2 Catálogo del Proveedor

Cada proveedor tiene un catálogo (`/proveedores/:id/catalogo`) que muestra dos tipos de items:

1. **Productos propios**: Productos que ya están registrados en la tienda (con stock actual)
2. **Items de catálogo**: Productos que el proveedor ofrece para comprar (precio sugerido de venta)

**Funcionalidades del catálogo**:
- Buscar productos por nombre, descripción, marca, categoría
- Filtrar por marca o categoría
- Agregar productos al carrito del proveedor
- **Pedir más stock**: Para productos propios con poco stock, permite crear una orden de compra directamente para reabastecimiento
- Importar/Exportar catálogo en Excel
- Agregar nuevos items al catálogo manualmente

#### 5.3 Órdenes de Compra

El sistema utiliza un **carrito separado por proveedor** (a diferencia del carrito de compras del cliente que es global).

**Flujo de creación de una orden**:

1. **Agregar items al carrito del proveedor**:
   - El admin navega al catálogo del proveedor (`/proveedores/:id/catalogo`)
   - Selecciona productos y hace clic en "Agregar a Orden"
   - Los items se guardan en el carrito de ese proveedor específico

2. **Crear la orden de compra**:
   - Va a `/ordenes/nueva` o directamente a `/proveedores/:id/orden`
   - Selecciona el proveedor (si viene desde la URL ya está seleccionado)
   - Visualiza los items del carrito del proveedor
   - Puede modificar cantidades o quitar items
   - Agrega notas/opciones (instrucciones de entrega, condiciones especiales)
   - Calcula el total automáticamente

3. **Enviar al proveedor**:
   - Al hacer clic en "Crear y Enviar por WhatsApp":
     - Se crea la orden de compra en el sistema
     - Se genera un mensaje de WhatsApp con:
       - ID de la orden
       - Lista de items (cantidad, nombre, precio unitario)
       - Total de la orden
       - Notas adicionales
     - Se abre WhatsApp con el mensaje listo para enviar
     - El carrito del proveedor se limpia

**Rutas relacionadas**:
- `/proveedores` - Lista de proveedores
- `/proveedores/nuevo` - Crear proveedor
- `/proveedores/:id` - Ver detalle del proveedor
- `/proveedores/:id/catalogo` - Catálogo del proveedor
- `/proveedores/:id/catalogo/nuevo` - Agregar item al catálogo
- `/proveedores/:id/orden` - Crear orden de compra (borrador)
- `/ordenes` - Lista de órdenes de compra
- `/ordenes/nueva` - Nueva orden de compra
- `/ordenes/:id` - Detalle de una orden de compra

---

## Rutas del Sistema

| Ruta | Descripción |
|------|-------------|
| `/` | Home - Página principal |
| `/productos` | Catálogo de productos |
| `/productos/por-categoria/:id` | Productos por categoría |
| `/productos/por-marca/:id` | Productos por marca |
| `/marcas` | Lista de marcas |
| `/categorias` | Lista de categorías |
| `/carrito` | Carrito de compras |
| `/checkout` | Confirmar pedido |
| `/pedidos` | Mis pedidos |
| `/pedidos/:id` | Detalle de pedido |
| `/login` | Iniciar sesión |
| `/register` | Registro de usuario |
| `/perfil` | Perfil del usuario |
| `/admin` | Panel de administración |
| `/admin/ventas` | Administración de ventas |
| `/admin/pedidos` | Administración de pedidos |
| `/admin/usuarios` | Administración de usuarios |
| `/admin/productos` | Administración de productos |
| `/admin/categorias` | Administración de categorías |
| `/admin/marcas` | Administración de marcas |

---

## Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Enrutamiento**: React Router DOM
- **Estilos**: Bootstrap 5 + CSS personalizado
- **Iconos**: Font Awesome
- **Estado global**: React Context (AuthContext, CartContext)
- **HTTP Client**: Fetch API con dataService

---

## Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables (Layout, Header, Footer, Rutas)
├── context/          # Contextos (AuthContext, CartContext)
├── hooks/            # Hooks personalizados (useDebounce)
├── pages/            # Páginas del sistema
│   ├── auth/         # Login,ForgotPassword, ResetPassword
│   ├── carrito/      # Carrito
│   ├── categorias/   # Categorías (público y admin)
│   ├── dashboard/    # Dashboard admin
│   ├── domicilios/   # Domicilios
│   ├── home/         # Home
│   ├── marcas/       # Marcas (público y admin)
│   ├── ordenes/      # Órdenes de compra
│   ├── pagos/        # Pagos
│   ├── pedidos/     # Pedidos
│   ├── productos/   # Productos
│   ├── usuarios/    # Usuarios, Perfil, Registro
│   └── ventas/      # Ventas, Checkout
├── services/         # Servicios (dataService, printService)
└── main.jsx          # Punto de entrada
```
