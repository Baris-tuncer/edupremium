"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IyzicoService = void 0;
class IyzicoService {
  async createCheckoutForm(data) { return { checkoutFormContent: "", token: "mock" }; }
  async retrievePayment(token) { return { status: "success" }; }
}
exports.IyzicoService = IyzicoService;
