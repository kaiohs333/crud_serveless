const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localstack:4566',
  s3ForcePathStyle: true,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

const BUCKET_NAME = 'shopping-images';

/**
 * Upload de foto para S3
 * Recebe: { base64Data, fileName }
 */
exports.handler = async (event) => {
  console.log('Upload handler called:', event);

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    if (!body.base64Data || !body.fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'base64Data e fileName são obrigatórios' })
      };
    }

    // Converter base64 para buffer
    const buffer = Buffer.from(body.base64Data, 'base64');
    
    // Fazer upload para S3
    const params = {
      Bucket: BUCKET_NAME,
      Key: `photos/${Date.now()}-${body.fileName}`,
      Body: buffer,
      ContentType: body.contentType || 'image/jpeg',
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Foto enviada com sucesso!',
        url: result.Location,
        key: result.Key
      })
    };

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erro ao fazer upload da foto',
        details: error.message 
      })
    };
  }
};
