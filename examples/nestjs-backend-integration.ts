// """
// Example NestJS Backend Integration
// This shows how to integrate the ML service with your NestJS backend.
// """

// // ============================================
// // 1. DATABASE SCHEMA (PostgreSQL + Prisma)
// // ============================================

// // schema.prisma
// model User {
//   id               String    @id @default(uuid())
//   email            String    @unique
//   name             String
//   biometric_vector Float[]   // Store as array of floats
//   createdAt        DateTime  @default(now())
//   updatedAt        DateTime  @updatedAt
// }

// // Alternative: Using pgvector extension for efficient similarity search
// // First, enable pgvector in PostgreSQL:
// // CREATE EXTENSION vector;

// // Then in Prisma:
// // biometric_vector Unsupported("vector(512)")


// // ============================================
// // 2. ML SERVICE CLIENT (ml-service.client.ts)
// // ============================================

// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import FormData from 'form-data';
// import axios from 'axios';

// @Injectable()
// export class MLServiceClient {
//   private readonly mlServiceUrl: string;

//   constructor(private configService: ConfigService) {
//     this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
//   }

//   /**
//    * Generate facial embedding vector from image
//    * @param imageBuffer - Image file buffer
//    * @returns 512-dimensional vector
//    */
//   async vectorize(imageBuffer: Buffer): Promise<number[]> {
//     try {
//       const formData = new FormData();
//       formData.append('file', imageBuffer, 'image.jpg');

//       const response = await axios.post(
//         `${this.mlServiceUrl}/vectorize`,
//         formData,
//         {
//           headers: formData.getHeaders(),
//           timeout: 10000, // 10 second timeout
//         }
//       );

//       return response.data.vector;
//     } catch (error) {
//       if (error.response?.status === 400) {
//         // Face detection error (no face, multiple faces, etc.)
//         throw new HttpException(
//           error.response.data.detail || 'Face detection failed',
//           HttpStatus.BAD_REQUEST
//         );
//       }
      
//       throw new HttpException(
//         'ML service unavailable',
//         HttpStatus.SERVICE_UNAVAILABLE
//       );
//     }
//   }

//   /**
//    * Verify if live image matches saved vector
//    * @param imageBuffer - Live image buffer
//    * @param savedVector - Saved 512D vector from database
//    * @returns { match: boolean, confidence: number }
//    */
//   async verifyUser(
//     imageBuffer: Buffer,
//     savedVector: number[]
//   ): Promise<{ match: boolean; confidence: number }> {
//     try {
//       const formData = new FormData();
//       formData.append('file', imageBuffer, 'image.jpg');
//       formData.append('saved_vector', JSON.stringify(savedVector));

//       const response = await axios.post(
//         `${this.mlServiceUrl}/verify_user`,
//         formData,
//         {
//           headers: formData.getHeaders(),
//           timeout: 10000,
//         }
//       );

//       return response.data;
//     } catch (error) {
//       if (error.response?.status === 400) {
//         throw new HttpException(
//           error.response.data.detail || 'Face verification failed',
//           HttpStatus.BAD_REQUEST
//         );
//       }
      
//       throw new HttpException(
//         'ML service unavailable',
//         HttpStatus.SERVICE_UNAVAILABLE
//       );
//     }
//   }
// }


// // ============================================
// // 3. AUTH SERVICE (auth.service.ts)
// // ============================================

// import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from './prisma.service';
// import { MLServiceClient } from './ml-service.client';

// @Injectable()
// export class AuthService {
//   constructor(
//     private prisma: PrismaService,
//     private jwtService: JwtService,
//     private mlService: MLServiceClient,
//   ) {}

//   /**
//    * Register new user with facial biometric
//    */
//   async registerWithFace(
//     email: string,
//     name: string,
//     faceImageBuffer: Buffer
//   ) {
//     // Check if user already exists
//     const existingUser = await this.prisma.user.findUnique({
//       where: { email }
//     });

//     if (existingUser) {
//       throw new BadRequestException('User already exists');
//     }

//     // Generate facial embedding
//     const vector = await this.mlService.vectorize(faceImageBuffer);

//     // Save user with biometric vector
//     const user = await this.prisma.user.create({
//       data: {
//         email,
//         name,
//         biometric_vector: vector,
//       },
//     });

//     // Generate JWT token
//     const token = this.jwtService.sign({
//       userId: user.id,
//       email: user.email,
//     });

//     return {
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//       },
//       token,
//     };
//   }

//   /**
//    * Login user with facial biometric
//    */
//   async loginWithFace(email: string, faceImageBuffer: Buffer) {
//     // Retrieve user and their saved vector
//     const user = await this.prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       throw new UnauthorizedException('User not found');
//     }

//     if (!user.biometric_vector || user.biometric_vector.length === 0) {
//       throw new BadRequestException('No biometric data registered for this user');
//     }

//     // Verify face against saved vector
//     const { match, confidence } = await this.mlService.verifyUser(
//       faceImageBuffer,
//       user.biometric_vector
//     );

//     if (!match) {
//       throw new UnauthorizedException(
//         `Face verification failed (confidence: ${confidence.toFixed(2)})`
//       );
//     }

//     // Generate JWT token
//     const token = this.jwtService.sign({
//       userId: user.id,
//       email: user.email,
//     });

//     return {
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//       },
//       token,
//       confidence, // Optional: return confidence score
//     };
//   }
// }


// // ============================================
// // 4. AUTH CONTROLLER (auth.controller.ts)
// // ============================================

// import {
//   Controller,
//   Post,
//   Body,
//   UploadedFile,
//   UseInterceptors,
//   BadRequestException,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { AuthService } from './auth.service';

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Post('register')
//   @UseInterceptors(FileInterceptor('face_image'))
//   async register(
//     @Body('email') email: string,
//     @Body('name') name: string,
//     @UploadedFile() faceImage: Express.Multer.File,
//   ) {
//     if (!faceImage) {
//       throw new BadRequestException('Face image is required');
//     }

//     return this.authService.registerWithFace(
//       email,
//       name,
//       faceImage.buffer
//     );
//   }

//   @Post('login')
//   @UseInterceptors(FileInterceptor('face_image'))
//   async login(
//     @Body('email') email: string,
//     @UploadedFile() faceImage: Express.Multer.File,
//   ) {
//     if (!faceImage) {
//       throw new BadRequestException('Face image is required');
//     }

//     return this.authService.loginWithFace(email, faceImage.buffer);
//   }
// }


// // ============================================
// // 5. ENVIRONMENT VARIABLES (.env)
// // ============================================

// /*
// ML_SERVICE_URL=http://localhost:8000
// JWT_SECRET=your-secret-key
// DATABASE_URL=postgresql://user:password@localhost:5432/mydb
// */


// // ============================================
// // 6. MODULE SETUP (auth.module.ts)
// // ============================================

// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { MLServiceClient } from './ml-service.client';
// import { PrismaService } from './prisma.service';

// @Module({
//   imports: [
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//         signOptions: { expiresIn: '7d' },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, MLServiceClient, PrismaService],
//   exports: [AuthService],
// })
// export class AuthModule {}
