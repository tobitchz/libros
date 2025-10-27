/**
 * Clase que representa un libro obtenido de la API OpenLibrary
 */
export class Libro {
  /** Identificador único del libro/obra */
  id: string | null;
  /** Título del libro */
  titulo: string | null;
  /** Nombre de autor/es (separados con coma) */
  autor: string | null;
  /** Array de identificadores de autores (null si no está disponible) */
  autorId: string[] | null;
  /** Identificador de la portada (null si no está disponible) */
  portadaId: string | null;

  constructor(libro: any) {
    let data: any;

    if (libro.id) {
      this.id = libro.id;
      this.titulo = libro.titulo || "Sin Título";
      this.autor = libro.autor || "Desconocido";
      this.autorId = libro.autorId || null;
      this.portadaId = libro.portadaId || null;
      return;
    }

    if (libro.docs && Array.isArray(libro.docs) && libro.docs.length > 0) {
      data = libro.docs[0];
    } else if (libro.key) {
      data = libro;
    } else {
      this.id = null;
      this.titulo = null;
      this.autor = null;
      this.autorId = null;
      this.portadaId = null;
      return;
    }

    this.id = data.key ? data.key.replace("/works/", "") : null;
    this.titulo = data.title || 'Sin título';
    this.autor = data.author_name ? data.author_name.join(", ") : "Desconocido";
    this.autorId = data.author_key || null;
    this.portadaId = data.cover_i ? data.cover_i.toString() : null;
  }

  /**
   * Obtiene url a imagen de portada
   * @param size tamaño de la imagen ("S", "M", "L")
   * @returns { string } url a imagen de portada
   */
  obtenerPortada(size: string = "M"): string {
    return `https://covers.openlibrary.org/b/id/${this.portadaId}-${size.toUpperCase()}.jpg`;
  }

  /**
   * Verifica si el libro tiene datos válidos
   * @returns booleano
   */
  esValido(): boolean {
    return !!this.id;
  }

}