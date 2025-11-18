import { supabase } from '../lib/supabase';
import { Collaboration } from '../types/kol';

// 轉換資料庫格式到前端格式
function transformCollaborationFromDB(dbCollab: any): Collaboration {
  return {
    id: dbCollab.id,
    kolId: dbCollab.kol_id,
    projectName: dbCollab.project_name,
    productName: dbCollab.product_name,
    productCode: dbCollab.product_code,
    status: dbCollab.status,
    startDate: dbCollab.start_date,
    endDate: dbCollab.end_date,
    budget: parseFloat(dbCollab.budget) || 0,
    actualCost: parseFloat(dbCollab.actual_cost) || 0,
    deliverables: dbCollab.deliverables || [],
    platforms: dbCollab.platforms || [],
    contractUrl: dbCollab.contract_url,
    contractStatus: dbCollab.contract_status || 'none',
    note: dbCollab.note || '',
    profitShares: dbCollab.profit_shares || [],
    reminders: dbCollab.reminders || [],
    collaborationProcess: dbCollab.collaboration_process,
    createdAt: dbCollab.created_at,
    updatedAt: dbCollab.updated_at,
  };
}

// 轉換前端格式到資料庫格式
function transformCollaborationToDB(collab: Partial<Collaboration>) {
  return {
    kol_id: collab.kolId,
    project_name: collab.projectName,
    product_name: collab.productName,
    product_code: collab.productCode,
    status: collab.status,
    start_date: collab.startDate,
    end_date: collab.endDate,
    budget: collab.budget,
    actual_cost: collab.actualCost,
    deliverables: collab.deliverables,
    platforms: collab.platforms,
    contract_url: collab.contractUrl,
    contract_status: collab.contractStatus,
    note: collab.note,
    collaboration_process: collab.collaborationProcess,
  };
}

// 獲取所有合作專案
export async function getAllCollaborations(): Promise<Collaboration[]> {
  try {
    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(transformCollaborationFromDB);
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    throw error;
  }
}

// 獲取單個合作專案
export async function getCollaborationById(id: number): Promise<Collaboration | null> {
  try {
    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return transformCollaborationFromDB(data);
  } catch (error) {
    console.error('Error fetching collaboration:', error);
    throw error;
  }
}

// 建立新合作專案
export async function createCollaboration(collab: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collaboration> {
  try {
    const { data, error } = await supabase
      .from('collaborations')
      .insert([transformCollaborationToDB(collab)])
      .select()
      .single();

    if (error) throw error;

    return transformCollaborationFromDB(data);
  } catch (error) {
    console.error('Error creating collaboration:', error);
    throw error;
  }
}

// 更新合作專案
export async function updateCollaboration(id: number, collab: Partial<Collaboration>): Promise<Collaboration> {
  try {
    const { data, error } = await supabase
      .from('collaborations')
      .update(transformCollaborationToDB(collab))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return transformCollaborationFromDB(data);
  } catch (error) {
    console.error('Error updating collaboration:', error);
    throw error;
  }
}

// 刪除合作專案
export async function deleteCollaboration(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('collaborations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting collaboration:', error);
    throw error;
  }
}

// 根據 KOL ID 獲取合作專案
export async function getCollaborationsByKolId(kolId: number): Promise<Collaboration[]> {
  try {
    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .eq('kol_id', kolId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(transformCollaborationFromDB);
  } catch (error) {
    console.error('Error fetching collaborations by KOL:', error);
    throw error;
  }
}
