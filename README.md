# Ecommerce Libros · Frontend

Frontend en Angular de **Ecommerce Libros**, una tienda en línea de libros. Los clientes ven el catálogo, buscan y filtran libros, arman su carrito y completan sus compras. Los proveedores y el administrador gestionan libros, autores, ventas y descuentos, y el administrador además gestiona los usuarios.

Proyecto del curso **Programación Avanzada**, Programa de Ingeniería de Sistemas y Computación, Universidad del Quindío. El backend está en el repositorio [SantiagoOS07/ecommercelibros](https://github.com/SantiagoOS07/ecommercelibros).

## Integrantes

| Integrante | Aporte en la Entrega 3 |
| --- | --- |
| Santiago Ospina Sánchez | Sistema de descuentos en el backend: dominio, persistencia, casos de uso, API y pruebas |
| Juan Sebastián Hernández Guevara | Libros en el frontend: catálogo paginado con búsqueda reactiva, precios con dos decimales, descuentos en pantalla y edición de libros |
| Sharif Giraldo | MariaDB con Docker, diseño propio en Figma (login y color de la marca) y este README |

## Tecnologías

- Angular 22 con componentes standalone, Signals y formularios reactivos
- Bootstrap 5.3 y Font Awesome 7
- RxJS (`debounceTime`, `switchMap`) para la búsqueda reactiva
- Backend: Java 21, Spring Boot 4, Spring Security con JWT, Spring Data JPA, H2 o MariaDB

## Requisitos

- Node.js 22 o superior y npm
- Java 21 para el backend
- Docker Desktop (solo si se usa MariaDB)

## Cómo ejecutar

La aplicación necesita el backend encendido en el puerto **8080** y el frontend en el puerto **4200**.

### 1. Backend con H2 (forma normal)

```bash
git clone https://github.com/SantiagoOS07/ecommercelibros.git
cd ecommercelibros
./gradlew bootRun
```

También se puede ejecutar `EcommercelibrosApplication.java` desde IntelliJ. Con H2 los datos de prueba se cargan solos al arrancar y se borran al apagar la aplicación.

- Swagger: http://localhost:8080/swagger-ui.html
- Consola de H2: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:ecommercedb`, usuario `sa`, contraseña vacía)

### 2. Backend con MariaDB en Docker (opcional)

Con MariaDB los datos sobreviven a los reinicios del backend. No se cambia código Java: solo se activa el perfil `mariadb`, definido en `src/main/resources/application-mariadb.properties`.

**a. Crear el contenedor** (con Docker Desktop abierto):

```bash
docker pull mariadb:11
docker run --name mariadb-ecommercelibros -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=ecommercelibrosdb -p 3307:3306 -v mariadb_ecommercelibros_data:/var/lib/mysql -d mariadb:11
docker logs mariadb-ecommercelibros
```

Esperar a que el log diga `ready for connections`.

**b. Arrancar el backend con el perfil `mariadb`:**

- En IntelliJ: **Edit Configurations** → **Active profiles**: `mariadb`. Si no aparece ese campo, en **Modify options** → **Add VM options** escribir `-Dspring.profiles.active=mariadb`.
- Desde la terminal (PowerShell): `$env:SPRING_PROFILES_ACTIVE="mariadb"; .\gradlew bootRun`

En el log debe salir `The following 1 profile is active: "mariadb"`. En el primer arranque Hibernate crea las tablas.

**c. Cargar los datos de prueba (una sola vez, con el backend corriendo):**

Al arrancar, el backend crea el administrador `admin@libros.com`, y `usuarios-autores.sql` también lo inserta. Por eso se borra primero:

```bash
docker exec -it mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb -e "DELETE FROM usuarios WHERE correo = 'admin@libros.com';"
```

Luego se cargan los tres archivos en este orden, desde la carpeta del backend.

En PowerShell:

```powershell
Get-Content src/main/resources/data/usuarios-autores.sql | docker exec -i mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb
Get-Content src/main/resources/data/libros-carritos.sql | docker exec -i mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb
Get-Content src/main/resources/data/ventas.sql | docker exec -i mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb
```

En la terminal de Mac, Linux o el CMD de Windows:

```bash
docker exec -i mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb < src/main/resources/data/usuarios-autores.sql
docker exec -i mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb < src/main/resources/data/libros-carritos.sql
docker exec -i mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb < src/main/resources/data/ventas.sql
```

Si sale `Duplicate entry`, los datos ya estaban cargados.

**d. Comandos útiles:**

| Acción | Comando |
| --- | --- |
| Apagar MariaDB | `docker stop mariadb-ecommercelibros` |
| Encenderla otra vez | `docker start mariadb-ecommercelibros` |
| Ver las tablas | `docker exec -it mariadb-ecommercelibros mariadb -uroot -proot ecommercelibrosdb -e "SHOW TABLES;"` |
| Volver a H2 | Quitar `mariadb` de Active profiles |

Para comprobar la persistencia: registrar un usuario desde la pantalla de registro, detener el backend, volver a arrancarlo y comprobar que el usuario sigue ahí. Aunque se borre el contenedor (`docker rm`), los datos se conservan en el volumen `mariadb_ecommercelibros_data`.

### 3. Frontend

```bash
git clone https://github.com/SantiagoOS07/ecommercelibros-web.git
cd ecommercelibros-web
npm install
npm start
```

Abrir http://localhost:4200

## Usuarios de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| ADMINISTRADOR | admin@libros.com | Admin12345 |
| PROVEEDOR | proveedor@libros.com | Proveedor123 |
| CLIENTE | cliente1@libros.com | Cliente123 |
| CLIENTE | cliente2@libros.com | Cliente123 |
| CLIENTE inactivo (no puede iniciar sesión) | inactivo@libros.com | Inactivo123 |

`cliente1@libros.com` tiene un carrito de prueba en estado CREADO.

## Pantallas y acceso

| Ruta | Pantalla | Quién puede entrar |
| --- | --- | --- |
| `/` | Inicio | Todos |
| `/login` | Iniciar sesión | Solo sin sesión iniciada |
| `/registro` | Crear cuenta | Solo sin sesión iniciada |
| `/catalogo` | Catálogo con búsqueda, filtros y paginación | Todos |
| `/catalogo/:id` | Detalle del libro | Todos |
| `/catalogo/:id/editar` | Editar libro y gestionar su descuento | ADMINISTRADOR y PROVEEDOR |
| `/carrito` | Carrito de compras | Con sesión iniciada |
| `/mis-compras` | Historial de compras | Con sesión iniciada |
| `/perfil` | Perfil del usuario | Con sesión iniciada |
| `/gestion-libros` | Gestión de libros | ADMINISTRADOR y PROVEEDOR |
| `/gestion-autores` | Gestión de autores | ADMINISTRADOR y PROVEEDOR |
| `/gestion-ventas` | Gestión de ventas | ADMINISTRADOR y PROVEEDOR |
| `/gestion-usuarios` | Gestión de usuarios | ADMINISTRADOR |

Una ruta que no existe redirige al inicio. El menú solo muestra las opciones que corresponden al rol del usuario y se convierte en menú hamburguesa en pantallas pequeñas.

## Estructura del proyecto

```
src/app/
├── modelos/        Interfaces con copias exactas de los DTO del backend
├── servicios/      Única capa que habla con la API (HttpClient)
├── componentes/    Pantallas, encabezado, pie de página y avisos
├── guards/         authGuard, guestGuard y rolGuard
└── interceptores/  Agrega el token JWT y maneja la sesión vencida
```

- Las pantallas no conocen la dirección de la API: llaman a los métodos de los servicios.
- Los nombres de las interfaces en `modelos/` son idénticos a los de los DTO del backend, porque el JSON llega con los nombres de los campos de Java.
- El interceptor agrega `Authorization: Bearer <token>` a cada petición. Si el backend responde 401 con la sesión iniciada, cierra la sesión, muestra el aviso "Tu sesión venció" y lleva al login.
- Los errores y los éxitos se muestran con avisos (`NotificacionesService`).

## Funcionalidad propia: descuentos por temporada

El proveedor o el administrador le pone a un libro un descuento con un porcentaje, un motivo (por ejemplo "Temporada navideña") y una fecha de inicio y de fin. Mientras el descuento está vigente:

- El catálogo y el detalle muestran el precio original tachado, el precio final y una etiqueta con el porcentaje y el motivo.
- El carrito cobra el precio con descuento, y la venta lo conserva.

Se aplica y se quita desde la pantalla **Editar libro** (`/catalogo/:id/editar`), que usa estos endpoints:

| Acción | Endpoint |
| --- | --- |
| Aplicar descuento | `PUT /api/libros/{idLibro}/descuento` con `porcentaje`, `motivo`, `fechaInicio` y `fechaFin` |
| Quitar descuento | `DELETE /api/libros/{idLibro}/descuento` |

Reglas: el porcentaje debe ser mayor que 0 y máximo 99, el motivo es obligatorio y tiene máximo 100 caracteres, y las dos fechas son obligatorias. Si faltan datos o el porcentaje está fuera de rango, el backend responde 400. Si la fecha de fin es anterior a la de inicio o ya pasó, o si se intenta quitar un descuento que no existe, responde 422. En los dos casos la pantalla lo explica con un aviso.

Los datos de prueba ya traen dos libros con descuento: **Redes y Comunicaciones Modernas** (20 %, "Temporada navideña") y **Fundamentos de Física Cuántica** (15 %, "Mes del libro"), vigentes del 1 de noviembre al 31 de diciembre de 2026.

## Requisitos de la entrega

- Conexión con el backend por medio de servicios
- Login con JWT
- Interceptor que agrega el token y maneja la sesión vencida
- Guards por sesión y por invitado
- Operación de negocio con formulario: carrito, confirmación y compra
- Avisos de éxito y de error
- Maquetación con Bootstrap, adaptada al celular
- Catálogo paginado y con búsqueda

## Extras

- **Guard por rol:** `rolGuard` lee los roles permitidos en `data.roles` de cada ruta.
- **Búsqueda reactiva con Signals:** el catálogo guarda la página, el texto y los filtros en señales. La búsqueda espera 400 ms a que la persona deje de escribir (`debounceTime`) y `switchMap` cancela la petición anterior. Además de la palabra, se puede filtrar por categoría, estado, moneda y rango de precio.
- **MariaDB con Docker:** ver la sección [Backend con MariaDB en Docker](#2-backend-con-mariadb-en-docker-opcional).
- **Diseño propio en Figma:** ver la sección siguiente.

## Diseño en Figma

Archivo de diseño: [Ecommerce Libros en Figma](https://www.figma.com/design/LdLtx0VXdGKOHGpwT7j6Eq/Free-Figma-Bootstrap-5-UI-Kit--Community-)

- [Pantalla de login](https://www.figma.com/design/LdLtx0VXdGKOHGpwT7j6Eq/Free-Figma-Bootstrap-5-UI-Kit--Community-?node-id=2323-113)
- [Pantalla del catálogo](https://www.figma.com/design/LdLtx0VXdGKOHGpwT7j6Eq/Free-Figma-Bootstrap-5-UI-Kit--Community-?node-id=2323-228)

El color de la marca es el vino `#7a2e3a`, con `#64252f` al pasar el mouse y `#561f28` al hacer clic. Se lleva a Angular al final de `src/styles.css`, cambiando las variables de `.btn-primary`, `.btn-outline-primary` y los enlaces. El login (`componentes/login`) se ajustó al diseño con clases de Bootstrap (`shadow`, `rounded-4`, `p-5`).

### Atribución

El diseño se hizo con la plantilla **[Free Figma Bootstrap 5 UI Kit](https://themeselection.com/item/free-figma-bootstrap-ui-kit/)** de **ThemeSelection**, publicada bajo la licencia MIT.
