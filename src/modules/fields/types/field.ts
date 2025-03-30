/**
 * Configuración de un campo
 */
export interface FieldConfig {
  id: string;           // Identificador único del campo
  label: string;        // Etiqueta visible para el usuario
  selected: boolean;    // Indica si el campo está seleccionado
  category: string;     // Categoría a la que pertenece el campo
  order: number;        // Orden de visualización
  isCustom?: boolean;   // Indica si es un campo personalizado añadido por el usuario
}

/**
 * Grupo de campos para mostrar en la interfaz
 */
export interface FieldGroup {
  title: string;
  fields: {
    id: string;
    name: string;
    selected: boolean;
    default?: boolean;
  }[];
}
