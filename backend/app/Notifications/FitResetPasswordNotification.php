<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FitResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('fit.frontend_url'), '/');
        $url = $frontendUrl.'/reset-password?token='.urlencode($this->token)
            .'&email='.urlencode((string) $notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Restablecer contraseña - Coachly')
            ->greeting('Hola, '.$notifiable->name)
            ->line('Recibimos una solicitud para cambiar la contraseña de tu cuenta.')
            ->action('Cambiar contraseña', $url)
            ->line('Este enlace expirará en '.config('auth.passwords.users.expire', 60).' minutos.')
            ->line('Si no solicitaste este cambio, puedes ignorar este correo.');
    }
}
