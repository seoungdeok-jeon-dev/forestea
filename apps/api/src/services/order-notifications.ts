import { prisma, type Order, type OrderItem } from "@forestea/db";

type OrderWithItems = Order & { items: OrderItem[] };

// Providers are called with a hard timeout so a hanging provider can never
// stall the checkout response after the customer has already been charged.
const REQUEST_TIMEOUT_MS = 8_000;

interface EmailConfig {
  apiKey: string;
  from: string;
  replyTo?: string;
}

interface SmsConfig {
  accountSid: string;
  authToken: string;
  from: string;
  /** Twilio accepts either a messaging service SID or a plain sender number. */
  fromIsMessagingService: boolean;
}

function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) return null;
  return {
    apiKey,
    from,
    replyTo: process.env.ORDER_EMAIL_REPLY_TO || undefined,
  };
}

function getSmsConfig(): SmsConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const from = messagingServiceSid || fromNumber;
  if (!accountSid || !authToken || !from) return null;
  return {
    accountSid,
    authToken,
    from,
    fromIsMessagingService: Boolean(messagingServiceSid),
  };
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Twilio only accepts E.164. Checkout collects free-form phone input, so
 * normalize the common US formats and return null when we cannot be confident —
 * skipping the text is better than sending it to the wrong number.
 */
function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function confirmationUrl(orderId: string): string | null {
  const origin = process.env.WEB_ORIGIN;
  if (!origin) return null;
  return `${origin.replace(/\/$/, "")}/order/confirmation?id=${orderId}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstName(order: OrderWithItems): string | null {
  const name = order.customerName?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0] ?? null;
}

function buildEmailHtml(order: OrderWithItems): string {
  const greeting = firstName(order)
    ? `Thanks, ${escapeHtml(firstName(order)!)}!`
    : "Thanks for your order!";
  const url = confirmationUrl(order.id);

  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#2c2a26;font-size:14px;">
          ${item.quantity}&times; ${escapeHtml(item.name)}
        </td>
        <td style="padding:8px 0;color:#2c2a26;font-size:14px;text-align:right;">
          ${formatMoney(item.unitPriceCents * item.quantity)}
        </td>
      </tr>`,
    )
    .join("");

  const totalRow = (label: string, cents: number, bold = false) => `
      <tr>
        <td style="padding:4px 0;color:${bold ? "#2c2a26" : "#6f6a61"};font-size:${bold ? "16px" : "14px"};${bold ? "font-weight:600;" : ""}">
          ${label}
        </td>
        <td style="padding:4px 0;color:${bold ? "#2c2a26" : "#6f6a61"};font-size:${bold ? "16px" : "14px"};text-align:right;${bold ? "font-weight:600;" : ""}">
          ${formatMoney(cents)}
        </td>
      </tr>`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0;color:#6f6a61;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">
                  Forestea
                </p>
                <h1 style="margin:12px 0 0;color:#2c2a26;font-size:26px;font-weight:600;">
                  ${greeting}
                </h1>
                <p style="margin:12px 0 0;color:#6f6a61;font-size:14px;line-height:1.6;">
                  We received your order and will have it ready for pickup soon.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #e8e4dd;padding-top:16px;">
                  ${rows}
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #e8e4dd;padding-top:12px;">
                  ${totalRow("Subtotal", order.subtotalCents)}
                  ${totalRow("Tax", order.taxCents)}
                  ${totalRow("Total", order.totalCents, true)}
                </table>

                ${
                  order.pickupNote
                    ? `<p style="margin:24px 0 0;color:#6f6a61;font-size:14px;line-height:1.6;">
                         <strong style="color:#2c2a26;">Pickup note:</strong>
                         ${escapeHtml(order.pickupNote)}
                       </p>`
                    : ""
                }

                <p style="margin:24px 0 0;color:#6f6a61;font-size:13px;">
                  Order ID: <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${order.id}</span>
                </p>

                ${
                  url
                    ? `<p style="margin:28px 0 0;">
                         <a href="${url}" style="display:inline-block;background:#2c2a26;color:#ffffff;text-decoration:none;font-size:14px;padding:12px 24px;border-radius:999px;">
                           View your order
                         </a>
                       </p>`
                    : ""
                }
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;color:#9a948a;font-size:12px;">
            You are receiving this email because you placed an order at Forestea.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildEmailText(order: OrderWithItems): string {
  const lines = [
    firstName(order) ? `Thanks, ${firstName(order)}!` : "Thanks for your order!",
    "",
    "We received your order and will have it ready for pickup soon.",
    "",
    ...order.items.map(
      (item) =>
        `${item.quantity}x ${item.name} — ${formatMoney(item.unitPriceCents * item.quantity)}`,
    ),
    "",
    `Subtotal: ${formatMoney(order.subtotalCents)}`,
    `Tax: ${formatMoney(order.taxCents)}`,
    `Total: ${formatMoney(order.totalCents)}`,
  ];

  if (order.pickupNote) {
    lines.push("", `Pickup note: ${order.pickupNote}`);
  }

  lines.push("", `Order ID: ${order.id}`);

  const url = confirmationUrl(order.id);
  if (url) lines.push("", `View your order: ${url}`);

  return lines.join("\n");
}

function buildSmsBody(order: OrderWithItems): string {
  const name = firstName(order);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const url = confirmationUrl(order.id);

  const parts = [
    `Forestea: ${name ? `Thanks ${name}! ` : ""}Order confirmed — ${itemCount} item${itemCount === 1 ? "" : "s"}, ${formatMoney(order.totalCents)}.`,
    "We'll have it ready for pickup soon.",
  ];
  if (url) parts.push(url);

  return parts.join(" ");
}

async function sendEmail(order: OrderWithItems): Promise<"sent" | "skipped"> {
  const config = getEmailConfig();
  if (!config) return "skipped";

  const to = order.customerEmail?.trim();
  if (!to) return "skipped";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [to],
      ...(config.replyTo ? { reply_to: config.replyTo } : {}),
      subject: `Your Forestea order is confirmed (${formatMoney(order.totalCents)})`,
      html: buildEmailHtml(order),
      text: buildEmailText(order),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
  return "sent";
}

async function sendSms(order: OrderWithItems): Promise<"sent" | "skipped"> {
  const config = getSmsConfig();
  if (!config) return "skipped";

  const to = toE164(order.customerPhone);
  if (!to) return "skipped";

  const body = new URLSearchParams({ To: to, Body: buildSmsBody(order) });
  if (config.fromIsMessagingService) {
    body.set("MessagingServiceSid", config.from);
  } else {
    body.set("From", config.from);
  }

  const credentials = Buffer.from(
    `${config.accountSid}:${config.authToken}`,
  ).toString("base64");

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );

  if (!res.ok) {
    throw new Error(`Twilio ${res.status}: ${await res.text()}`);
  }
  return "sent";
}

/**
 * Sends the customer their order confirmation by email and SMS. Never throws:
 * the payment has already been captured by the time this runs, so a notification
 * failure must not turn a successful order into an error for the customer.
 */
export async function sendOrderNotifications(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      console.error(`[notifications] order ${orderId} not found`);
      return;
    }

    const [email, sms] = await Promise.allSettled([
      sendEmail(order),
      sendSms(order),
    ]);

    if (email.status === "rejected") {
      console.error(`[notifications] email failed for ${orderId}:`, email.reason);
    }
    if (sms.status === "rejected") {
      console.error(`[notifications] sms failed for ${orderId}:`, sms.reason);
    }
  } catch (err) {
    console.error(`[notifications] failed for ${orderId}:`, err);
  }
}
