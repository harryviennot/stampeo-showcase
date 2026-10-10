# Política de privacidad: Stampeo

**Última actualización: 10 de octubre de 2026**

## 1. Introducción

Esta política de privacidad describe cómo Stampeo (en adelante «nosotros», «nuestro» o «la Plataforma»), gestionado por Harry Viennot, autónomo registrado en Francia con el número SIRET **10477625700016**, recoge, utiliza, almacena y protege los datos personales en el marco de su servicio de tarjetas de fidelidad digitales.

Nos comprometemos a cumplir el Reglamento General de Protección de Datos (RGPD, Reglamento UE 2016/679) y la ley francesa de protección de datos (Informatique et Libertés).

Esta política se aplica a todos los usuarios de la Plataforma, ya sean propietarios de comercios, empleados o clientes finales titulares de una tarjeta de fidelidad.

## 2. Responsable del tratamiento y encargado del tratamiento

### 2.1 Usuarios Business (propietarios y empleados)

Stampeo actúa como **responsable del tratamiento** de los datos de las cuentas profesionales (registro, autenticación, facturación).

### 2.2 Clientes finales (titulares de tarjetas de fidelidad)

El comercio que utiliza Stampeo es el **responsable del tratamiento** de los datos de sus propios clientes. Stampeo actúa como **encargado del tratamiento**: tratamos los datos de los clientes finales únicamente por cuenta del comercio y según sus instrucciones.

Cada comercio elige la información que recoge de sus clientes (anónimo, solo el correo electrónico, nombre + correo electrónico, o campos personalizados). De forma predeterminada, el correo electrónico y el nombre están activados.

### 2.3 Acceso de soporte por parte del personal de Stampeo

Los miembros autorizados del personal de Stampeo pueden, de forma estrictamente limitada, acceder al panel de un usuario Business con el único fin de prestar soporte técnico o comercial, diagnosticar una incidencia notificada o cumplir una obligación legal. Este acceso:

- es de **solo lectura**: ningún dato puede modificarse, crearse o eliminarse durante la sesión;
- puede concederse en el contexto de cualquier rol de usuario (propietario, administrador o escáner), y puede limitarse a un rol genérico o a un usuario concreto identificado, con el fin de reproducir fielmente las incidencias propias de un rol;
- activa una **notificación automática por correo electrónico al propietario del comercio** al inicio de la sesión, con independencia del rol o del usuario al que se dirija;
- está limitado a una duración máxima de **60 minutos**, transcurridos los cuales la sesión expira automáticamente;
- queda registrado con fines de auditoría: identidad del miembro del personal, comercio afectado, usuario y rol a los que se dirige, motivo declarado, marcas de tiempo de inicio y de fin, dirección IP del miembro del personal y páginas consultadas durante la sesión.

Base jurídica: interés legítimo (el interés del operador en prestar soporte y garantizar la seguridad de la plataforma), ponderado frente a los intereses del usuario Business mediante las garantías descritas anteriormente (solo lectura, duración limitada, auditado, notificado). Los registros de acceso de soporte se conservan durante 24 meses (véase el §8).

## 3. Datos recogidos

### 3.1 Usuarios Business

| Dato | Finalidad | Base jurídica | Obligatorio |
|--------|----------|-------------|-------------|
| Correo electrónico | Creación de cuenta, comunicación | Ejecución del contrato | Sí |
| Contraseña (cifrada con hash) | Autenticación | Ejecución del contrato | Sí |
| Nombre y apellidos | Identificación de la cuenta | Ejecución del contrato | Sí |
| Nombre del comercio | Personalización del servicio | Ejecución del contrato | Sí |
| Sitio web del comercio | Verificación y personalización | Interés legítimo | No |
| Número de teléfono | Contacto y soporte | Interés legítimo | No |
| Origen del descubrimiento (incluido el campo libre «otro») | Estadísticas internas (cómo conociste Stampeo) | Interés legítimo | No |
| Información de pago | Facturación a través de Stripe | Ejecución del contrato | Sí |
| Logotipo y elementos de marca | Funcionamiento del servicio | Ejecución del contrato | Sí |
| Idioma preferido (configuración regional) | Localización de la interfaz y de los correos transaccionales | Interés legítimo | No |
| Registros de acceso de soporte (sesiones, marcas de tiempo, páginas consultadas, IP del personal) | Trazabilidad de auditoría de las sesiones de soporte previstas en el §2.3 | Interés legítimo | Sí (operativo) |

El sitio web, el número de teléfono y la respuesta «cómo conociste Stampeo» se recogen en el momento del registro y se almacenan en una tabla interna accesible únicamente para la administración, utilizada para el soporte, el seguimiento y el análisis del proceso de incorporación. Esta información no se muestra a los demás usuarios de la Plataforma.

### 3.2 Empleados (escáneres)

| Dato | Finalidad | Base jurídica |
|--------|----------|-------------|
| Correo electrónico | Invitación y autenticación | Ejecución del contrato |
| Nombre y apellidos | Identificación | Ejecución del contrato |
| Estadísticas de actividad (número de escaneos registrados, fecha de última actividad) | Estadísticas de actividad del equipo mostradas al propietario del comercio | Interés legítimo |
| Atribución por escaneo (qué empleado registró cada escaneo) | Traza de auditoría de fidelidad y estadísticas del comercio | Interés legítimo |

Estas estadísticas de actividad son visibles para el propietario del comercio con el fin de ofrecerle una visión de la actividad de su equipo. Stampeo no las utiliza con fines propios.

### 3.3 Clientes finales

Los datos recogidos dependen por completo de la configuración elegida por el comercio. Los tres campos de identificación son todos opcionales y pueden desactivarse de forma independiente:

| Dato | Recogida | Finalidad |
|--------|----------|----------|
| Identificador único de tarjeta | Siempre | Funcionamiento del servicio |
| Dirección de correo electrónico | Por defecto (desactivable) | Recuperación del pase, comunicación |
| Nombre / Apellidos | Por defecto (desactivable) | Personalización |
| Número de teléfono | Opcional (desactivable) | Comunicación |
| Cumpleaños (día y mes) | Opcional (desactivable) | Regalos de cumpleaños y personalización |
| Campos definidos por el comercio | Opcional (definido por el comercio) | Fijada por el comercio, indicada en el formulario de alta |
| Historial de visitas | Automática | Seguimiento de fidelidad y estadísticas |
| Sellos/puntos acumulados | Automática | Programa de fidelidad |
| Importe de compra / valor de la transacción | Automática (solo programas de puntos) | Cálculo de puntos y estadísticas del comercio |

El cumpleaños se recoge **solo con el día y el mes**. No se guarda ningún año, por lo que no conservamos ni fecha de nacimiento ni edad.

Los comercios con los planes Crecimiento y Pro pueden añadir sus propios campos al formulario de alta (por ejemplo una preferencia o una talla). Para cada uno de esos campos, el comercio define la pregunta y una línea breve que explica por qué la hace, que se muestra al cliente encima del botón de alta. El comercio decide por sí solo qué pregunta y actúa como responsable del tratamiento de esas respuestas; Stampeo las aloja como encargado del tratamiento, siguiendo las instrucciones del comercio, y les aplica las mismas reglas de conservación, anonimización y supresión que a cualquier otro campo de cliente final. Los comercios tienen contractualmente prohibido usar estos campos para recoger datos bancarios, documentos de identidad o datos incluidos en el artículo 9 del RGPD (salud, convicciones religiosas o filosóficas, origen racial o étnico, opiniones políticas, afiliación sindical, orientación sexual, datos biométricos o genéticos). Eliminar un campo del formulario borra también todas las respuestas ya registradas para ese campo.

Es posible configurar la Plataforma en modo totalmente anónimo (ningún dato personal recogido, únicamente un identificador de tarjeta).

### 3.4 Datos técnicos

Para todos los usuarios, podemos recoger:

- Tipo de tarjeta (Apple Wallet o Google Wallet)
- Token de dispositivo (device token) para las actualizaciones de la tarjeta
- Datos de uso enviados a PostHog para nuestras estadísticas internas: nombre del evento, marca de tiempo, página consultada, dirección IP del visitante y, una vez creada la cuenta Business, el identificador del comercio correspondiente. No se deposita ninguna cookie ni se conserva ningún identificador en el almacenamiento del navegador (véase el §5)
- Contexto de supervisión de errores enviado a Sentry en caso de excepción: identificador de usuario, identificador de comercio, ruta de la solicitud y traza de ejecución (sin dirección de correo electrónico, sin contraseña, sin datos de pago)
- Para los correos que enviamos a los usuarios Business, los eventos de interacción registrados por nuestro proveedor de envío (Resend): entrega, apertura, clic (incluido el enlace en el que se hace clic), rebote (bounce) y marca como spam, vinculados al identificador del comercio y del usuario destinatario. Se utilizan únicamente para medir y mejorar nuestras propias comunicaciones y mantener la calidad de nuestras listas, nunca con fines publicitarios

## 4. Servicios de terceros

Recurrimos a los siguientes encargados del tratamiento:

| Servicio | Función | Ubicación de los datos |
|---------|------|--------------------------|
| Supabase | Alojamiento de la base de datos | Irlanda (UE) |
| OVH | Servidor VPS | Francia (UE) |
| Stripe | Procesamiento de pagos | UE (posibles transferencias a EE. UU. bajo el Data Privacy Framework) |
| Resend | Envío de correos transaccionales | Irlanda (UE) |
| Apple (APNs) | Actualizaciones de tarjetas Apple Wallet | Estados Unidos (Data Privacy Framework) |
| Google (Wallet API) | Actualizaciones de tarjetas Google Wallet | Estados Unidos (Data Privacy Framework) |
| Google (Analytics 4): Google Ireland Limited, con Google LLC | Medición de audiencia y comunicación de conversiones, según tu elección sobre las cookies (véanse 5.3 y 5.5) | UE (posibles transferencias a EE. UU. bajo el Data Privacy Framework) |
| PostHog | Estadísticas del sitio (sin cookies) | UE |
| Sentry | Supervisión de errores | Alemania (UE) |
| Trustpilot A/S | Invitaciones a dejar una opinión, enviadas a los propietarios de comercios (correo electrónico, nombre, identificador del comercio, idioma) | Dinamarca (UE), con posibles transferencias fuera de la UE bajo cláusulas contractuales tipo |
| Redis (autoalojado, a través de Taskiq) | Cola de tareas y caché de corta duración para los elementos visuales de las tarjetas y la entrega de notificaciones | Francia (UE), misma infraestructura que nuestro VPS |

### Revendedores (cuando proceda)

Stampeo ofrece un programa opcional de revendedores. Cuando un comercio decide ser gestionado por un socio revendedor, dicho revendedor dispone de acceso completo al panel del comercio que gestiona (incluidos los datos de sus clientes finales) para poder operar el programa de fidelidad por cuenta de este.

A efectos del RGPD, esto crea una cadena responsable del tratamiento → encargado del tratamiento → subencargado del tratamiento: el comercio gestionado sigue siendo responsable del tratamiento de los datos de sus clientes finales, Stampeo actúa como encargado del tratamiento, y el revendedor interviene como subencargado del tratamiento, autorizado únicamente dentro del ámbito acordado con dicho comercio. Toda relación de reventa es objeto de un acuerdo de colaboración firmado que incluye las obligaciones de tratamiento de datos descritas en los Términos del servicio (§9.1). Stampeo puede revocar el acceso de un revendedor en caso de incumplimiento o de uso indebido.

Un comercio que no sea gestionado por un revendedor no queda expuesto a ningún acceso de revendedor.

### Transferencias fuera de la UE

Algunos de nuestros encargados del tratamiento (Stripe, Apple, Google, Trustpilot) pueden transferir datos a Estados Unidos. Estas transferencias se enmarcan en el EU-US Data Privacy Framework o en cláusulas contractuales tipo aprobadas por la Comisión Europea. Supabase, OVH, Resend, PostHog, Sentry y nuestro Redis autoalojado tratan los datos exclusivamente dentro de la UE. Las plataformas publicitarias a las que comunicamos conversiones conforme al §5.5, Google (Google Ireland Limited, con Google LLC en Estados Unidos) y Meta (Meta Platforms Ireland Limited, con Meta Platforms, Inc. en Estados Unidos), pueden tratar esos datos en Estados Unidos, en el mismo marco.

## 5. Cookies

### 5.1 Tu elección

Las cookies de medición y de publicidad solo se cargan después de que las aceptes. Mientras no lo hagas, sus scripts ni siquiera se colocan en la página: ninguna petición llega a Google o Meta, y no se crea ninguna de sus cookies. Rechazarlas, por tanto, no deja nada que borrar.

Rechazar cuesta un clic, en el mismo banner y con la misma visibilidad que aceptar, y el sitio funciona igual en ambos casos. Guardamos tu elección durante 6 meses, pasados los cuales podemos volver a pedírtela. Puedes cambiarla cuando quieras desde **Preferencias de cookies**, en el pie de todas las páginas donde pueden instalarse nuestras cookies de medición y de publicidad. Retirar un consentimiento borra las cookies afectadas y recarga la página para que los scripts dejen de ejecutarse.

Si tu navegador envía una señal Global Privacy Control, la tratamos como un rechazo y no se carga nada. En Estados Unidos prevalece incluso sobre una elección que hayas hecho aquí antes, y no te mostramos ningún aviso, porque ya has respondido. En cada uno de los estados de Estados Unidos respetamos la señal como una oposición a la venta, al uso compartido y a la publicidad dirigida, y mientras esté activada, la medición de audiencia también queda desactivada. En Europa tu propia elección prevalece sobre la señal: mientras no hayas elegido, el banner se sigue ofreciendo, para que puedas aceptar deliberadamente si así lo quieres.

Los visitantes situados en Estados Unidos reciben un trato distinto, porque las leyes estatales aplicables exigen información y una opción de rechazo, no un consentimiento previo. Allí las cookies de medición y de publicidad se cargan desde la llegada, un aviso lo indica, y el enlace **Tus opciones de privacidad** permite desactivarlas en cualquier momento. Está en el pie de todas las páginas donde pueden instalarse nuestras cookies de medición y de publicidad, y el aviso incluye un botón con el mismo nombre. Un rechazo se guarda durante 13 meses y se renueva en cada visita, y se restaura desde tu cuenta cuando inicias sesión en el panel.

Las reglas que se te aplican se determinan a partir de la zona horaria de tu dispositivo. Cuando las señales no coinciden, se aplican las reglas más estrictas, y cuando no podemos ubicarte, se aplican las reglas estrictas (opt-in). No usamos tu dirección IP para ello.

### 5.2 Cookies presentes elijas lo que elijas

Son estrictamente necesarias y no están sujetas a consentimiento.

| Cookie | Finalidad | Duración |
|---|---|---|
| `NEXT_LOCALE` | Recuerda el idioma en el que consultas el sitio. | 1 año |
| `stampeo_market` | Recuerda el país cuyas páginas has abierto, para rellenar un campo más adelante. | 30 días |
| `stampeo_consent` | Registra la elección que has hecho sobre las cookies del 5.3 y el identificador aleatorio que enlaza tus decisiones sucesivas (véase 5.6). | 6 meses. En Estados Unidos, un rechazo se guarda 13 meses y se renueva en cada visita. |
| `stampeo_sid` | Un identificador aleatorio que registra tus elecciones y las vincula a la cuenta que crees, para que un rechazo posterior se aplique a ella (véase 5.6). | 13 meses |
| Cookies de sesión de Supabase | Te mantiene con la sesión iniciada en el panel. | Sesión |

### 5.3 Cookies sujetas a tu consentimiento

Estas cookies solo se usan si las permites (en Estados Unidos, mientras no las hayas desactivado mediante **Tus opciones de privacidad**; en los demás países, mediante **Preferencias de cookies**).

| Finalidad | Destinatario | Cookies |
|---|---|---|
| Medición de audiencia | Google (Google Analytics 4) | `_ga`, `_ga_*`, `_gid` |
| Medición publicitaria | Meta | `_fbp`, `_fbc` |

Las tres cookies de abajo son nuestras. Nuestro servidor las coloca, y se comparten entre stampeo.app y el panel de control.

| Cookie | Finalidad | Categoría | Duración |
|---|---|---|---|
| `stampeo_src` | De dónde viene tu visita (parámetros de campaña, página de llegada, sitio de origen). | Medición de audiencia o publicidad | 6 meses |
| `stampeo_ga` | Los identificadores de Google Analytics de tu visita. | Medición de audiencia | 6 meses |
| `stampeo_ad` | El identificador de clic de la plataforma publicitaria y el identificador de navegador de Meta, solo cuando llegas desde un anuncio. | Publicidad | 6 meses |

La antigua cookie `stampeo_attribution` ya no se coloca; un navegador que la recibió antes puede conservarla hasta que caduque.

### 5.4 Medición de audiencia sin cookies

Stampeo utiliza PostHog (alojado en la UE) para sus estadísticas internas de medición de audiencia. PostHog está configurado de modo que **no deposita ninguna cookie de seguimiento** y **no conserva ningún identificador en el almacenamiento del navegador** (cookie, localStorage o equivalente). Los eventos se limitan a la sesión de navegación en curso y no se correlacionan de una visita a otra. La dirección IP del visitante se transmite al servidor de PostHog para el registro técnico y la eliminación de eventos duplicados, pero no se asocia a ningún identificador persistente, no se utiliza con fines de elaboración de perfiles ni de publicidad, y no se comparte con terceros. El alojamiento se realiza dentro de la Unión Europea.

Como no se almacena nada en tu dispositivo, esta medición se acoge a la exención de consentimiento prevista por la Directiva sobre la privacidad electrónica (ePrivacy) y por las directrices de la CNIL para la medición de audiencia estrictamente necesaria. Funciona por tanto tanto si aceptas como si rechazas las cookies del 5.3, y un rechazo no nos deja sin medición del propio sitio.

Pueden utilizarse cookies estrictamente necesarias para la autenticación y la gestión de la sesión en el panel. Estas cookies no requieren consentimiento.

### 5.5 Medición de conversiones desde nuestros servidores

Si aceptas las cookies del 5.3 (en Estados Unidos, mientras no las hayas desactivado), conservamos, en las cookies `stampeo_src`, `stampeo_ga` y `stampeo_ad` incluidas en el 5.3: de dónde viene tu visita, es decir, los parámetros de campaña presentes en la dirección, la página de llegada y el sitio de origen; los identificadores de Google Analytics de tu visita; y, si llegaste desde un anuncio, el identificador que la plataforma publicitaria añadió al enlace que seguiste (en el caso de Google, el `gclid`; en el de Meta, el `fbclid`), junto con el identificador de navegador de Meta. Cada cookie se conserva solo mientras permitas la categoría indicada para ella en el 5.3. Nuestro servidor las coloca, y se comparten entre stampeo.app y el panel de control, alojado en otro subdominio, para que esta información sobreviva al paso de este sitio al panel. Si más adelante vuelves desde otro anuncio, ese clic más reciente sustituye al anterior.

Si creas una cuenta, comunicamos hasta cuatro pasos **desde nuestros servidores**: que se creó la cuenta, que abriste la página de pago, que empezó tu prueba gratuita y que se pagó una primera factura. El primero se comunica cuando confirmas la cuenta (con el código que te enviamos por correo electrónico o iniciando sesión con Google o Apple), antes de que exista ningún comercio. Al tratarse de un envío del lado del servidor, se produce después de lo que ocurre en tu navegador y con independencia de ello.

En cada paso, la plataforma recibe sus propios identificadores cuando dispone de ellos (el identificador de clic y su identificador de navegador) y la campaña, además, en los tres últimos pasos, del precio del plan elegido o del importe pagado, y su divisa. Cada plataforma recibe únicamente sus propios identificadores: un identificador de clic de Google nunca se envía a Meta, ni uno de Meta a Google.

Meta recibe además:

- tu dirección IP y las características técnicas de tu navegador (tipo, versión, sistema operativo), tal y como se registraron al crear tu cuenta, así como la dirección de nuestro panel de control. Conservamos estos dos datos 45 días como máximo y después los eliminamos;
- tu dirección de correo electrónico, tu número de teléfono, tu nombre y apellidos, el país, la ciudad y el código postal de tu comercio, y un identificador derivado de tu cuenta, cada uno **convertido en hash** con el algoritmo SHA-256 antes de salir de nuestros servidores. El hash convierte cada uno en un código que no permite recuperar la información original. Aun así, ese código te identifica ante Meta, que genera el mismo código a partir de los datos de sus propios usuarios, por lo que sigue siendo un dato personal. Meta compara estos códigos con los de sus usuarios para saber si tienes una cuenta de Facebook o Instagram, incluso si viste el anuncio en otro dispositivo, y utiliza el resultado para medir y mejorar cómo se muestran nuestros anuncios. Meta también puede usar estos datos según sus propias condiciones, por ejemplo para mejorar sus sistemas publicitarios, como describe [la política de privacidad de Meta](https://www.facebook.com/privacy/policy).

Meta recibe estos pasos tanto si llegaste desde uno de sus anuncios como si no, siempre que hayas aceptado las cookies publicitarias del 5.3 (en Estados Unidos, mientras no las hayas desactivado). Google recibe su propio identificador de sesión en cada paso, para que el paso quede unido a tu visita. Nunca recibe tus datos de contacto, tu dirección IP ni las características de tu navegador.

Nunca enviamos tu contraseña, tus datos de pago ni nada relativo a tus clientes (las personas que tienen tus tarjetas de fidelidad).

Por cada paso conservamos también datos de diagnóstico del envío: su estado, las horas de los intentos y el código de respuesta de la plataforma, además de los mensajes de respuesta de la plataforma. El §8 indica cuánto tiempo guardamos cada uno.

- **Destinatarios**: Google es Google Ireland Limited, con Google LLC en Estados Unidos. Meta es Meta Platforms Ireland Limited, con Meta Platforms, Inc. en Estados Unidos.
- **Base jurídica**: tu consentimiento (artículo 6.1.a del RGPD), prestado en el banner de cookies o mediante **Preferencias de cookies**. En Estados Unidos, donde no se exige un consentimiento previo, nos basamos en la información y en tu opción de rechazo, a través de **Tus opciones de privacidad** (véanse 5.1 y §6).
- **Corresponsables con Meta**: Stampeo y Meta Platforms Ireland Limited son corresponsables del tratamiento (artículo 26 del RGPD) de la recogida de datos mediante las cookies de Meta del 5.3 y las comunicaciones descritas aquí, y de su transmisión a Meta, conforme a la adenda «Controller Addendum» de Meta. Meta es la única responsable de lo que hace con los datos una vez recibidos, como describe [la política de privacidad de Meta](https://www.facebook.com/privacy/policy). Puedes ejercer tus derechos (§10) tanto ante Stampeo como ante Meta.

Puedes retirar cada elección por separado, mediante **Preferencias de cookies** o, en Estados Unidos, **Tus opciones de privacidad**:

- Desactivar la publicidad pone fin a cualquier nueva comunicación a Meta y elimina los identificadores publicitarios que habíamos conservado.
- Desactivar la medición de audiencia hace lo mismo con Google.
- Desactivar ambas elimina además el origen de campaña guardado.

Un rechazo que hagas en este sitio después de crear tu cuenta se aplica a tu cuenta y a tus comercios, a través del identificador aleatorio descrito en el 5.6. Los pasos ya comunicados no pueden retirarse. Estos datos se eliminan junto con la cuenta profesional a la que pertenecen (véase §8).

### 5.6 Registro de tus decisiones sobre cookies

Cuando aceptas o rechazas las cookies —en el banner, en el aviso mostrado a los visitantes situados en Estados Unidos, o más tarde mediante **Preferencias de cookies** o, en Estados Unidos, **Tus opciones de privacidad**— conservamos constancia de esa decisión en nuestros servidores. El RGPD nos obliga a poder demostrar que el consentimiento se prestó (artículo 7.1), y una decisión guardada únicamente en tu navegador no demuestra nada: reside en tu dispositivo, puedes modificarla y tu siguiente decisión la sobrescribe.

Cada registro contiene la decisión en sí y nada relativo a tu persona: qué categorías aceptaste o rechazaste, la versión del texto que se te mostró, si te correspondía el régimen de opt-in o de opt-out, en qué superficie respondiste y dos marcas de tiempo: la que indicó tu propio dispositivo y la de recepción en nuestro servidor.

Para vincular entre sí las decisiones de un mismo visitante, colocamos un identificador aleatorio en la cookie `stampeo_sid` indicada en 5.2, y la cookie `stampeo_consent` lleva el mismo identificador. Es aleatorio, no se deriva de tu dirección IP, ni de una huella del navegador, ni de ningún otro dato sobre ti, y carece de significado fuera de este registro. Si después creas una cuenta, asociamos tus decisiones anteriores a esa cuenta para poder acreditar qué elegiste, y para que un rechazo que hagas más tarde en este sitio se aplique a ella (véase 5.5); las decisiones en sí nunca se modifican.

Los rechazos se registran exactamente igual que las aceptaciones. Un registro que recogiera solo a quienes aceptaron ofrecería una imagen falsa de lo ocurrido y carecería de valor probatorio.

**Conservamos estos registros durante 3 años desde que finaliza el consentimiento que describen** —es decir, desde que se sustituye por una decisión posterior o se retira—, conforme a las orientaciones de la CNIL sobre la prueba del consentimiento. Transcurrido ese plazo se eliminan.

**Estos registros son la única excepción a la supresión en la Plataforma.** Si solicitas la supresión de tus datos, la denegaremos únicamente respecto de estos registros, al amparo del artículo 17.3 b) y e) del RGPD: conservación necesaria para el cumplimiento de una obligación legal y para la formulación, el ejercicio o la defensa de reclamaciones. Eliminar la prueba de tu consentimiento destruiría la única justificación de tratamientos ya realizados, incluidos los que tú mismo habías solicitado. Por la misma razón no se eliminan al cerrarse una cuenta Business: se retira el vínculo con la cuenta y el registro permanece, describiendo una decisión y ya no a una persona identificable. Todos los demás derechos del §10 —acceso, rectificación, limitación, portabilidad y oposición— se les aplican con normalidad.

## 6. Uso de los datos

Utilizamos los datos recogidos para:

- Prestar y mantener el servicio de tarjetas de fidelidad digitales
- Generar y actualizar las tarjetas del wallet
- Enviar notificaciones de fidelidad (sellos, recompensas)
- Gestionar las cuentas, las suscripciones y la facturación
- Enviar correos transaccionales y operativos (confirmación de cuenta, recuperación de tarjeta, notificaciones relacionadas con la prueba, confirmaciones de cambio de plan, el recordatorio enviado antes de cada renovación anual y otras notificaciones de facturación; véanse los Términos del servicio §5.7)
- Producir estadísticas anonimizadas para los comercios
- Producir estadísticas internas agregadas sobre el uso de la Plataforma en el conjunto de los comercios, detectar abusos y priorizar las mejoras
- Enviar a los usuarios Business un número limitado de correos de ciclo de vida y marketing, sujetos a la oposición descrita en el §6.1
- Invitar a los propietarios de comercios con una suscripción de pago a dejar una opinión sobre Stampeo en Trustpilot, sobre la base de nuestro interés legítimo en recoger opiniones sobre nuestro servicio (artículo 6.1.f del RGPD; destinatario descrito en el §4)
- Mejorar la Plataforma

**Nunca vendemos** datos personales a cambio de dinero. No realizamos **ningún seguimiento entre comercios**: los datos de un cliente en un comercio están totalmente aislados de los que tenga en otro.

**En Estados Unidos:** enviar datos a Meta y a Google, para nuestra publicidad, como se describe en el 5.5, puede considerarse «compartir» datos según la ley de California. Puedes oponerte en cualquier momento mediante **Tus opciones de privacidad**, en el pie de todas las páginas donde pueden instalarse nuestras cookies de medición y de publicidad y en el aviso, o con una señal Global Privacy Control, que respetamos en cada estado de Estados Unidos como se describe en el 5.1.

### 6.1 Correos de ciclo de vida y marketing dirigidos a los usuarios Business

Además de los correos transaccionales y operativos enumerados anteriormente, enviamos a los usuarios Business un número limitado de correos de ciclo de vida y marketing: orientación de incorporación y activación, recordatorios cuando una cuenta se crea pero aún no se utiliza, un resumen de actividad periódico, anuncios de novedades de producto y mensajes de recuperación tras la cancelación.

- **Base jurídica**: nuestro interés legítimo en ayudar a los usuarios Business a sacar partido de la Plataforma y en promocionar las funcionalidades de un servicio que ya utilizan (artículo 6.1.f del RGPD), apoyándonos para la prospección en el «soft opt-in» entre profesionales previsto por la Directiva ePrivacy y el artículo L34-5 de la ley francesa LCEN.
- **Oposición**: cada uno de estos correos incluye un enlace de baja en un clic y un enlace a una página de preferencias que permite al usuario Business darse de baja de forma independiente por categoría: reenganche, marketing y novedades de producto. Los correos transaccionales y operativos descritos en el §5.7 de los Términos del servicio quedan excluidos de esta oposición porque son necesarios para administrar la cuenta.
- Para medir y mejorar estas comunicaciones, registramos los eventos de interacción descritos en el §3.4.

Esto se refiere únicamente a los correos que Stampeo envía a sus propios usuarios Business. Es distinto de las notificaciones del wallet que un comercio envía a sus clientes finales, tratadas en el §7.

## 7. Notificaciones

Cuando un cliente añade una tarjeta a su wallet, dicha tarjeta puede recibir notificaciones del comercio emisor. Existen dos categorías, cada una con una base jurídica distinta.

### 7.1 Notificaciones transaccionales

Se envían automáticamente en respuesta a la actividad del cliente: sello recibido, puntos ganados, hito alcanzado, recompensa obtenida, recompensa canjeada.

- **Base jurídica**: ejecución del servicio de fidelidad (artículo 6.1.b del RGPD), por cuenta del comercio responsable del tratamiento.
- **Contenido**: estrictamente relacionado con la actividad de la propia tarjeta de fidelidad del cliente.

### 7.2 Campañas promocionales

Los comercios suscritos a los planes Growth y Pro pueden enviar mensajes de difusión a sus titulares de tarjeta (por ejemplo: una oferta de temporada, un nuevo producto en la carta, un evento). Growth dispone de una cuota mensual; Pro es ilimitado. El plan Starter no puede enviar campañas.

- **Base jurídica**: el interés legítimo del comercio en comunicarse con sus clientes existentes (artículo 6.1.f del RGPD), combinado con la denominada exención de «soft opt-in» prevista por la Directiva sobre la privacidad electrónica (ePrivacy, artículo 13(2)) y por el artículo L34-5 de la ley francesa LCEN. Esta exención del requisito de consentimiento previo se aplica porque (a) los datos de contacto del cliente se obtuvieron con ocasión de un servicio (la instalación de la tarjeta de fidelidad del comercio), (b) el mensaje se refiere a productos o servicios similares del mismo comercio, y (c) existe en todo momento un medio sencillo y gratuito para oponerse (véase 7.3).
- **Alcance, estrictamente de primera parte.** Un comercio solo puede utilizar las difusiones para dirigirse a **sus propios** titulares de tarjeta acerca de **sus propios** productos, servicios u ofertas. Las difusiones no pueden utilizarse para publicidad de terceros, ni para promociones cruzadas entre comercios, ni para la comunicación de datos, ni para contenido ajeno a la oferta del comercio. Estas restricciones figuran en los Términos del servicio (§8) y su incumplimiento constituye un motivo de suspensión. Son ellas las que permiten mantener la exención de «soft opt-in».

### 7.3 Baja

Cada tarjeta muestra un interruptor de notificaciones por tarjeta en Apple Wallet y Google Wallet. Desactivarlo constituye el único medio de baja, conforme a las prácticas del sector y jurídicamente suficiente tanto para las notificaciones transaccionales como para las promocionales de esa tarjeta. Es el mismo control que utilizan todos los grandes programas de fidelidad basados en el wallet.

Como el sistema operativo del wallet muestra un único interruptor por tarjeta, su desactivación desactiva **a la vez** las notificaciones transaccionales y las promocionales de esa tarjeta. Se trata de una limitación del medio wallet, no de una decisión de Stampeo. Un cliente que desee bloquear únicamente los mensajes promocionales puede: solicitar al comercio que lo excluya de las futuras difusiones (los comercios están obligados por los Términos del servicio a respetar dichas solicitudes), o bien retirar la tarjeta de su wallet.

### 7.4 Obligaciones del comercio

Los comercios que utilicen las difusiones deben publicar su propia política de privacidad dirigida a sus clientes, mantenerse dentro del alcance de primera parte descrito anteriormente y respetar las solicitudes de oposición recibidas por cualquier canal (verbal, correo electrónico, en persona) excluyendo al cliente de las futuras difusiones o revocando la tarjeta. Estas obligaciones se detallan en los Términos del servicio §8.

## 8. Plazo de conservación

| Dato | Plazo de conservación |
|--------|----------------------|
| Cuenta Business activa | Duración de la suscripción |
| Cuenta Business tras la cancelación | Hasta 12 meses de inactividad, después se eliminan los datos personales. Se envían dos correos de aviso (30 y 14 días antes), y la cuenta se conserva si el propietario vuelve a iniciar sesión o se vuelve a suscribir |
| Datos de los clientes finales | Se conservan mientras el comercio esté activo; se anonimizan de forma irreversible cuando se elimina la cuenta Business (pueden conservarse estadísticas anonimizadas) |
| Datos de facturación | 10 años (obligación legal francesa) |
| Registros técnicos | 12 meses como máximo |
| Tokens de registro push (device tokens) | Se eliminan cuando el cliente retira la tarjeta de su wallet, o cuando el servicio push del wallet señala el token como inválido de forma permanente |
| Último mensaje de notificación del wallet | Solo se conserva el último mensaje por cliente (se sobrescribe en cada notificación), sin historial |
| Estadísticas de entrega de las difusiones (agregadas) | 24 meses |
| Registros de envío e interacción de los correos dirigidos a los usuarios Business (entrega, apertura, clic, rebote, marca como spam) | 24 meses |
| Registro de fallos de los webhooks de Stripe (depuración interna) | 90 días |
| Registros de acceso de soporte (sesiones y entradas de auditoría asociadas, véase el §2.3) | 24 meses, después se eliminan |
| Atribución publicitaria (identificador de clic, campaña) | Se elimina junto con la cuenta Business a la que pertenece |
| Dirección IP y características del navegador utilizadas para la medición de conversiones (§5.5) | 45 días como máximo, después se eliminan |
| Datos de diagnóstico del envío de cada paso comunicado conforme al §5.5 (estado, horas de los intentos, código de respuesta de la plataforma) | 13 meses |
| Mensajes de respuesta de las plataformas a los pasos comunicados conforme al §5.5 | 90 días |
| Registros de consentimiento — prueba de tus decisiones sobre cookies (§5.6) | 3 años desde que finaliza el consentimiento (sustitución o retirada). **No** se eliminan con la cuenta Business: se retira el vínculo con la cuenta y el registro se conserva, al amparo del art. 17.3 b) y e) del RGPD |

El plazo de conservación de 24 meses para los registros de acceso de soporte se establece para permitir la investigación de un posible incidente de seguridad, manteniéndose a la vez proporcionado a su finalidad, conforme a las recomendaciones de la CNIL en materia de registro de accesos.

Cuando una cuenta Business queda inactiva, conservamos sus datos durante un máximo de 12 meses para permitir la reactivación, enviando dos correos de aviso antes de la eliminación definitiva. En el momento de la eliminación, los datos personales de la cuenta Business se eliminan y los datos personales de los clientes finales se anonimizan de forma irreversible; pueden conservarse estadísticas anonimizadas. Los datos de facturación se conservan durante 10 años, como exige la ley.

## 9. Eliminación de una tarjeta por un cliente final

Cuando un cliente elimina su tarjeta:

- Sus datos identificativos (correo electrónico, nombre, teléfono) se **anonimizan** previa solicitud
- Su historial de visitas se conserva de forma anonimizada para las estadísticas del comercio
- El cliente puede solicitar la eliminación completa poniéndose en contacto con el comercio correspondiente o con Stampeo

## 10. Derechos de los usuarios

De conformidad con el RGPD, dispones de los siguientes derechos:

- **Acceso**: obtener una copia de tus datos personales
- **Rectificación**: corregir datos inexactos
- **Supresión**: solicitar la eliminación de tus datos (con una única excepción documentada, relativa a los registros de consentimiento del §5.6)
- **Limitación**: restringir el tratamiento
- **Portabilidad**: recibir tus datos en un formato estructurado
- **Oposición**: oponerte al tratamiento

**Usuarios Business y empleados:** ponte en contacto con nosotros en contact@stampeo.app.

**Clientes finales:** ponte en contacto en primer lugar con el comercio que gestiona tu tarjeta. También puedes escribirnos a contact@stampeo.app.

Respondemos en un plazo de 30 días. También tienes derecho a presentar una reclamación ante la CNIL, la autoridad francesa de protección de datos (www.cnil.fr), o ante la autoridad de control del país donde vives o trabajas (en España, la Agencia Española de Protección de Datos, www.aepd.es).

### 10.1 Derecho de oposición al acceso de soporte

Los usuarios Business pueden, mediante solicitud escrita dirigida a contact@stampeo.app, solicitar que no se abra ningún acceso de soporte (§2.3) sobre su cuenta fuera de un ticket de soporte abierto por ellos mismos. Esta posibilidad se ofrece a título de cortesía contractual y no se aplica a los casos en que dicho acceso sea exigido por la ley, por una resolución judicial o por un incidente de seguridad inminente que afecte a la Plataforma.

## 11. Seguridad

Aplicamos medidas técnicas y organizativas para proteger tus datos:

- Cifrado en tránsito (TLS/HTTPS)
- Contraseñas cifradas con hash mediante algoritmos seguros
- Acceso a las bases de datos restringido y controlado
- Aislamiento de los datos entre comercios (multitenant)
- Alojamiento en la UE (Supabase Irlanda, OVH Francia)
- Certificados de firma de Apple Pass propios de cada comercio, cifrados en reposo (AES-256-GCM)

En caso de violación de datos personales, Stampeo notificará a la CNIL en un plazo de 72 horas desde su descubrimiento, así como a los responsables del tratamiento afectados (o, en su caso, a las personas afectadas) de conformidad con los artículos 33 y 34 del RGPD.

## 12. Menores

La Plataforma no está dirigida a personas menores de 16 años. No recogemos conscientemente datos de menores de 16 años. Las cuentas Business están reservadas a personas de 18 años o más.

## 13. Modificaciones

Podemos actualizar esta política. En caso de modificaciones sustanciales, se informará a los usuarios Business por correo electrónico. La fecha de actualización figura en la parte superior de este documento.

## 14. Contacto

- **Correo electrónico:** contact@stampeo.app
- **Responsable:** Harry Viennot, Stampeo
- **SIRET:** 10477625700016
- **Dirección:** 20 rue Marcel Paul, Bat. D Apt. 133-B, 94800 Villejuif, Francia
