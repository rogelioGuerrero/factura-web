export interface FieldConfig {
  id: string;
  label: string;
  path: string;
  category: string;
  calculated?: boolean;
}

export interface FieldSelectionState {
  selectedFields: string[];
  isConfigOpen: boolean;
}
