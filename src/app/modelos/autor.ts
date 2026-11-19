export const NACIONALIDADES: string[] = [
  'AFGANA', 'ALEMANA', 'ARGELINA', 'ARGENTINA', 'AUSTRALIANA', 'AUSTRIACA',
  'BELGA', 'BOLIVIANA', 'BRASILENIA', 'BRITANICA', 'BULGARA', 'CANADIENSE',
  'CHILENA', 'CHINA', 'COLOMBIANA', 'COSTARRICENSE', 'CROATA', 'CUBANA',
  'DANESA', 'ECUATORIANA', 'EGIPCIA', 'ESPANOLA', 'ESTADOUNIDENSE', 'FINLANDESA',
  'FRANCESA', 'GRIEGA', 'GUATEMALTECA', 'HAITIANA', 'HONDURENA', 'HUNGARA',
  'INDIA', 'INDONESIA', 'IRANI', 'IRAQUI', 'IRLANDESA', 'ISLANDESA',
  'ISRAELI', 'ITALIANA', 'JAPONESA', 'JORDANA', 'KAZAJA', 'KENIANA',
  'LETONA', 'LIBANESA', 'LITUANA', 'MALASIA', 'MARROQUI', 'MEXICANA',
  'NIGERIANA', 'NORUEGA', 'NEERLANDESA', 'PANAMENA', 'PARAGUAYA', 'PERUANA',
  'POLACA', 'PORTUGUESA', 'PUERTORRIQUENA', 'RUMANA', 'RUSA', 'SALVADORENA',
  'SERBIA', 'SINGAPURENSE', 'SUDAFRICANA', 'SUECA', 'SUIZA', 'TAILANDESA',
  'TAIWANESA', 'TURCA', 'UCRANIANA', 'URUGUAYA', 'VENEZOLANA', 'VIETNAMITA',
  'OTRA'
];

export interface AutorResponse {
  idAutor: string;
  nombreAutor: string;
  biografia: string;
  nacionalidades: string[];
}

export interface RegistrarAutorRequest {
  idAutor: string;
  nombreAutor: string;
  biografia: string;
  nacionalidad: string;
}

export interface ActualizarNombreAutorRequest {
  nombreAutor: string;
}

export interface ActualizarBiografiaAutorRequest {
  biografia: string;
}

export interface AgregarNacionalidadRequest {
  nacionalidad: string;
}