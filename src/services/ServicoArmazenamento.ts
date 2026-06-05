import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Helper to determine the ID key based on table name (app model)
const getIdKey = (table: string): string => {
    switch (table.toLowerCase()) {
        case 'usuarios': return 'ID_Usuario';
        case 'categorias': return 'ID_Categoria';
        case 'cursos': return 'ID_Curso';
        case 'modulos': return 'ID_Modulo';
        case 'aulas': return 'ID_Aula';
        case 'matriculas': return 'ID_Matricula';
        case 'progresso_aulas': return 'id'; // Usually composed, we use default id for json-server
        case 'avaliacoes': return 'ID_Avaliacao';
        case 'trilhas': return 'ID_Trilha';
        case 'trilhas_cursos': return 'id';
        case 'certificados': return 'ID_Certificado';
        case 'planos': return 'ID_Plano';
        case 'assinaturas': return 'ID_Assinatura';
        case 'pagamentos': return 'ID_Pagamento';
        case 'carreiras': return 'ID_Carreira';
        case 'carreiras_trilhas': return 'id';
        case 'matriculas_trilhas': return 'ID_MatriculaTrilha';
        case 'matriculas_carreiras': return 'ID_MatriculaCarreira';
        default: return 'id';
    }
};

const mapFromDb = (table: string, data: any) => {
    if (!data) return data;
    const idKey = getIdKey(table);
    if (data.id && idKey !== 'id' && data[idKey] === undefined) {
        const num = Number(data.id);
        data[idKey] = isNaN(num) ? data.id : num; 
    }
    return data;
};

// Map from app format to db format
const mapToDb = (table: string, data: any) => {
    if (!data) return data;
    const idKey = getIdKey(table);
    if (data[idKey] && idKey !== 'id') {
        data.id = String(data[idKey]); // json-server v1 expects string IDs, but accepts numbers for routing. we pass string.
    }
    return data;
};

export class ServicoArmazenamento {
    
    // We keep init to not break signature, but it does nothing since json-server is pre-seeded
    static async init() {
        return;
    }

    static async getAll(table: string): Promise<any[]> {
        const route = table.toLowerCase();
        try {
            const response = await axios.get(`${API_URL}/${route}`);
            return response.data.map((item: any) => mapFromDb(route, item));
        } catch (error) {
            console.error(`Error fetching all from ${route}:`, error);
            return [];
        }
    }

    static async getById(table: string, idKey: string, idValue: any): Promise<any> {
        const route = table.toLowerCase();
        try {
            const response = await axios.get(`${API_URL}/${route}?${idKey}=${idValue}`);
            if (response.data && response.data.length > 0) {
                return mapFromDb(route, response.data[0]);
            }
            if (idKey !== 'id') {
                try {
                    const fallbackResponse = await axios.get(`${API_URL}/${route}/${idValue}`);
                    if (fallbackResponse.data) {
                        return mapFromDb(route, fallbackResponse.data);
                    }
                } catch (fallbackError) {
                    // Ignora 404
                }
            }
            return null;
        } catch (error) {
            console.error(`Error fetching by ID from ${route}:`, error);
            return null;
        }
    }

    static async getByProperty(table: string, propName: string, propValue: any): Promise<any[]> {
        const route = table.toLowerCase();
        try {
            const response = await axios.get(`${API_URL}/${route}?${propName}=${propValue}`);
            return response.data.map((item: any) => mapFromDb(route, item));
        } catch (error) {
            console.error(`Error fetching by property from ${route}:`, error);
            return [];
        }
    }

    static async insert(table: string, data: any): Promise<any> {
        const route = table.toLowerCase();
        try {
            const dataToInsert = mapToDb(route, data);
            
            // Generate UUID if no ID is present, because JSON-Server v1 requires string IDs for POST if missing.
            let generatedId = dataToInsert.id;
            if (!generatedId || generatedId === 0 || generatedId === '0') {
                 generatedId = Date.now().toString(); // simple numeric string id
            } else {
                 generatedId = String(generatedId);
            }
            dataToInsert.id = generatedId;

            const idKey = getIdKey(table);
            if (idKey !== 'id') {
                const num = Number(generatedId);
                dataToInsert[idKey] = isNaN(num) ? generatedId : num;
            }

            const response = await axios.post(`${API_URL}/${route}`, dataToInsert);
            return mapFromDb(route, response.data);
        } catch (error) {
            console.error(`Error inserting into ${route}:`, error);
            return null;
        }
    }

    static async update(table: string, idKey: string, idValue: any, newData: any): Promise<any> {
        const route = table.toLowerCase();
        try {
            let targetId = null;
            const getResponse = await axios.get(`${API_URL}/${route}?${idKey}=${idValue}`);
            if (getResponse.data && getResponse.data.length > 0) {
                targetId = getResponse.data[0].id;
            } else if (idKey !== 'id') {
                try {
                    const fallbackResponse = await axios.get(`${API_URL}/${route}/${idValue}`);
                    if (fallbackResponse.data) {
                        targetId = fallbackResponse.data.id;
                    }
                } catch (e) {
                    // Ignora 404
                }
            }

            if (targetId) {
                const dataToUpdate = mapToDb(route, newData);
                dataToUpdate.id = targetId;
                const response = await axios.put(`${API_URL}/${route}/${targetId}`, dataToUpdate);
                return mapFromDb(route, response.data);
            }
            return null;
        } catch (error) {
            console.error(`Error updating ${route}:`, error);
            return null;
        }
    }

    static async delete(table: string, idKey: string, idValue: any): Promise<void> {
        const route = table.toLowerCase();
        try {
            let targetId = null;
            const getResponse = await axios.get(`${API_URL}/${route}?${idKey}=${idValue}`);
            if (getResponse.data && getResponse.data.length > 0) {
                targetId = getResponse.data[0].id;
            } else if (idKey !== 'id') {
                try {
                    const fallbackResponse = await axios.get(`${API_URL}/${route}/${idValue}`);
                    if (fallbackResponse.data) {
                        targetId = fallbackResponse.data.id;
                    }
                } catch (e) {
                    // Ignora 404
                }
            }
            if (targetId) {
                await axios.delete(`${API_URL}/${route}/${targetId}`);
            }
        } catch (error) {
            console.error(`Error deleting from ${route}:`, error);
        }
    }
}
