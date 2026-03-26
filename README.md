# 🏆 Projeto PD Sports

## Descrição do Projeto
O **PD Sports** é um projeto de e-commerce esportivo desenvolvido como um MVP (Minimum Viable Product), com o objetivo de simular uma loja virtual moderna e funcional.

A aplicação permite que usuários naveguem por diversas modalidades esportivas, visualizem produtos, utilizem filtros e realizem buscas, além de interagir com um carrinho de compras dinâmico. O sistema também conta com uma área administrativa, onde é possível gerenciar os produtos de forma completa.

O projeto foi construído utilizando tecnologias front-end e integração com APIs, incluindo persistência de dados via MockAPI, simulando um ambiente real de mercado sem a necessidade de um backend próprio.

O projeto foi desenvolvido em equipe por **Elias Costa**, **Igor Santos**, **Roger Leal**, **João Tavares**, todos integrantes da **Turma Q1 Vênus – Tarde**.

## Funcionalidades

### Área do Usuário

- Listagem dinâmica de produtos
- Filtro por modalidade
- Busca por nome
- Ordenação por preço
- Página de detalhes do produto

#### Carrinho de Compras

- Alteração de quantidade de itens
- Remoção de produtos
- Cálculo automático do total
- Simulação de frete
---

### Área Administrativa

- Cadastro de produtos
- Edição de produtos
- Exclusão de produtos
- Listagem administrativa
- Validação de dados


## Tecnologias Utilizadas
O projeto foi desenvolvido respeitando as tecnologias obrigatórias:

- HTML5 - estrutura semântica
- CSS3 - estilização
- JavaScript (ES6+) - lógica e interatividade
- Bootstrap - responsividade e layout
- MockAPI - persistência de dados
- Git e GitHub - versionamento
- Vercel - deploy da aplicação

## Integrações e API

O sistema utiliza:

- **MockAPI** para simulação de banco de dados e persistência
- **Melhor Envio**: utilizada para cálculo de frete em tempo real

Isso permite simular um ambiente real de e-commerce sem a necessidade de um backend completo.

## Arquitetura

### Estrutura de pastas

```

📁PDSports   
 |-📁 css               -> estilos
 |-📁 js                -> lógica
 |-📁 api               -> API para cálculo frete
 |-📁 img
 |  |-📁 backgrounds    -> imagens de fundo
 |  |-📁 banner         -> imagens de carrossel
 |  |-📁 products       -> imagens de produtos
 |  |-📁 svg            -> imagens de extensão SVG
 |-📁 pages             -> páginas do projeto
 |
 |-📄 .gitignore        -> arquivos ignorados
 |-📄 index.html        -> página inicial
 |-📄 README.md         -> arquivo de leia-me

```

### Boas práticas aplicadas

- Código modular e organizado  
- Reutilização de funções  
- Tratamento de erros  
- Uso de `async/await`  
- Separação de responsabilidades  
- Estrutura de pastas organizada  

## Endpoints

### API Externa - Melhor Envio

- **Método:** POST  
- **Endpoint:** `https://www.melhorenvio.com.br/api/v2/me/shipment/calculate`  
- **Descrição:** Calcula opções de frete com base no CEP enviado.  

### API - MockAPI

**Listar produtos**
- **Método:** GET 
- **Endpoint:** ``/products``
- **Descrição:** Retorna todos os produtos cadastrados
 
**Buscar produto por ID**
- **Método:** GET 
- **Endpoint:** ``/products/{id}``
- **Descrição:** Retorna um produto específico
 
**Criar produto**
- **Método:** POST
- **Endpoint:** ``/products``
- **Descrição:** Cadastra um novo produto
 
**Atualizar produto**
- **Método:** PUT 
- **Endpoint:** ``/products/{id}``
- **Descrição:** Atualiza um produto existente
 
**Deletar produto**
- **Método:** DELETE
- **Endpoint:** ``/products/{id}``
- **Descrição:** Remove um produto do sistema
 
**Listar usuários**
- **Método:** GET
- **Endpoint:** ``/users``
- **Descrição:** Retorna todos os usuários cadastrados
 
**Criar usuário**
- **Método:** POST
- **Endpoint:** ``/users``
- **Descrição:** Cadastra um novo usuário
 
## Autenticação

### Acesso ao Dashboard Administrativo

Para acessar a **área administrativa**, é necessário utilizar **exatamente** as seguintes credenciais:

* **Email:** `admin@gmail.com`
* **Senha:** `12345678`

### Acesso ao Dashboard do Usuário

Para acessar o **perfil do usuário**, é necessário já possuir as credenciais dentro da plataforma.

## Links

Repositório: [PD Sports - GitHub](https://github.com/rogermarllus/PDSports)  
Deploy: [PD Sports - Vercel](https://pdsports.vercel.app/)  
Figma: [PD Sports - Figma](https://www.figma.com/design/ZGcN88rYiQ7A2QbxOHvkTu/PD-Sports-%7C-Q1---V%C3%AAnus--Tarde-?node-id=3-3&p=f&t=aKGC0E7vDuHMZAUH-0)
