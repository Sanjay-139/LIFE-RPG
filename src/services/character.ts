import { api } from './api';
import { ApiResponse, CharacterSheet, AttributeStat, AttributeKey } from '../types';

export const characterService = {
  async getCharacter(): Promise<ApiResponse<CharacterSheet>> {
    return api.get<CharacterSheet>('/character');
  },

  async getAttributes(): Promise<ApiResponse<Record<AttributeKey, AttributeStat>>> {
    return api.get<Record<AttributeKey, AttributeStat>>('/character/attributes');
  },

  async updateCharacter(updates: Partial<CharacterSheet>): Promise<ApiResponse<CharacterSheet>> {
    return api.patch<CharacterSheet>('/character', updates);
  },

  async allocateAttributePoint(attribute: AttributeKey, points = 1): Promise<ApiResponse<CharacterSheet>> {
    return api.post<CharacterSheet>('/character/attributes/allocate', { attribute, points });
  },
};
