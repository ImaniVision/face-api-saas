import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly portalOrigin: string;

  constructor(config: ConfigService) {
    const user = config.get<string>('SMTP_USER');
    // nodemailer silently falls back to port 587 on an empty/invalid port.
    const port = Number(config.getOrThrow<string>('SMTP_PORT'));
    if (!Number.isInteger(port) || port <= 0) {
      throw new Error('SMTP_PORT must be a port number, e.g. 1025');
    }
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port,
      auth: user
        ? { user, pass: config.getOrThrow<string>('SMTP_PASS') }
        : undefined,
    });
    this.from = config.getOrThrow<string>('MAIL_FROM');
    this.portalOrigin = config.getOrThrow<string>('PORTAL_ORIGIN');
  }

  async sendVerification(to: string, token: string): Promise<void> {
    const link = `${this.portalOrigin}/verify-email?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Verify your Imani Vision email',
      text: `Confirm your email to start creating API keys:\n\n${link}\n\nThis link expires in 24 hours. If you didn't sign up, ignore this email.`,
    });
  }
}
