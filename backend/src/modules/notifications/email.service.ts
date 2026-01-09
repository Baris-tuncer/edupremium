import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendAppointmentConfirmation(email: string, data: any) {
    console.log(`Mock: Appointment confirmation to ${email}`);
  }

  async sendBankTransferInfo(email: string, data: any) {
    console.log(`Mock: Bank transfer info to ${email}`);
  }

  async sendAppointmentReminder(email: string, data: any) {
    console.log(`Mock: Reminder to ${email}`);
  }

  async sendWelcome(email: string, data: any) {
    console.log(`Mock: Welcome email to ${email}`);
  }

  async sendPasswordReset(email: string, token: string) {
    console.log(`Mock: Password reset to ${email}`);
  }
}
