"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TeamsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const identity_1 = require("@azure/identity");
const azureTokenCredentials_1 = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
let TeamsService = TeamsService_1 = class TeamsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TeamsService_1.name);
        this.initializeClient();
        this.systemUserId = this.configService.get('MS_SYSTEM_USER_ID');
    }
    initializeClient() {
        const tenantId = this.configService.get('MS_TENANT_ID');
        const clientId = this.configService.get('MS_CLIENT_ID');
        const clientSecret = this.configService.get('MS_CLIENT_SECRET');
        const credential = new identity_1.ClientSecretCredential(tenantId, clientId, clientSecret);
        const authProvider = new azureTokenCredentials_1.TokenCredentialAuthenticationProvider(credential, {
            scopes: ['https://graph.microsoft.com/.default'],
        });
        this.graphClient = microsoft_graph_client_1.Client.initWithMiddleware({
            authProvider,
        });
    }
    async createMeeting(subject, startDateTime, endDateTime, teacherName, studentName) {
        try {
            const meeting = await this.graphClient
                .api(`/users/${this.systemUserId}/onlineMeetings`)
                .post({
                subject: subject,
                startDateTime: startDateTime.toISOString(),
                endDateTime: endDateTime.toISOString(),
                lobbyBypassSettings: {
                    scope: 'everyone',
                    isDialInBypassEnabled: true,
                },
                allowedPresenters: 'everyone',
                audioConferencing: null,
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
        }
        catch (error) {
            this.logger.error('Failed to create Teams meeting', error);
            throw error;
        }
    }
    async getMeetingDetails(meetingId) {
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
        }
        catch (error) {
            this.logger.error('Failed to get meeting details', error);
            return null;
        }
    }
    async deleteMeeting(meetingId) {
        try {
            await this.graphClient
                .api(`/users/${this.systemUserId}/onlineMeetings/${meetingId}`)
                .delete();
            this.logger.log(`Teams meeting deleted: ${meetingId}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to delete Teams meeting', error);
            return false;
        }
    }
    async updateMeeting(meetingId, updates) {
        try {
            const updateData = {};
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
        }
        catch (error) {
            this.logger.error('Failed to update Teams meeting', error);
            return null;
        }
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = TeamsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map