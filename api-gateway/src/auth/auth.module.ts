import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from './mail.service';
import { MlModule } from '../ml/ml.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [MlModule, SubjectsModule],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
