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
        subject: 'Shelter - Réinitialisation de votre mot de passe',
        html: `
            <h2>Réinitialisation de mot de passe</h2>
            <p>Survivant!</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>Cliquez sur le lien ci-dessous :</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                Réinitialiser mon mot de passe
            </a>
            <p>Ou copiez ce lien : ${resetLink}</p>
            <p><strong>Ce lien expire dans 1 heure.</strong></p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email envoyé à:', email);
    } catch (error) {
        console.error('Erreur envoi email:', error);
        throw error;
    }
}

module.exports = { sendResetEmail };