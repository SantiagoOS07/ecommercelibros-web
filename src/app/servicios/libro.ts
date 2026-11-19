import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    RegistrarLibroRequest,
    ActualizarTituloLibroRequest,
    ActualizarDescripcionLibroRequest,
    ActualizarNumeroPaginasLibroRequest,
    ActualizarPrecioLibroRequest,
    ActualizarStockLibroRequest,
    ActualizarEdicionLibroRequest,
    ActualizarEditorialLibroRequest,
    ActualizarFechaPublicacionLibroRequest,
    ActualizarCategoriaLibroRequest,
    ActualizarImagenLibroRequest,
    LibroResponse,
    LibroDetalleResponse,
    AplicarDescuentoLibroRequest
} from '../modelos/libro';
import { FiltroCatalogo, Pagina } from '../modelos/libro';

@Injectable({ providedIn: 'root' })
export class LibrosService {
    private http = inject(HttpClient);
    private url = 'http://localhost:8080/api/libros';


    listar(filtro: FiltroCatalogo) {
        let params = new HttpParams().set('pagina', filtro.pagina).set('tamanio', filtro.tamanio);

        if (filtro.palabra.trim()) {
            params = params.set('palabra', filtro.palabra.trim());
        }
        if (filtro.estado) {
            params = params.set('estado', filtro.estado);
        }
        if (filtro.categoria) {
            params = params.set('categoria', filtro.categoria);
        }
        if (filtro.moneda) {
            params = params.set('moneda', filtro.moneda);
        }
        if (filtro.precioMin) {
            params = params.set('precioMin', filtro.precioMin);
        }
        if (filtro.precioMax) {
            params = params.set('precioMax', filtro.precioMax);
        }

        return this.http.get<Pagina<LibroDetalleResponse>>(this.url, { params });
    }

    consultarPorId(idLibro: string) {
        return this.http.get<LibroResponse>(`${this.url}/${idLibro}`);
    }

    registrar(solicitud: RegistrarLibroRequest) {
        return this.http.post<LibroResponse>(this.url, solicitud);
    }

    actualizarTitulo(idLibro: string, solicitud: ActualizarTituloLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/titulo`, solicitud);
    }

    actualizarDescripcion(idLibro: string, solicitud: ActualizarDescripcionLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/descripcion`, solicitud);
    }

    actualizarNumeroPaginas(idLibro: string, solicitud: ActualizarNumeroPaginasLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/numero-paginas`, solicitud);
    }

    actualizarPrecio(idLibro: string, solicitud: ActualizarPrecioLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/precio`, solicitud);
    }

    actualizarStock(idLibro: string, solicitud: ActualizarStockLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/stock`, solicitud);
    }

    actualizarEdicion(idLibro: string, solicitud: ActualizarEdicionLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/edicion`, solicitud);
    }

    actualizarEditorial(idLibro: string, solicitud: ActualizarEditorialLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/editorial`, solicitud);
    }

    actualizarFechaPublicacion(idLibro: string, solicitud: ActualizarFechaPublicacionLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/fecha-publicacion`, solicitud);
    }

    actualizarCategoria(idLibro: string, solicitud: ActualizarCategoriaLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/categoria`, solicitud);
    }

    actualizarImagen(idLibro: string, solicitud: ActualizarImagenLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/imagen`, solicitud);
    }

    agotar(idLibro: string) {
        return this.http.put<void>(`${this.url}/${idLibro}/agotar`, null);
    }

    reactivar(idLibro: string) {
        return this.http.put<void>(`${this.url}/${idLibro}/reactivar`, null);
    }

    descontinuar(idLibro: string) {
        return this.http.put<void>(`${this.url}/${idLibro}/descontinuar`, null);
    }

    aplicarDescuento(idLibro: string, solicitud: AplicarDescuentoLibroRequest) {
        return this.http.put<void>(`${this.url}/${idLibro}/descuento`, solicitud);
    }

    quitarDescuento(idLibro: string) {
        return this.http.delete<void>(`${this.url}/${idLibro}/descuento`);
    }

    eliminar(idLibro: string) {
        return this.http.delete<void>(`${this.url}/${idLibro}`);
    }
}