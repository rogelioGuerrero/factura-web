import { FieldSelectionModel, FieldConfig } from '../models/FieldSelectionModel';

export class FieldSelectionController {
  private static instance: FieldSelectionController;
  private model: FieldSelectionModel;

  private constructor() {
    this.model = FieldSelectionModel.getInstance();
  }

  static getInstance(): FieldSelectionController {
    if (!FieldSelectionController.instance) {
      FieldSelectionController.instance = new FieldSelectionController();
    }
    return FieldSelectionController.instance;
  }

  getAvailableFields(): FieldConfig[] {
    return this.model.getAvailableFields();
  }

  getSelectedFields(): FieldConfig[] {
    return this.model.getSelectedFields();
  }

  setSelectedFields(fieldIds: string[]): void {
    this.model.setSelectedFields(fieldIds);
  }

  addSelectedField(fieldId: string): void {
    this.model.addSelectedField(fieldId);
  }

  removeSelectedField(fieldId: string): void {
    this.model.removeSelectedField(fieldId);
  }

  getFieldsByCategory(): Record<string, FieldConfig[]> {
    return this.model.getFieldsByCategory();
  }

  isFieldSelected(fieldId: string): boolean {
    return this.model.isFieldSelected(fieldId);
  }

  resetToDefaults(): void {
    this.model.resetToDefaults();
  }
}
