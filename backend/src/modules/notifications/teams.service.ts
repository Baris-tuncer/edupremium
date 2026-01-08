// ============================================================================
// MICROSOFT TEAMS SERVICE
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

export interface TeamsMeetingDetails {
  meetingId: string;
  joinUrl: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
}

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  private graphClient: Client;
  private systemUserId: string;

  constructor(private configService: ConfigService) {
    this.initializeClient();
    this.systemUserId = this.configService.get<string>('MS_SYSTEM_USER_ID')!;
  }

  private initializeClient(): void {
    const tenantId = this.configService.get<string>('MS_TENANT_ID');
    const clientId = this.configService.get<string>('MS_CLIENT_ID');
    const clientSecret = this.configService.get<string>('MS_CLIENT_SECRET');

    const credential = new ClientSecretCredential(tenantId!, clientId!, clientSecret!);

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    this.graphClient = Client.initWithMiddleware({
      authProvider,
    });
  }

  // ========================================
  // CREATE ONLINE MEETING
  // ========================================
  async createMeeting(
    subject: string,
    startDateTime: Date,
    endDateTime: Date,
    teacherName: string,
    studentName: string,
  ): Promise<TeamsMeetingDetails> {
    try {
      const meeting = await this.graphClient
        .api(`/users/${this.systemUserId}/onlineMeetings`)
        .post({
          subject: subject,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          lobbyBypassSettings: {
            scope: 'everyone', // Everyone can join directly
            isDialInBypassEnabled: true,
          },
          allowedPresenters: 'everyone',
          audioConferencing: null, // VoIP only
          participants: {
            organizer: {
              identity: {
                user: {
                  id: this.systemUserId,
                },
              },
            },
          },
        });

      this.logger.log(`Teams meeting created: ${meeting.id}`);

      return {
        meetingId: meeting.id,
        joinUrl: meeting.joinWebUrl,
        subject: meeting.subject,
        startDateTime: meeting.startDateTime,
        endDateTime: meeting.endDateTime,
      };
    } catch (error) {
      this.logger.error('Failed to create Teams meeting', error);
      throw error;
    }
  }

  // ========================================
  // GET MEETING DETAILS
  // ========================================
  async getMeetingDetails(meetingId: string): Promise<TeamsMeetingDetails | null> {
    try {
      const meeting = await this.graphClient
        .api(`/users/${this.systemUserId}/onlineMeetings/${meetingId}`)
        .get();

      return {
        meetingId: meeting.id,
        joinUrl: meeting.joinWebUrl,
        subject: meeting.subject,
        startDateTime: meeting.startDateTime,
        endDateTime: meeting.endDateTime,
      };
    } catch (error) {
      this.logger.error('Failed to get meeting details', error);
      return null;
    }
  }

  // ========================================
  // DELETE MEETING
  // ========================================
  async deleteMeeting(meetingId: string): Promise<boolean> {
    try {
      await this.graphClient
        .api(`/users/${this.systemUserId}/onlineMeetings/${meetingId}`)
        .delete();

      this.logger.log(`Teams meeting deleted: ${meetingId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete Teams meeting', error);
      return false;
    }
  }

  // ========================================
  // UPDATE MEETING
  // ========================================
  async updateMeeting(
    meetingId: string,
    updates: {
      subject?: string;
      startDateTime?: Date;
      endDateTime?: Date;
    },
  ): Promise<TeamsMeetingDetails | null> {
    try {
      const updateData: any = {};

      if (updates.subject) {
        updateData.subject = updates.subject;
      }
      if (updates.startDateTime) {
        updateData.startDateTime = updates.startDateTime.toISOString();
      }
      if (updates.endDateTime) {
        updateData.endDateTime = updates.endDateTime.toISOString();
      }

      const meeting = await this.graphClient
        .api(`/users/${this.systemUserId}/onlineMeetings/${meetingId}`)
        .patch(updateData);

      return {
        meetingId: meeting.id,
        joinUrl: meeting.joinWebUrl,
        subject: meeting.subject,
        startDateTime: meeting.startDateTime,
        endDateTime: meeting.endDateTime,
      };
    } catch (error) {
      this.logger.error('Failed to update Teams meeting', error);
      return null;
    }
  }
}
