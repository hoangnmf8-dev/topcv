import { resend } from "../utils/mail";

type TemplateVariableValue = string | number;
interface SendTemplateEmailParams {
  recipientEmail: string;
  templateId: string;
  variables: Record<string, TemplateVariableValue>;
  subject?: string;
};
class MailService {
  async sendTemplateEmail(params: SendTemplateEmailParams): Promise<string> {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const fromName = process.env.RESEND_FROM_NAME ?? "TOPCV";
    if (!fromEmail) {
      throw new Error("Thiếu biến môi trường RESEND_FROM_EMAIL");
    }
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [params.recipientEmail],
      ...(params.subject ? { subject: params.subject } : {}),
      template: {
        id: params.templateId,
        variables: params.variables,
      },
    });
    if (error) {
      throw new Error(`Gửi email thất bại: ${error.message}`);
    };
    if (!data) {
      throw new Error("Resend không trả về thông tin email");
    };
    return data.id;
  };
};

export const mailService = new MailService();
