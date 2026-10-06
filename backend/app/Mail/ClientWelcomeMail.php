<?php

namespace App\Mail;

use App\Models\FitClient;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly FitClient $client,
        public readonly User $trainer,
        public readonly ?string $plainPassword = null,
    ) {
    }

    public function envelope(): Envelope
    {
        $replyTo = $this->trainer->email
            ? [new Address($this->trainer->email, $this->trainer->name)]
            : [];

        return new Envelope(
            subject: '¡Bienvenido a Coachly, '.$this->client->name.'!',
            replyTo: $replyTo,
        );
    }

    public function content(): Content
    {
        $loginIdentifier = $this->client->whatsapp;

        return new Content(
            view: 'emails.client-welcome',
            with: [
                'client' => $this->client,
                'trainer' => $this->trainer,
                'loginIdentifier' => $loginIdentifier,
                'plainPassword' => $this->plainPassword,
                'loginUrl' => rtrim((string) config('fit.frontend_url'), '/').'/login',
                'photoUrl' => asset('images/default/background.jpg'),
            ],
        );
    }
}
