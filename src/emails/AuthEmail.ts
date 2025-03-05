import { transport } from '../config/nodemailer';

type Email = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async(user: Email) => {
        await transport.sendMail({
            from: 'CashTrackr <admin@cashtrack.com>',
            to: user.email,
            subject: 'CashTrackr - Confirma tu cuenta',
            text: 'CashTrackr - Confirma tu cuenta',
            html: ` 
                <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px;"> 
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"> 
                        <h2 style="color: #444; text-align: center;">¡Bienvenido a CashTrackr, ${user.name}!</h2> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> Has creado tu cuenta en <strong>CashTrackr</strong>, ¡ya casi está todo listo! Solo debes confirmar tu cuenta para poder comenzar a usarla. </p> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> Para confirmar tu cuenta, visita el siguiente enlace: </p> 
                        
                        <div style="text-align: center; margin: 20px 0;"> 
                            <a href="${process.env.FRONTEND_URL}/auth/confirm-account" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">Confirmar Cuenta</a> 
                        </div> 

                        <p style="font-size: 16px; line-height: 1.5; color: #555;">E ingresa el siguiente código para confirmar tu cuenta: </p> 
                        <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;"> ${user.token}</div> 

                        <p style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;"> Si no has solicitado esta cuenta, puedes ignorar este mensaje.</p> 
                    </div> 
                </div> 
            `
        });
    }

    static sendPasswordResetToken = async(user: Email) => {
        await transport.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Restablece tu contraseña',
            text: 'UpTask - Restablece tu contraseña',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #444; text-align: center;">¡Hola, ${user.name}!</h2>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> Has solicitado restablecer tu contraseña en <strong>UpTask</strong>. Sigue las instrucciones para continuar con el proceso.</p>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> Para restablecer tu contraseña, visita el siguiente enlace:</p>

                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${process.env.FRONTEND_URL}/auth/new-password" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">Restablecer Contraseña</a>
                        </div>

                        <p style="font-size: 16px; line-height: 1.5; color: #555;">E ingresa el siguiente código para restablecer tu password: </p> 
                        <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;"> ${user.token}</div> 
        
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> <strong>Nota:</strong> Este enlace expira en 10 minutos.</p>
                        <p style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;"> Si no has solicitado restablecer tu contraseña, puedes ignorar este mensaje.</p>
                    </div>
                </div>
            `
        });
        
    }
}