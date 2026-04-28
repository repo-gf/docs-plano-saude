(function () {
  "use strict";

  const DEPENDENTE_TIPOS = [
    "Cônjuge ou companheiro(a)",
    "Filhos(as) solteiros naturais, tutelados, enteados e adotivos",
    "Filhos(as) inválidos declarados no imposto de renda do titular",
    "Pai e mãe",
    "Padrasto e madrasta",
    "Irmãos(ãs) consanguíneos ou adotivos",
    "Netos",
    "Sobrinhos",
    "Primos",
    "Tios",
    "Cunhados(as)",
    "Sogro(a)",
    "Genros e noras",
    "Avô e avó"
  ];

  const MODALIDADES = {
    CNPJ: ["MEI", "OUTROS"],
    ADESAO: ["ENTIDADE ABERTA", "ESTUDANTE", "TRABALHADOR", "PROFISSIONAL LIBERAL", "APOSENTADO"]
  };

  let dependentes = [];

  function obterDocumentosPadrao2010Mais() {
    return [
      "Certidão de Nascimento (Não pode ser só o RG)",
      "Documento com Foto (RG/CNH/OUTROS - se houver)",
      "CPF (se não tiver em outro documento)",
      "Foto Corporal Completa para Verificação de Saúde",
      "Email e celular do responsável"
    ];
  }

  function obterDocumentosPadrao2009Menos() {
    return [
      "Documento com Foto (RG/CNH/OUTROS)",
      "CPF (se não tiver no documento com foto)",
      "Foto com Documento ao lado do rosto",
      "Email e celular"
    ];
  }

  function obterDocumentosCarencia() {
    return [
      "3 últimos boletos pagos e seus comprovantes",
      "Carteirinha",
      "Carta de permanência"
    ];
  }

  function obterDocumentosTitular(categoria, modalidade, documentosPadrao) {
    const documentos = [...documentosPadrao];
    documentos.push("Comprovante de Residência: (no nome do titular ou dos pais; Se for no nome de outros, me fale)");

    if (categoria === "CNPJ") {
      documentos.push("DA EMPRESA:");
      if (modalidade === "MEI") {
        documentos.push("CNPJ", "CCMEI");
      } else if (modalidade === "OUTROS") {
        documentos.push("CNPJ", "Contrato Social e suas alterações");
      }
    } else if (categoria === "ADESAO") {
      const documentosMap = {
        "ENTIDADE ABERTA": null,
        ESTUDANTE: "Declaração Escolar",
        TRABALHADOR: "Contracheque",
        "PROFISSIONAL LIBERAL": "Documento de Registro no Conselho na validade + Diploma",
        APOSENTADO: "Comprovante de Pensão"
      };
      const docExtra = documentosMap[modalidade];
      if (docExtra) {
        documentos.push(docExtra);
      }
    }

    return documentos;
  }

  function simplificarDependente(nome) {
    const simplificacoes = {
      "Cônjuge ou companheiro(a)": "Cônjuge",
      "Filhos(as) solteiros naturais, tutelados, enteados e adotivos": "Filhos",
      "Filhos(as) inválidos declarados no imposto de renda do titular": "Filho inválido",
      "Pai e mãe": "Pais",
      "Padrasto e madrasta": "Padrastos",
      "Irmãos(ãs) consanguíneos ou adotivos": "Irmãos",
      Netos: "Netos",
      Sobrinhos: "Sobrinhos",
      Primos: "Primos",
      Tios: "Tios",
      "Cunhados(as)": "Cunhados",
      "Sogro(a)": "Sogro(a)",
      "Genros e noras": "Genros/Noras",
      "Avô e avó": "Avós"
    };
    return simplificacoes[nome] || nome;
  }

  function formatarDocumentosParaWhatsapp(nome, documentos) {
    let resultado = `Documentos necessários para ${nome}:\n`;

    documentos.forEach((doc) => {
      if (doc === "DA EMPRESA:") {
        resultado += "\nDA EMPRESA:\n";
      } else {
        resultado += `- ${doc}\n`;
      }
    });

    return `${resultado}\n`;
  }

  function obterDocumentosDependente(dependente, nascido2010) {
    const documentos = nascido2010 ? obterDocumentosPadrao2010Mais() : obterDocumentosPadrao2009Menos();

    if (dependente === "Cônjuge ou companheiro(a)") {
      documentos.push("Certidão de casamento ou declaração de união estável (lavrada em cartório).");
    } else if (dependente.includes("inválido")) {
      documentos.push("Declaração de imposto de renda do titular comprovando a condição.");
    } else if (["Netos", "Sobrinhos", "Primos", "Tios"].includes(dependente)) {
      documentos.push("Documento com foto (RG/CNH/outros) do pai/mãe.");
    } else if (["Cunhados(as)", "Genros e noras"].includes(dependente)) {
      documentos.push("Certidão de casamento.");
    } else if (dependente === "Sogro(a)") {
      documentos.push("Certidão de casamento do titular");
    }

    return documentos;
  }

  function processarDocumentosParaWhatsapp(titularNascido2010, categoria, modalidade, titularCarencia, dependentesInfo) {
    const listaCompleta = [];
    const docsCarencia = obterDocumentosCarencia();
    const documentosPadraoTitular = titularNascido2010 ? obterDocumentosPadrao2010Mais() : obterDocumentosPadrao2009Menos();
    const documentosTitular = obterDocumentosTitular(categoria, modalidade, documentosPadraoTitular);

    if (titularCarencia && categoria !== "CNPJ") {
      documentosTitular.push(...docsCarencia);
    }

    listaCompleta.push(["TITULAR", documentosTitular]);

    dependentesInfo.forEach((depInfo) => {
      const nomeSimples = simplificarDependente(depInfo.tipo);
      const docsDep = obterDocumentosDependente(depInfo.tipo, depInfo.nascido2010);

      if (depInfo.carencia) {
        docsDep.push(...docsCarencia);
      }

      listaCompleta.push([`Dependente: ${nomeSimples}`, docsDep]);
    });

    return listaCompleta.map(([nome, documentos]) => formatarDocumentosParaWhatsapp(nome, documentos)).join("").trim();
  }

  function getElementos() {
    return {
      form: document.getElementById("documentos-form"),
      categoria: document.getElementById("categoria"),
      modalidadeField: document.getElementById("modalidade-field"),
      modalidade: document.getElementById("modalidade"),
      titularNascido2010: document.getElementById("titular-nascido-2010"),
      titularCarencia: document.getElementById("titular-carencia"),
      dependenteTipo: document.getElementById("dependente-tipo"),
      dependenteNascido2010: document.getElementById("dependente-nascido-2010"),
      dependenteCarencia: document.getElementById("dependente-carencia"),
      adicionarDependente: document.getElementById("adicionar-dependente"),
      listaInclusos: document.getElementById("lista-inclusos"),
      resultado: document.getElementById("resultado"),
      copiarLista: document.getElementById("copiar-lista"),
      limparTudo: document.getElementById("limpar-tudo"),
      status: document.getElementById("status")
    };
  }

  function criarOpcao(value, texto) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = texto;
    return option;
  }

  function preencherDependentesSelect(elementos) {
    DEPENDENTE_TIPOS.forEach((tipo) => {
      elementos.dependenteTipo.appendChild(criarOpcao(tipo, tipo));
    });
  }

  function atualizarModalidades(elementos) {
    const categoria = elementos.categoria.value;
    const opcoes = MODALIDADES[categoria] || [];

    elementos.modalidade.replaceChildren();

    if (!opcoes.length) {
      elementos.modalidadeField.classList.add("hidden");
      return;
    }

    elementos.modalidade.appendChild(criarOpcao("", "Selecione"));
    opcoes.forEach((opcao) => {
      elementos.modalidade.appendChild(criarOpcao(opcao, opcao));
    });
    elementos.modalidadeField.classList.remove("hidden");
  }

  function obterDadosTitular(elementos) {
    return {
      nascido2010: elementos.titularNascido2010.checked,
      categoria: elementos.categoria.value,
      modalidade: elementos.modalidade.value,
      carencia: elementos.titularCarencia.checked
    };
  }

  function descreverTitular(dados) {
    let tipo = dados.nascido2010 ? "Titular (2010+)" : "Titular (2009-)";
    if (dados.carencia && dados.categoria !== "CNPJ") {
      tipo += " + carência";
    }
    return {
      titulo: tipo,
      meta: `${dados.categoria}${dados.modalidade ? ` - ${dados.modalidade}` : ""}`
    };
  }

  function renderizarInclusos(elementos) {
    const dadosTitular = descreverTitular(obterDadosTitular(elementos));
    const fragment = document.createDocumentFragment();

    fragment.appendChild(criarItemIncluso(dadosTitular.titulo, dadosTitular.meta));

    dependentes.forEach((dep, index) => {
      let titulo = dep.nascido2010
        ? `Dep. ${simplificarDependente(dep.tipo)} (2010+)`
        : `Dep. ${simplificarDependente(dep.tipo)} (2009-)`;

      if (dep.carencia) {
        titulo += " + carência";
      }

      fragment.appendChild(criarItemIncluso(titulo, dep.tipo, index));
    });

    elementos.listaInclusos.replaceChildren(fragment);
  }

  function criarItemIncluso(titulo, meta, dependenteIndex) {
    const item = document.createElement("div");
    item.className = "included-item";

    const texto = document.createElement("div");
    texto.className = "included-main";

    const tituloEl = document.createElement("span");
    tituloEl.className = "included-title";
    tituloEl.textContent = titulo;

    const metaEl = document.createElement("span");
    metaEl.className = "included-meta";
    metaEl.textContent = meta || "PF";

    texto.append(tituloEl, metaEl);
    item.appendChild(texto);

    if (Number.isInteger(dependenteIndex)) {
      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "remove-button";
      remover.dataset.index = String(dependenteIndex);
      remover.setAttribute("aria-label", `Remover ${titulo}`);
      remover.textContent = "x";
      item.appendChild(remover);
    }

    return item;
  }

  function validarFormulario(elementos) {
    const categoria = elementos.categoria.value;
    if (MODALIDADES[categoria] && !elementos.modalidade.value) {
      return `Selecione a modalidade de ${categoria}.`;
    }
    return "";
  }

  function mostrarStatus(elementos, mensagem, tipo) {
    elementos.status.textContent = mensagem;
    elementos.status.className = `status ${tipo || ""}`.trim();
  }

  function gerarLista(elementos) {
    const erro = validarFormulario(elementos);
    if (erro) {
      elementos.resultado.value = "";
      elementos.copiarLista.disabled = true;
      mostrarStatus(elementos, erro, "error");
      return;
    }

    const dados = obterDadosTitular(elementos);
    const texto = processarDocumentosParaWhatsapp(
      dados.nascido2010,
      dados.categoria,
      dados.modalidade,
      dados.carencia,
      dependentes
    );

    elementos.resultado.value = texto;
    elementos.copiarLista.disabled = !texto;
    mostrarStatus(elementos, "Lista gerada.", "success");
  }

  async function copiarResultado(elementos) {
    const texto = elementos.resultado.value.trim();
    if (!texto) {
      mostrarStatus(elementos, "Gere a lista antes de copiar.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(texto);
      mostrarStatus(elementos, "Copiado para a área de transferência.", "success");
    } catch (error) {
      elementos.resultado.focus();
      elementos.resultado.select();
      const copiou = document.execCommand("copy");
      mostrarStatus(
        elementos,
        copiou ? "Copiado para a área de transferência." : "Selecione o texto e use Ctrl+C para copiar.",
        copiou ? "success" : "error"
      );
    }
  }

  function adicionarDependente(elementos) {
    const tipo = elementos.dependenteTipo.value;
    if (!tipo) {
      mostrarStatus(elementos, "Selecione o tipo de dependente.", "error");
      return;
    }

    dependentes.push({
      tipo,
      nascido2010: elementos.dependenteNascido2010.checked,
      carencia: elementos.dependenteCarencia.checked
    });

    elementos.dependenteTipo.value = "";
    elementos.dependenteNascido2010.checked = false;
    elementos.dependenteCarencia.checked = false;
    mostrarStatus(elementos, "Dependente adicionado.", "success");
    renderizarInclusos(elementos);
  }

  function limparTudo(elementos) {
    dependentes = [];
    elementos.categoria.value = "PF";
    elementos.titularNascido2010.checked = false;
    elementos.titularCarencia.checked = false;
    elementos.dependenteTipo.value = "";
    elementos.dependenteNascido2010.checked = false;
    elementos.dependenteCarencia.checked = false;
    elementos.resultado.value = "";
    elementos.copiarLista.disabled = true;
    atualizarModalidades(elementos);
    renderizarInclusos(elementos);
    mostrarStatus(elementos, "", "");
  }

  function iniciarApp() {
    const elementos = getElementos();

    preencherDependentesSelect(elementos);
    atualizarModalidades(elementos);
    renderizarInclusos(elementos);

    elementos.categoria.addEventListener("change", () => {
      atualizarModalidades(elementos);
      renderizarInclusos(elementos);
    });

    elementos.modalidade.addEventListener("change", () => renderizarInclusos(elementos));
    elementos.titularNascido2010.addEventListener("change", () => renderizarInclusos(elementos));
    elementos.titularCarencia.addEventListener("change", () => renderizarInclusos(elementos));
    elementos.adicionarDependente.addEventListener("click", () => adicionarDependente(elementos));
    elementos.limparTudo.addEventListener("click", () => limparTudo(elementos));
    elementos.copiarLista.addEventListener("click", () => copiarResultado(elementos));

    elementos.listaInclusos.addEventListener("click", (event) => {
      const button = event.target.closest(".remove-button");
      if (!button) {
        return;
      }
      dependentes.splice(Number(button.dataset.index), 1);
      renderizarInclusos(elementos);
      mostrarStatus(elementos, "Dependente removido.", "success");
    });

    elementos.form.addEventListener("submit", (event) => {
      event.preventDefault();
      gerarLista(elementos);
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", iniciarApp);
  }

  const logic = {
    DEPENDENTE_TIPOS,
    MODALIDADES,
    obterDocumentosPadrao2010Mais,
    obterDocumentosPadrao2009Menos,
    obterDocumentosCarencia,
    obterDocumentosTitular,
    simplificarDependente,
    formatarDocumentosParaWhatsapp,
    obterDocumentosDependente,
    processarDocumentosParaWhatsapp
  };

  if (typeof window !== "undefined") {
    window.documentosPlanoSaude = logic;
  }

  if (typeof module !== "undefined") {
    module.exports = logic;
  }
})();
