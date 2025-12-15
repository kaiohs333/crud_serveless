# CRUD Serverless com Notificações SNS

![Serverless](https://img.shields.io/badge/Serverless-v2.72.3-orange) ![Node.js](https://img.shields.io/badge/Node.js-v14.x-green) ![AWS](https://img.shields.io/badge/AWS%20(LocalStack)-Lambda%2C%20DynamoDB%2C%20SNS-yellow) ![Docker](https://img.shields.io/badge/Docker-Compose-blue)

> Projeto acadêmico para a disciplina de Desenvolvimento de Aplicações Móveis e Distribuídas, demonstrando a criação de uma API RESTful serverless utilizando o Serverless Framework, LocalStack para emulação de serviços AWS e Amazon SNS para notificações assíncronas.

---

### 📖 Índice

* [Sobre o Projeto](#-sobre-o-projeto)
* [Conceitos Fundamentais](#-conceitos-fundamentais)
* [✨ Features](#-features)
* [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
* [🚀 Como Executar o Projeto](#-como-executar-o-projeto)
* [🧪 Como Testar o Serviço](#-como-testar-o-serviço)
* [🧾 Evidências de Funcionamento](#-evidências-de-funcionamento)
* [👨‍💻 Autor](#-autor)

---

## 📱 Sobre o Projeto

Este projeto consiste em uma API CRUD (Create, Read, Update, Delete) completa, desenvolvida com uma arquitetura serverless. O objetivo é aplicar conceitos de computação em nuvem em um ambiente de desenvolvimento local, utilizando o **LocalStack** para simular os serviços da AWS.

A aplicação permite o gerenciamento de "itens" genéricos através de endpoints REST. Cada operação de criação ou atualização dispara uma notificação para um tópico **SNS (Simple Notification Service)**, que é consumida por outra função Lambda, demonstrando um fluxo de trabalho assíncrono e desacoplado.

## 🎓 Conceitos Fundamentais

*   **Serverless Framework**: Facilita a definição, o deploy e o gerenciamento de aplicações serverless. Toda a infraestrutura como código (IaC) é definida no arquivo `serverless.yml`.
*   **AWS Lambda & API Gateway**: O Lambda executa o código da aplicação em resposta a eventos, sem a necessidade de gerenciar servidores. O API Gateway expõe as funções Lambda como endpoints HTTP, criando uma API RESTful.
*   **Amazon DynamoDB**: Um banco de dados NoSQL totalmente gerenciado, utilizado para persistir os dados dos itens. É ideal para aplicações que precisam de baixa latência e alta escalabilidade.
*   **Amazon SNS (Simple Notification Service)**: Um serviço de mensageria pub/sub. No projeto, ele é usado para desacoplar a lógica de notificação das operações de escrita no banco de dados.
*   **LocalStack**: Uma ferramenta poderosa que emula os serviços da AWS em um contêiner Docker local, permitindo o desenvolvimento e teste de aplicações cloud-native sem custos e com um ciclo de feedback rápido.

---

## ✨ Features

*   **API REST com CRUD Completo**: Operações de Create, Read (todos e por ID), Update e Delete para gerenciamento de itens.
*   **Notificações com SNS**: Publicação de uma mensagem em um tópico SNS sempre que um item é criado ou atualizado.
*   **Subscriber Assíncrono**: Uma função Lambda (`snsListener`) inscrita no tópico SNS, que processa as notificações recebidas (neste caso, apenas registrando-as em log).
*   **Validação de Dados**: Os dados de entrada para criação e atualização de itens são validados usando a biblioteca `Joi`.
*   **Ambiente de Desenvolvimento Local**: Configuração completa com Docker Compose e o plugin `serverless-localstack` para simular o ambiente AWS.

---

## 🛠️ Tecnologias Utilizadas

*   **[Serverless Framework](https://www.serverless.com/)**: Framework principal para deploy da infraestrutura.
*   **[Node.js](https://nodejs.org/)**: Ambiente de execução para as funções Lambda.
*   **[LocalStack](https://localstack.cloud/)**: Emulador local de serviços da AWS.
*   **[Docker](https://www.docker.com/)**: Plataforma de contêineres para executar o LocalStack.
*   **Serviços AWS Emulados**:
    *   **Lambda**: Para a lógica de negócio.
    *   **API Gateway**: Para os endpoints REST.
    *   **DynamoDB**: Para a persistência de dados NoSQL.
    *   **SNS**: Para o sistema de notificações.
    *   **IAM, CloudFormation, S3**: Serviços auxiliares utilizados pelo Serverless Framework durante o deploy.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

*   **Node.js** e **npm** instalados.
*   **Docker** e **Docker Compose** instalados e em execução.

### Passos

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/kaiohs333/crud_serveless.git
    ```

2.  **Navegue até a pasta do projeto**:
    ```bash
    cd crud_serveless
    ```

3.  **Instale as dependências do projeto**:
    ```bash
    npm install
    ```

4.  **Inicie o ambiente LocalStack**:
    ```bash
    docker-compose up -d
    ```
    *   Você pode verificar se o contêiner está rodando com `docker ps`.

5.  **Faça o deploy do serviço para o LocalStack**:
    ```bash
    serverless deploy --stage local
    ```
    *   Aguarde a finalização. Ao término, os endpoints da API serão exibidos no terminal.

---

## 🧪 Como Testar o Serviço

Você pode usar ferramentas como **Postman** ou o comando **`curl`** para interagir com os endpoints da API, que são expostos na porta `4566`.

#### Criar um novo item
```bash
curl --location --request POST 'http://localhost:4566/local/items' \
--header 'Content-Type: application/json' \
--data-raw 
{
    "name": "Meu Primeiro Item",
    "description": "Este é um teste de criação"
}
```

#### Listar todos os itens
```bash
curl --location --request GET 'http://localhost:4566/local/items'
```

#### Verificar Logs de Notificação
Para confirmar que o `snsListener` está recebendo as notificações, você pode checar os logs do CloudWatch no dashboard do LocalStack ou usar a AWS CLI (apontada para o LocalStack).

---

## 🧾 Evidências de Funcionamento

Abaixo estão os logs que comprovam a implantação e o funcionamento do ambiente.

<details>
<summary><strong>1. Log de Deploy do Serverless (serverless deploy --stage local)</strong></summary>

```
(node:6205) NOTE: The AWS SDK for JavaScript (v2) has reached end-of-support.
It will no longer receive updates or releases.

Please migrate your code to use AWS SDK for JavaScript (v3).
For more information, check the blog post at https://a.co/cUPnyil
(Use `node --trace-warnings ...` to show where the warning was created)
(node:6205) NOTE: The AWS SDK for JavaScript (v2) has reached end-of-support.
It will no longer receive updates or releases.

Please migrate your code to use AWS SDK for JavaScript (v3).
For more information, check the blog post at https://a.co/cUPnyil
Serverless: Using serverless-localstack
Serverless: serverless-localstack: Reconfigured endpoints
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Skip plugin function AwsCompileFunctions.downloadPackageArtifacts (lambda.mountCode flag is enabled
)
Serverless: Skip plugin function AwsDeploy.extendedValidate (lambda.mountCode flag is enabled)
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
......
Serverless: Stack create finished...
Serverless: Ensuring that deployment bucket exists
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service index.js file to S3 (35.86 kB)...
Serverless: Validating template...
Serverless: Skipping template validation: Unsupported in Localstack
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..................................................................................
Serverless: Stack update finished...
Service Information
service: crud-serveless
stage: local
region: us-east-1
stack: crud-serveless-local
resources: 42
api keys:
  None
endpoints:
  POST - https://unknown.execute-api.localhost.localstack.cloud:4566/items
  GET - https://unknown.execute-api.localhost.localstack.cloud:4566/items
  GET - https://unknown.execute-api.localhost.localstack.cloud:4566/items/{id}
  PUT - https://unknown.execute-api.localhost.localstack.cloud:4566/items/{id}
  DELETE - https://unknown.execute-api.localhost.localstack.cloud:4566/items/{id}
functions:
  createItem: crud-serveless-local-createItem
  getAllItems: crud-serveless-local-getAllItems
  getItem: crud-serveless-local-getItem
  updateItem: crud-serveless-local-updateItem
  deleteItem: crud-serveless-local-deleteItem
  snsListener: crud-serveless-local-snsListener
layers:
  None
```
</details>

<details>
<summary><strong>2. Status do Contêiner Docker (docker ps)</strong></summary>

```
CONTAINER ID   IMAGE                   COMMAND                  CREATED          STATUS                    PORTS                                                                                                                                                       NAMES
846b8a3435a8   localstack/localstack   "docker-entrypoint.sh"   16 minutes ago   Up 16 minutes (healthy)   0.0.0.0:4510-4559->4510-4559/tcp, :::4510-4559->4510-4559/tcp, 0.0.0.0:4566->4566/tcp, :::4566->4566/tcp, 0.0.0.0:8081->8080/tcp, :::8081->8080/tcp   localstack_main
```
</details>

<details>
<summary><strong>3. Teste de Saúde Interno do LocalStack</strong></summary>

```
$ docker run --rm --network=crud_serveless_localstack-net curlimages/curl curl http://localstack:4566/_localstack/health

{"services": {"acm": "disabled", "apigateway": "available", "cloudformation": "available", "cloudwatch": "disabled", "config": "disabled", "dynamodb": "available", "dynamodbstreams": "available", "ec2": "disabled", "es": "disabled", "events": "disabled", "firehose": "disabled", "iam": "available", "kinesis": "available", "kms": "disabled", "lambda": "available", "logs": "available", "opensearch": "disabled", "redshift": "disabled", "resource-groups": "disabled", "resourcegroupstaggingapi": "disabled", "route53": "disabled", "route53resolver": "disabled", "s3": "available", "s3control": "disabled", "scheduler": "disabled", "secretsmanager": "disabled", "ses": "disabled", "sns": "available", "sqs": "disabled", "ssm": "disabled", "stepfunctions": "disabled", "sts": "available", "support": "disabled", "swf": "disabled", "transcribe": "disabled"}, "edition": "community", "version": "4.12.1.dev4"}
```
</details>

---

## 👨‍💻 Autor

*   **Kaio Henrique Oliveira da Silveira Barbosa**
*   **Email**: kaiohsilveira@gmail.com
