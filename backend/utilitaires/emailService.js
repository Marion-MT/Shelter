const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,      // smtp-relay.brevo.com
    port: process.env.SMTP_PORT,      // 587
    secure: false,                     // ⚠️ IMPORTANT: false pour le port 587
    auth: {
        user: process.env.SMTP_USER,  // votre email
        pass: process.env.SMTP_PASS   // votre clé SMTP
    }
});

async function sendResetEmail(email, resetLink) {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - Shelter',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #342C29; padding: 20px; border-radius: 12px;">
                <h2 style="color: #FFE7BF; text-align: center;">🔐 Réinitialisation de mot de passe</h2>
                <p style="color: #FFE7BF;">Survivant ! </p>
                <p style="color: #FFE7BF;">Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p style="color: #FFE7BF;">Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
                
                <!-- ✅ Lien texte simple sans bouton pour éviter le tracking -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="color: #FFE7BF; font-size: 16px; word-break: break-all; text-decoration: underline;">
                        ${resetLink}
                    </a>
                </div>
                
                <p style="color: #FFE7BF80; font-size: 14px; text-align: center;">
                    Copiez et collez ce lien dans votre navigateur si le lien ne fonctionne pas :
                </p>
                <p style="color: #FFE7BF80; word-break: break-all; font-size: 12px; text-align: center; background-color: #1a1614; padding: 10px; border-radius: 5px;">
                    ${resetLink}
                </p>
                
                <p style="color: #ff4444; font-weight: bold; text-align: center;">
                    ⏰ Ce lien expire dans 1 heure.
                </p>
                <p style="color: #FFE7BF80; font-size: 12px; text-align: center;">
                    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('❌ Erreur envoi email:', error);
        throw error;
    }
}

module.exports = { sendResetEmail };