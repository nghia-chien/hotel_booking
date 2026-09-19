// backend/src/services/comboService.ts
export interface Combo { id: string; name: string; price: number; details: any; }

export default class ComboService {
  async listCombos(criteria: any): Promise<Combo[]> {
    // Placeholder: return mock data or query DB
    return [
      { id: "combo-1", name: "Standard: 2 người + ăn sáng", price: 1000000, details: { rooms: 1, breakfast: true } }
    ];
  }
  async getCombo(id: string): Promise<Combo | null> {
    return { id, name: "Standard", price: 1000000, details: {} };
  }
}
