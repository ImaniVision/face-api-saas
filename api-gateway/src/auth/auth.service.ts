import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import FormData from 'form-data';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private get mlServiceUrl() {
    return (
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:8000'
    );
  }

  async emailRegister(email: string, password: string) {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning();

    return this.generateToken(newUser.id, newUser.email);
  }

  async emailLogin(email: string, password: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      ...this.generateToken(user.id, user.email),
      user: { id: user.id, email: user.email },
    };
  }

  async register(email: string, imageBuffer: Buffer) {
    // Check if user exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Call ML Service to vectorize
    const vector = await this.getVectorFromMLService(imageBuffer);

    // Create user and save vector in transaction
    const newUser = await this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({
          email,
          password: await bcrypt.hash('placeholder-password', 10), // In a real app, you'd handle password properly
        })
        .returning();

      await tx.insert(schema.biometrics).values({
        userId: user.id,
        embedding: vector,
      });

      return user;
    });

    return this.generateToken(newUser.id, newUser.email);
  }

  async login(email: string, imageBuffer: Buffer) {
    // Get user from DB
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get stored vector
    const biometric = await this.db.query.biometrics.findFirst({
      where: eq(schema.biometrics.userId, user.id),
    });

    if (!biometric) {
      throw new UnauthorizedException('No biometric data found');
    }

    // Get vector for new image
    const newVector = await this.getVectorFromMLService(imageBuffer);

    // Compare vectors
    const similarity = this.cosineSimilarity(biometric.embedding, newVector);

    if (similarity > 0.6) {
      return this.generateToken(user.id, user.email);
    } else {
      throw new UnauthorizedException('Biometric verification failed');
    }
  }

  private async getVectorFromMLService(imageBuffer: Buffer): Promise<number[]> {
    const formData = new FormData();
    formData.append('file', imageBuffer, { filename: 'image.jpg' });
    const mlServiceKey =
      this.configService.getOrThrow<string>('ML_SERVICE_API_KEY');

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/vectorize`, formData, {
          headers: {
            ...formData.getHeaders(),
            'X-ML-Service-Key': mlServiceKey,
          },
        }),
      );
      return response.data.vector;
    } catch (error) {
      throw new BadRequestException('Failed to process image with ML service');
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magA * magB);
  }

  private generateToken(userId: string, email: string) {
    return {
      access_token: this.jwtService.sign({ sub: userId, email }),
    };
  }
}
