# Documentos para Plano de Saúde

Versão estática do gerador de documentos para plano de saúde. O app roda direto no navegador, sem Python, Gradio, servidor, banco de dados ou dependências.

## Como usar

Abra `index.html` no navegador, preencha os dados do titular, adicione dependentes se houver e clique em `Gerar lista`. O texto gerado fica pronto para copiar e colar no WhatsApp.

## Publicar no GitHub Pages

1. Crie um repositório chamado `documentos-plano-saude`.
2. Envie estes arquivos para a branch `main`.
3. No GitHub, abra `Settings > Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione branch `main` e pasta `/root`.
6. A URL esperada será:

```text
https://SEU_USUARIO.github.io/documentos-plano-saude/
```

## Arquivos

- `index.html`: estrutura da página.
- `style.css`: estilos responsivos.
- `script.js`: regras de documentos e interações da interface.

## Observacoes

O botão de copiar funciona melhor em HTTPS, como no GitHub Pages. Ao abrir o arquivo localmente, alguns navegadores podem bloquear a cópia automática; nesse caso, selecione o texto e use `Ctrl+C`.
