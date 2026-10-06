<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ '¡Bienvenido a Coachly, '.$client->name.'!' }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: Arial, Helvetica, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.06);">

        {{-- top corner decoration --}}
        <tr>
          <td style="height:6px; line-height:6px; font-size:0; background-image:linear-gradient(to right,#7c5cff 0 16px, transparent 16px 44px, #4dd2ff 44px 60px, transparent 60px);">&nbsp;</td>
        </tr>

        {{-- logo / brand --}}
        <tr>
          <td align="center" style="padding:28px 40px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:10px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:12px; height:12px; background-color:#7c5cff; border-radius:3px;">&nbsp;</td>
                      <td style="width:6px;">&nbsp;</td>
                      <td style="width:12px; height:12px; background-color:#4dd2ff; border-radius:3px;">&nbsp;</td>
                    </tr>
                    <tr><td style="height:6px;">&nbsp;</td></tr>
                    <tr>
                      <td style="width:12px; height:12px; background-color:#9d7dff; border-radius:3px;">&nbsp;</td>
                      <td style="width:6px;">&nbsp;</td>
                      <td style="width:12px; height:12px; background-color:#7c5cff; border-radius:50%;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
                <td style="font-size:16px; font-weight:700; color:#1f2937;">Coachly</td>
              </tr>
            </table>
          </td>
        </tr>

        {{-- title --}}
        <tr>
          <td align="center" style="padding:4px 40px 24px;">
            <h1 style="margin:0; font-size:26px; line-height:1.3; color:#111827;">&iexcl;Bienvenido&#40;a&#41; a Coachly! &#127881;</h1>
          </td>
        </tr>

        {{-- photo --}}
        <tr>
          <td style="padding:0 40px;">
            <img src="{{ $photoUrl }}" alt="Coachly" width="520" style="width:100%; max-width:520px; height:220px; object-fit:cover; border-radius:10px; display:block; margin:0 auto;">
          </td>
        </tr>

        {{-- body --}}
        <tr>
          <td style="padding:28px 40px 0; font-size:15px; line-height:1.65; color:#374151;">
            <p style="margin:0 0 16px;">Hola {{ $client->name }},</p>

            <p style="margin:0 0 16px; font-weight:700; color:#111827;">&iexcl;Bienvenido&#40;a&#41; a Coachly!</p>

            <p style="margin:0 0 16px;">
              Soy {{ $trainer->name }}, tu entrenador{{ $trainer->name ? '' : '' }}, y quería darte la bienvenida personalmente.
              Me alegra mucho tenerte como cliente y estoy convencido de que juntos vamos a lograr tu objetivo{{ $client->goal ? ': ' . $client->goal : '.' }}
            </p>

            <p style="margin:0 0 16px;">
              A partir de ahora vas a poder ingresar a la plataforma para ver tus rutinas, registrar tu progreso y mediciones,
              y mantenerte al tanto de cada sesión de entrenamiento.
            </p>

            @if($loginIdentifier)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; margin:8px 0 20px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 10px; font-weight:700; color:#111827;">Tus datos de acceso</p>
                  <p style="margin:0 0 4px;">Inicia sesión con tu WhatsApp: <strong>{{ $loginIdentifier }}</strong></p>
                  @if($plainPassword)
                  <p style="margin:0;">Contraseña temporal: <strong>{{ $plainPassword }}</strong></p>
                  @endif
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td align="center" style="background-color:#7c5cff; border-radius:8px;">
                  <a href="{{ $loginUrl }}" style="display:inline-block; padding:13px 28px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">Ingresar a mi cuenta</a>
                </td>
              </tr>
            </table>
            @endif

            <p style="margin:0 0 4px; font-weight:700; color:#111827;">&iexcl;Otra vez bienvenido&#40;a&#41;! Este es el inicio de un gran proceso juntos.</p>
            <p style="margin:0 0 24px;">Saludos,</p>
          </td>
        </tr>

        {{-- signature --}}
        <tr>
          <td style="padding:0 40px 32px; font-size:15px; color:#374151;">
            <p style="margin:0 0 2px; font-weight:700; color:#111827;">{{ $trainer->name }}</p>
            <p style="margin:0; color:#6b7280;">Entrenador &middot; Coachly</p>
            @if($trainer->email)
            <p style="margin:4px 0 0;"><a href="mailto:{{ $trainer->email }}" style="color:#7c5cff; text-decoration:underline;">{{ $trainer->email }}</a></p>
            @endif
          </td>
        </tr>

        {{-- bottom corner decoration --}}
        <tr>
          <td style="height:6px; line-height:6px; font-size:0; background-image:linear-gradient(to left,#9d7dff 0 16px, transparent 16px 44px, #4dd2ff 44px 60px, transparent 60px);">&nbsp;</td>
        </tr>
      </table>

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%;">
        <tr>
          <td align="center" style="padding:18px 20px; font-size:12px; color:#9ca3af;">
            Recibiste este correo porque {{ $trainer->name }} te registró como cliente en Coachly.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
