import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.bucketName = this.configService.get<string>(
      'MINIO_BUCKET_NAME',
      'lunchping',
    );

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>(
        'MINIO_ENDPOINT',
        'minio.yyyerin.co.kr',
      ),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '443')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', ''),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', ''),
    });

    await this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1'); // Region is required but often ignored for MinIO standalone
        this.logger.log(`Bucket '${this.bucketName}' created successfully.`);
      }

      await this.setPublicPolicy();
    } catch (error) {
      this.logger.error(
        `Failed to initialize bucket: ${error.message}`,
        error.stack,
      );
    }
  }

  private async setPublicPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    try {
      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy),
      );
      this.logger.log(
        `Public read policy set for bucket '${this.bucketName}'.`,
      );
    } catch (error) {
      this.logger.error(`Failed to set bucket policy: ${error.message}`);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return `https://file.yyyerin.co.kr/${this.bucketName}/${fileName}`;
  }

  get client() {
    return this.minioClient;
  }
}
