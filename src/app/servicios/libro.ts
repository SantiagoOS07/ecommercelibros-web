import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    RegistrarLibroRequest,
    ActualizarTituloLibroRequest, 
    ActualizarDescripcionLibroRequest , 
    ActualizarNumeroPaginasLibroRequest, 
    ActualizarPrecioLibroRequest, 
    ActualizarStockLibroRequest, 
    ActualizarEdicionLibroRequest, 
    ActualizarEditorialLibroRequest, 
    ActualizarFechaPublicacionLibroRequest, 
    ActualizarCategoriaLibroRequest, 
    ActualizarImagenLibroRequest, 
    LibroResponse,
    LibroDetalleResponse
} from '../modelos/libro';
import { Pagina } from '../modelos/libro';

@Injectable({ providedIn: 'root' })
export class LibrosService {
    private http = inject(HttpClient);
    private url = 'http://localhost:8080/api/libros';

    crear(){
        return this.http.post<LibroResponse>(this.url, null);
    }

    listar(){
        return this.http.get<Pagina<LibroDetalleResponse>>(this.url);
    }

    consultarPorId(idLibro: string){
        return this.http.get<LibroResponse>(`${this.url}/${idLibro}`);
    }

    registrar(solicitud: RegistrarLibroRequest){
        return this.http.post<LibroResponse>(this.url, solicitud);
    }

    actualizarTitulo(idLibro: string, solicitud: ActualizarTituloLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/titulo`, solicitud);
    }

    actualizarDescripcion(idLibro: string, solicitud: ActualizarDescripcionLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/descripcion`, solicitud);
    }

    actualizarNumeroPaginas(idLibro: string, solicitud: ActualizarNumeroPaginasLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/numero-paginas`, solicitud);
    }

    actualizarPrecio(idLibro: string, solicitud: ActualizarPrecioLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/precio`, solicitud);
    }   

    actualizarStock(idLibro: string, solicitud: ActualizarStockLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/stock`, solicitud);
    }   

    actualizarEdicion(idLibro: string, solicitud: ActualizarEdicionLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/edicion`, solicitud);
    }

    actualizarEditorial(idLibro: string, solicitud: ActualizarEditorialLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/editorial`, solicitud);
    }

    actualizarFechaPublicacion(idLibro: string, solicitud: ActualizarFechaPublicacionLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/fecha-publicacion`, solicitud);
    }

    actualizarCategoria(idLibro: string, solicitud: ActualizarCategoriaLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/categoria`, solicitud);
    }

    actualizarImagen(idLibro: string, solicitud: ActualizarImagenLibroRequest){
        return this.http.put<void>(`${this.url}/${idLibro}/imagen`, solicitud);
    }

    agotar(idLibro: string){
        return this.http.put<void>(`${this.url}/${idLibro}/agotar`, null);
    }

    reactivar(idLibro: string){
        return this.http.put<void>(`${this.url}/${idLibro}/reactivar`, null);
    }

    descontinuar(idLibro: string){
        return this.http.put<void>(`${this.url}/${idLibro}/descontinuar`, null);
    }

    eliminar(idLibro: string){
        return this.http.delete<void>(`${this.url}/${idLibro}`);
    }
}