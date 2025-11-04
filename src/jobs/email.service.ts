import { Resend } from 'resend';
import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import 'dotenv/config';

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async renderTemplate(templateName: string, context: any): Promise<string> {
    const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const source = await fs.readFile(filePath, 'utf-8');
    const template = handlebars.compile(source);
    return template(context);
  }

  async sendEmail({
    to,
    subject,
    template,
    context,
  }: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }) {
    const html = await this.renderTemplate(template, context);

    await this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'hr@yourdomain.com',
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} (${template})`);
  }
}
