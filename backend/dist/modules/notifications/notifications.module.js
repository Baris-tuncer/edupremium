"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const notifications_service_1 = require("./notifications.service");
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
const teams_service_1 = require("./teams.service");
const notifications_processor_1 = require("./notifications.processor");
const notifications_event_handler_1 = require("./notifications.event-handler");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'notifications',
            }),
        ],
        providers: [
            notifications_service_1.NotificationsService,
            email_service_1.EmailService,
            sms_service_1.SmsService,
            teams_service_1.TeamsService,
            notifications_processor_1.NotificationsProcessor,
            notifications_event_handler_1.NotificationsEventHandler,
        ],
        exports: [notifications_service_1.NotificationsService, email_service_1.EmailService, sms_service_1.SmsService, teams_service_1.TeamsService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map