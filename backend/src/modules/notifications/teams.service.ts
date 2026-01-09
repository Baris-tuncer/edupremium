// ============================================================================
// TEAMS SERVICE - Matches NotificationsListener exactly
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TeamsMeetingResult {
  success: boolean;
  meetingId?: string;
  joinUrl?: string;
  error?: string;
}

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(private configService: ConfigService) {}

  // Listener calls: createMeeting(appointmentId, subject, scheduledAt, durationMinutes)
  async createMeeting(
    appointmentId: string,
    subject: string,
    startTime: Date,
    durationMinutes: number,
  ): Promise<TeamsMeetingResult> {
    this.logger.log(`[TEAMS] Creating meeting for appointment: ${appointmentId}`);

    // Mock implementation - integrate with Microsoft Graph API in production
    const mockMeetingId = `meeting_${appointmentId}_${Date.now()}`;
    const joinUrl = `https://teams.microsoft.com/l/meetup-join/${mockMeetingId}`;

    return {
      success: true,
      meetingId: mockMeetingId,
      joinUrl,
    };
  }

  // Listener calls: deleteMeeting(meetingId)
  async deleteMeeting(meetingId: string): Promise<boolean> {
    this.logger.log(`[TEAMS] Deleting meeting: ${meetingId}`);
    // Mock implementation
    return true;
  }

  // Alias
  async cancelMeeting(meetingId: string): Promise<boolean> {
    return this.deleteMeeting(meetingId);
  }

  async updateMeeting(
    meetingId: string,
    data: { subject?: string; startTime?: Date; endTime?: Date },
  ): Promise<TeamsMeetingResult> {
    this.logger.log(`[TEAMS] Updating meeting: ${meetingId}`);
    return {
      success: true,
      meetingId,
      joinUrl: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
    };
  }

  async getMeetingDetails(meetingId: string): Promise<any> {
    return {
      id: meetingId,
      subject: 'Meeting',
      joinUrl: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
    };
  }
}
