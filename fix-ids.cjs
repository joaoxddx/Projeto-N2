const fs = require('fs');
let code = fs.readFileSync('src/pages/AdministracaoPages/index.tsx', 'utf8');

code = code.replace(/cursoForm\.ID_Curso > 0/g, "cursoForm.ID_Curso && cursoForm.ID_Curso !== 0 && cursoForm.ID_Curso !== '0'");
code = code.replace(/categoriaForm\.ID_Categoria > 0/g, "categoriaForm.ID_Categoria && categoriaForm.ID_Categoria !== 0 && categoriaForm.ID_Categoria !== '0'");
code = code.replace(/carreiraForm\.ID_Carreira > 0/g, "carreiraForm.ID_Carreira && carreiraForm.ID_Carreira !== 0 && carreiraForm.ID_Carreira !== '0'");
code = code.replace(/trilhaForm\.ID_Trilha > 0/g, "trilhaForm.ID_Trilha && trilhaForm.ID_Trilha !== 0 && trilhaForm.ID_Trilha !== '0'");
code = code.replace(/planoForm\.ID_Plano > 0/g, "planoForm.ID_Plano && planoForm.ID_Plano !== 0 && planoForm.ID_Plano !== '0'");

code = code.replace(/<h4 className="mb-4">Editar Plano<\/h4>/g, "<h4 className=\"mb-4\">{planoForm.ID_Plano && planoForm.ID_Plano !== 0 && planoForm.ID_Plano !== '0' ? 'Editar Plano' : 'Cadastrar Novo Plano'}</h4>");

fs.writeFileSync('src/pages/AdministracaoPages/index.tsx', code);
