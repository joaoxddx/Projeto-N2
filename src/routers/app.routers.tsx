import { Route, Routes } from "react-router-dom";
import { HomePages } from "../pages/HomePages";
import { LoginPages } from "../pages/LoginPages";
import { PainelAlunoPages } from "../pages/PainelAlunoPages";
import { SalaAulaPages } from "../pages/SalaAulaPages";
import { CertificadoPages } from "../pages/CertificadoPages";
import { AdministracaoPages } from "../pages/AdministracaoPages";
import { PagamentoPages } from "../pages/PagamentoPages";
import { MontadorCursoPages } from "../pages/MontadorCursoPages";

export const AppRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<HomePages />} />
        <Route path="/login" element={<LoginPages />} />
        <Route path="/painel_aluno" element={<PainelAlunoPages />} />
        <Route path="/sala_aula" element={<SalaAulaPages />} />
        <Route path="/certificado" element={<CertificadoPages />} />
        <Route path="/administracao" element={<AdministracaoPages />} />
        <Route path="/pagamento" element={<PagamentoPages />} />
        <Route path="/montador_curso" element={<MontadorCursoPages />} />
    </Routes>
  );
};
