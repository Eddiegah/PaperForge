/**
 * Welcome email template for new PaperForge users.
 * Sent automatically when someone signs in for the first time.
 */

export function welcomeEmailHtml(name: string): string {
  const firstName = name?.split(' ')[0] || 'there';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to PaperForge</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                  <span style="font-size:20px;">📄</span>
                </div>
                <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Paper<span style="color:#c4b5fd;">Forge</span></span>
              </div>
              <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:12px 0 0;">Honest research-to-code acceleration</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;letter-spacing:-0.3px;">
                Welcome, ${firstName}!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                Your PaperForge account is ready. Here is what you can do right now.
              </p>

              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                ${[
                  { icon: '📊', title: 'Replication Difficulty Score', desc: 'Get a grounded 1-10 score for any ML paper based on how clearly it explains the implementation.' },
                  { icon: '💻', title: 'Annotated starter code', desc: 'Receive model.py, train.py, and data_loader.py with inline comments flagging every assumption.' },
                  { icon: '🐙', title: 'One-click GitHub export', desc: 'Push the generated repository directly to your GitHub account with no extra setup.' },
                ].map(f => `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:top;padding-top:2px;">
                          <span style="font-size:18px;">${f.icon}</span>
                        </td>
                        <td>
                          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b;">${f.title}</p>
                          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">${f.desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join('')}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.AUTH_URL || 'https://paper-forge-nu.vercel.app'}/dashboard"
                      style="display:inline-block;padding:14px 32px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:-0.2px;">
                      Start analyzing papers
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Try this paper -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:12px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.05em;">Try this first</p>
                <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#18181b;">Attention Is All You Need</p>
                <p style="margin:0;font-size:13px;color:#71717a;">arXiv: 1706.03762 - One of the clearest papers to start with. Score: ~2/10</p>
              </div>
            </td>
          </tr>

          <!-- Honest note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;border-top:1px solid #f4f4f5;padding-top:20px;">
                <strong style="color:#71717a;">A note on honest scope:</strong> PaperForge generates strong, annotated starting scaffolds - not guaranteed reproductions. The Replication Difficulty Score and inline annotations tell you exactly what to verify.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9fb;padding:20px 40px;text-align:center;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                PaperForge - Honest research-to-code acceleration<br/>
                <a href="${process.env.AUTH_URL || 'https://paper-forge-nu.vercel.app'}" style="color:#a1a1aa;text-decoration:none;">paper-forge-nu.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailText(name: string): string {
  const firstName = name?.split(' ')[0] || 'there';
  return `Welcome to PaperForge, ${firstName}!

Your account is ready.

PaperForge takes ML research papers and generates honest, annotated starter code with a Replication Difficulty Score that tells you exactly what is ambiguous.

Get started: ${process.env.AUTH_URL || 'https://paper-forge-nu.vercel.app'}/dashboard

Try this first: arXiv 1706.03762 (Attention Is All You Need) - a great calibration paper.

-- PaperForge team`;
}
