export interface EditorialResponse {
    idEditorial: string; 
    nombreEditorial: string; 
    paisOrigen: string;
    descripcionEditorial: string
}

export interface RegistrarEditorialRequest { 
    nombreEditorial: string; 
    paisOrigen: string; 
    descripcionEditorial: string 
}