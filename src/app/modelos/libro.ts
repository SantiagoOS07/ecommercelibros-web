export type EstadoLibro = 'DISPONIBLE' | 'AGOTADO' | 'DESCONTINUADO';
export type CategoriaLibro = 'NOVELA' | 'CIENCIA_FICCION' | 'FANTASIA' | 'MISTERIO' | 'ROMANCE' | 'HISTORIA' | 'FILOSOFIA' | 'CIENCIA' | 'TECNOLOGIA' | 'PROGRAMACION' | 'BIOGRAFIA' | 'POESIA' | 'INFANTIL' | 'JUVENIL' | 'AUTOAYUDA' | 'NEGOCIOS' | 'ARTE' | 'RELIGION' | 'SALUD' | 'EDUCACION';
export type Moneda = 'COP' | 'USD';

export interface LibroDetalleResponse {
    idLibro: string;
    titulo: string;
    idAutor: string;
    precio: number;
    moneda: Moneda;
    categoria: CategoriaLibro;
    imagen: string;
    estado: EstadoLibro;
}
export interface LibroResponse {
    idLibro: string;
    titulo: string;
    idAutor: string;
    isbn: string;
    descripcion: string;
    numeroPaginas: number;
    precio: number;
    moneda: Moneda;
    stock: number;
    edicion: string;
    idEditorial: string;
    fechaPublicacion: string;
    categoria: CategoriaLibro;
    imagen: string;
    estado: EstadoLibro;
}

export interface RegistrarLibroRequest {
    titulo: string;
    idAutor: string;
    isbn: string;
    descripcion: string;
    numeroPaginas: number;
    precio: number;
    moneda: Moneda;
    stock: number;
    edicion: string;
    idEditorial: string;
    fechaPublicacion: string;
    categoria: CategoriaLibro;
    imagen: string;
    estado: EstadoLibro;
}

export interface ActualizarTituloLibroRequest {
    titulo?: string;
}

export interface ActualizarDescripcionLibroRequest {
    descripcion: string
}

export interface ActualizarNumeroPaginasLibroRequest {
    numeroPaginas: number
}

export interface ActualizarPrecioLibroRequest {
    precio: number; moneda: Moneda 
}

export interface ActualizarStockLibroRequest {
    stock: number 
}

export interface ActualizarEdicionLibroRequest { 
    edicion: string 
} 

export interface ActualizarEditorialLibroRequest { 
    idEditorial: string 
}

export interface ActualizarFechaPublicacionLibroRequest { 
    fechaPublicacion: string 
}

export interface  ActualizarCategoriaLibroRequest {
    categoria: CategoriaLibro 
} 

export interface ActualizarImagenLibroRequest { 
    imagen: string 
}

export interface Pagina<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;

}