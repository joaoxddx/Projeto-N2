import { Plano, Categoria, Usuario, Curso, Avaliacao, Trilha, Carreira, CarreiraTrilha } from '../models/Entidades';

export class ServicoArmazenamento {
    static init() {
        const defaultTables: Record<string, any[]> = {
            'Usuarios': [],
            'Categorias': [],
            'Cursos': [],
            'Modulos': [],
            'Aulas': [],
            'Matriculas': [],
            'Progresso_Aulas': [],
            'Avaliacoes': [],
            'Trilhas': [],
            'Trilhas_Cursos': [],
            'Certificados': [],
            'Planos': [],
            'Assinaturas': [],
            'Pagamentos': [],
            'Carreiras': [],
            'Carreiras_Trilhas': []
        };

        for (const [table, defaultData] of Object.entries(defaultTables)) {
            if (!localStorage.getItem(table)) {
                localStorage.setItem(table, JSON.stringify(defaultData));
            }
        }

        // Seed Mock Data se vazio
        this.seedMockData();
    }

    static seedMockData() {
        const planos = this.getAll('Planos');
        if (planos.length === 0) {
            this.insert('Planos', new Plano(1, 'Basic', 'Acesso a 1 curso mensal', 29.90, 1));
            this.insert('Planos', new Plano(2, 'Pro', 'Acesso ilimitado a todos os cursos', 89.90, 1));
            this.insert('Planos', new Plano(3, 'Anual', 'Acesso ilimitado por 12 meses', 799.90, 12));
        }

        const categorias = this.getAll('Categorias');
        if (categorias.length === 0) {
            this.insert('Categorias', new Categoria(1, 'Programação', 'Cursos de lógica e desenvolvimento'));
            this.insert('Categorias', new Categoria(2, 'Design', 'Cursos de UI/UX e Web Design'));
        }

        const usuarios = this.getAll('Usuarios');
        if (usuarios.length === 0) {
            this.insert('Usuarios', new Usuario(1, 'Administrador', 'admin@formapro.com', 'admin123', new Date().toISOString(), 'admin'));
            this.insert('Usuarios', new Usuario(2, 'Estudante Teste', 'aluno@formapro.com', 'aluno123', new Date().toISOString(), 'student'));
        }
        
        const cursos = this.getAll('Cursos');
        if(cursos.length === 0){
             this.insert('Cursos', new Curso(1, 'Lógica de Programação', 'Aprenda os fundamentos da programação com JavaScript.', 1, 1, 'Iniciante', null, 5, 10, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'));
             this.insert('Cursos', new Curso(2, 'UI/UX Design', 'Princípios de design de interfaces.', 1, 2, 'Intermediário', null, 3, 5, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80'));
        }

        const avaliacoes = this.getAll('Avaliacoes');
        if (avaliacoes.length === 0) {
            this.insert('Avaliacoes', new Avaliacao(1, 2, 1, 5, 'Curso excelente! Muito didático e direto ao ponto.', new Date().toISOString()));
            this.insert('Avaliacoes', new Avaliacao(2, 2, 2, 4, 'Ótima base para iniciar no design. Gostei dos exemplos práticos.', new Date().toISOString()));
        }

        const carreiras = this.getAll('Carreiras');
        if (carreiras.length === 0) {
            this.insert('Carreiras', new Carreira(1, 'Desenvolvedor Full Stack', 'Formação completa do Front ao Backend.'));
        }

        const trilhas = this.getAll('Trilhas');
        if (trilhas.length === 0) {
            this.insert('Trilhas', new Trilha(1, 'Trilha Front-End Iniciante', 'Os primeiros passos com HTML, CSS e JS.', 1));
            this.insert('Carreiras_Trilhas', new CarreiraTrilha(1, 1, 1)); // Adiciona trilha 1 na carreira 1
        }
    }

    static generateId(table: string): number {
        const items = this.getAll(table);
        if (items.length === 0) return 1;
        
        const idKey = Object.keys(items[0]).find(k => k.startsWith('ID_')) || 'id';
        return Math.max(...items.map((i: any) => i[idKey])) + 1;
    }

    static getAll(table: string): any[] {
        return JSON.parse(localStorage.getItem(table) || '[]');
    }

    static getById(table: string, idKey: string, idValue: any): any {
        const items = this.getAll(table);
        return items.find((i: any) => String(i[idKey]) === String(idValue)) || null;
    }

    static getByProperty(table: string, propName: string, propValue: any): any[] {
         const items = this.getAll(table);
         return items.filter((i: any) => String(i[propName]) === String(propValue));
    }

    static insert(table: string, data: any): any {
        const items = this.getAll(table);
        const idKey = Object.keys(data).find(k => k.startsWith('ID_'));
        if (idKey && !data[idKey]) { 
             data[idKey] = this.generateId(table);
        }
        items.push(data);
        localStorage.setItem(table, JSON.stringify(items));
        return data;
    }

    static update(table: string, idKey: string, idValue: any, newData: any): any {
        const items = this.getAll(table);
        const index = items.findIndex((i: any) => String(i[idKey]) === String(idValue));
        if (index !== -1) {
            items[index] = { ...items[index], ...newData };
            localStorage.setItem(table, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    static delete(table: string, idKey: string, idValue: any): void {
        let items = this.getAll(table);
        items = items.filter((i: any) => String(i[idKey]) !== String(idValue));
        localStorage.setItem(table, JSON.stringify(items));
    }
}
