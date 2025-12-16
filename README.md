# Shopping Images - AWS LocalStack S3 Upload

Projeto demonstrando integração de upload de fotos em um app móvel Flutter com armazenamento em S3 via AWS LocalStack.

## 📋 Contexto

Substituição do armazenamento de arquivos locais, introduzindo armazenamento de objetos (S3) para as fotos tiradas no aplicativo móvel. O LocalStack simula um bucket S3 da AWS localmente, permitindo que as fotos sejam armazenadas "na nuvem" em vez de ficarem apenas no dispositivo.

## 🎯 Objetivo

Configurar o LocalStack para simular um bucket S3 da AWS localmente e integrar com um backend Serverless para permitir o upload seguro de fotos do app mobile.

## 📁 Estrutura do Projeto

```
.
├── docker-compose.yml          # Configuração LocalStack + DynamoDB Admin
├── serverless.yml              # Configuração funções AWS (Serverless Framework)
├── functions/                  # Funções Lambda
│   ├── uploadPhoto.js          # Handler para upload de fotos para S3
│   ├── createItem.js           # Criar item no DynamoDB
│   ├── getItem.js              # Buscar item
│   ├── listItems.js            # Listar items
│   ├── updateItem.js           # Atualizar item
│   ├── deleteItem.js           # Deletar item
│   └── snsSubscriber.js        # Processar notificações SNS
├── lib/                        # App Flutter (Dart)
├── localstack/
│   └── init-scripts/
│       └── 10-create-bucket.sh # Script para criar bucket S3
├── package.json                # Dependências Node.js
├── pubspec.yaml                # Dependências Flutter
└── README.md                   # Este arquivo
```

## 🔧 Pré-requisitos

- Docker e Docker Compose
- Node.js 18.x
- Flutter SDK
- AWS CLI (opcional, para testes via terminal)
- Serverless Framework

### Instalação das ferramentas

```bash
# Node.js (macOS com Homebrew)
brew install node

# Docker Desktop
# https://www.docker.com/products/docker-desktop

# Flutter SDK
# https://flutter.dev/docs/get-started/install

# Serverless Framework
npm install -g serverless

# AWS CLI
brew install awscli
```

## 🚀 Como Executar

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd local_stack_aws
```

### 2. Iniciar o LocalStack

```bash
docker-compose up -d
```

Isto irá:
- Subir o container LocalStack na porta `4566`
- Subir o DynamoDB Admin na porta `8001`
- Criar automaticamente o bucket S3 `shopping-images`

Verificar status:
```bash
docker-compose ps
```

### 3. Verificar buckets criados

```bash
# Configure AWS CLI para LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Listar buckets
aws s3 ls --endpoint-url http://localhost:4566
```

Você deve ver:
```
2025-12-16 18:30:00 shopping-images
```

### 4. Fazer deploy das funções Lambda

```bash
# Instalar dependências
npm install

# Deploy local
serverless deploy --stage local
```

### 5. Testar o endpoint de upload

```bash
# Preparar uma imagem em base64 (exemplo simplificado)
BASE64_IMAGE=$(base64 -i ./path/to/image.jpg)

# POST para o endpoint
curl -X POST http://localhost:3000/photos/upload \
  -H "Content-Type: application/json" \
  -d "{
    \"base64Data\": \"$BASE64_IMAGE\",
    \"fileName\": \"product-photo.jpg\",
    \"contentType\": \"image/jpeg\"
  }"
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Foto enviada com sucesso!",
  "url": "http://localstack:4566/shopping-images/photos/1702760400000-product-photo.jpg",
  "key": "photos/1702760400000-product-photo.jpg"
}
```

### 6. Verificar fotos no S3

```bash
# Listar objetos no bucket
aws s3 ls s3://shopping-images --recursive --endpoint-url http://localhost:4566

# Ou via DynamoDB Admin (UI)
# Acesse: http://localhost:8001
```

### 7. Rodar app Flutter (opcional)

```bash
# No diretório do projeto
flutter pub get
flutter run

# Em um device ou emulador específico
flutter run -d <device-id>
```

## 📱 Integração no App Flutter

Exemplo de como enviar foto para o backend:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> uploadPhoto(String imagePath) async {
  final bytes = await File(imagePath).readAsBytes();
  final base64Image = base64Encode(bytes);
  
  final response = await http.post(
    Uri.parse('http://localhost:3000/photos/upload'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'base64Data': base64Image,
      'fileName': 'product-${DateTime.now().millisecondsSinceEpoch}.jpg',
      'contentType': 'image/jpeg'
    }),
  );
  
  if (response.statusCode == 200) {
    final result = jsonDecode(response.body);
    print('Foto salva em: ${result['url']}');
  }
}
```

## 🔍 Debugging

### Verificar logs do LocalStack

```bash
docker-compose logs localstack
```

### Acessar console DynamoDB Admin

```
http://localhost:8001
```

### Inspecionar estrutura S3

```bash
aws s3api list-objects-v2 \
  --bucket shopping-images \
  --endpoint-url http://localhost:4566
```

### Parar containers

```bash
docker-compose down

# Remover dados persistidos
docker-compose down -v
```

## 📊 Endpoints disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/photos/upload` | Upload de foto para S3 |
| POST | `/items` | Criar novo item |
| GET | `/items` | Listar todos os items |
| GET | `/items/{id}` | Buscar item por ID |
| PUT | `/items/{id}` | Atualizar item |
| DELETE | `/items/{id}` | Deletar item |

## 🔐 Segurança em Produção

⚠️ **IMPORTANTE:** Este projeto usa credenciais de teste. Para produção:

1. Use IAM roles/policies reais
2. Implemente autenticação e autorização
3. Valide base64 e tipos de arquivo
4. Implemente rate limiting
5. Use HTTPS
6. Valide tamanho máximo de arquivo

## 📝 Variáveis de Ambiente

Crie um `.env` se necessário:

```bash
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
LOCALSTACK_ENDPOINT=http://localhost:4566
BUCKET_NAME=shopping-images
```

## 🛠️ Troubleshooting

### LocalStack não inicia
```bash
docker-compose logs localstack
docker-compose restart localstack
```

### Bucket não é criado automaticamente
```bash
# Executar script manualmente
docker-compose exec localstack bash /docker-entrypoint-initaws.d/10-create-bucket.sh
```

### Erro de conexão ao fazer upload
- Verifique se LocalStack está rodando: `docker-compose ps`
- Verifique ports: `lsof -i :4566`
- Verifique variáveis de ambiente do backend

### Node modules corrompidos
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Referências

- [LocalStack Documentation](https://docs.localstack.cloud/)
- [AWS S3 SDK JS](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-examples.html)
- [Serverless Framework](https://www.serverless.com/framework/docs)
- [Flutter Image Handling](https://flutter.dev/docs/development/data-and-backend/json)

## 📄 Licença

Este projeto é fornecido como material educacional para a disciplina de Cloud AWS.

## ✅ Checklist para Apresentação em Sala

- [ ] LocalStack rodando (`docker-compose up`)
- [ ] Bucket `shopping-images` criado
- [ ] Endpoint `/photos/upload` responsivo
- [ ] App Flutter tira foto e envia para backend
- [ ] Foto aparece no S3 local (`aws s3 ls s3://shopping-images`)
- [ ] DynamoDB Admin acessível em `localhost:8001`
- [ ] Logs mostram upload bem-sucedido

---

**Desenvolvido para:** PUC Minas - Engenharia de Software  
**Data:** Dezembro 2025
