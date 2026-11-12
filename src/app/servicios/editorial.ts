import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    EditorialResponse,
    RegistrarEditorialRequest,
} from '../modelos/editorial';

@Injectable({ providedIn: 'root' })
export class EditorialesService {
    private http = inject(HttpClient);
    private url = 'http://localhost:8080/api/editoriales';

    crear() {
        return this.http.post<EditorialResponse>(this.url, null);
    }

    listar() {
        return this.http.get<EditorialResponse[]>(this.url);
    }

    registrar(solicitud: RegistrarEditorialRequest) {
        return this.http.post<EditorialResponse>(this.url, solicitud);
    }
    

}