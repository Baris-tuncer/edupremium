import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
@Injectable()
export class NotificationsEventHandler {
  @OnEvent("appointment.created")
  handleAppointmentCreated(payload: any) {}
}