import { Card } from '../components/Card';

const Cursos = () => {

  const cursosCadastrados = [
    { id: 1, nome: "Introdução ao React" },
    { id: 2, nome: "Desenvolvimento Web Avançado" },
    { id: 3, nome: "Design UI/UX" }
  ];

  const contentListar = (
    <ul className="list-group">
      {cursosCadastrados.map(curso => (
        <li key={curso.id} className="list-group-item d-flex justify-content-between align-items-center">
          {curso.nome}
          <div>
            <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
            <button className="btn btn-sm btn-outline-danger">Excluir</button>
          </div>
        </li>
      ))}
    </ul>
  );

  const contentCriar = (
    <form>
      <div className="mb-3">
        <label htmlFor="nomeCurso" className="form-label">Nome do Curso</label>
        <input type="text" className="form-control" id="nomeCurso" placeholder="Ex: Engenharia de Software" />
      </div>
      <button type="submit" className="btn btn-success">Cadastrar Curso</button>
    </form>
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Gerenciamento de Cursos</h2>
      <div className="row">
        <div className="col-md-6">
          <Card
            title="Listar Cursos"
            content={contentListar}
            footer="Total de cursos: 3"
          />
        </div>
        <div className="col-md-6">
          <Card
            title="Criar/Editar Novo Curso"
            content={contentCriar}
            footer="Preencha os dados para criar"
          />
        </div>
      </div>
    </div>
  );
};

export default Cursos;
