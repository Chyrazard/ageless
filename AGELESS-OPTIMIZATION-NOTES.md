# Ageless — bitácora de optimización, UX y operación

Última actualización: 2 de agosto de 2026.

Este documento conserva el contexto de la optimización de rendimiento iniciada sobre la Home, los ajustes visuales posteriores y la forma segura de publicar cambios en `agelessevo.com`. No contiene contraseñas, API keys ni secretos.

## 1. Objetivo de esta ronda

La meta no era solamente obtener una puntuación sintética alta. El objetivo principal era que el sitio se sintiera inmediato sin sacrificar la identidad visual:

- mostrar rápido el hero, su logo y su fondo animado;
- evitar parpadeos, bloques negros y recursos que aparecen tarde;
- reducir drásticamente el peso de imágenes sin perder transparencias;
- mantener los videos con su calidad actual durante esta fase;
- diferir únicamente lo que no es crítico;
- impedir saltos inesperados de scroll;
- aprovechar caché del navegador y entrega directa de estáticos por Nginx;
- mantener accesibilidad para usuarios que prefieren menos movimiento.

## 2. Diagnóstico inicial

Durante la auditoría se encontraron varios costos acumulados:

1. La Home se renderizaba dinámicamente porque leía headers para construir metadata. Eso impedía aprovechar completamente el HTML estático.
2. Existía una espera artificial de aproximadamente 820 ms asociada al preloader heredado.
3. La Home todavía podía cargar el runtime original de Webflow y sus dependencias aunque sus animaciones principales ya estaban reconstruidas en React/CSS.
4. La selección activa de imágenes pesaba aproximadamente 25 MB.
5. Había PNG grandes con transparencia para speakers y crew, además de fotografías sobredimensionadas.
6. Algunos videos y secciones inferiores competían por ancho de banda y trabajo de render con el primer viewport.
7. El primer intento de diferir secciones fue demasiado agresivo para contenido que el usuario esperaba ver inmediatamente.
8. Algunas imágenes de carruseles no estaban preparadas antes de pulsar “Next”, provocando tarjetas negras mientras llegaba el recurso.

El principio aplicado fue: priorizar agresivamente el primer y segundo bloque visible, y posponer con cuidado lo lejano.

## 3. Optimización de imágenes

Se añadió el script reproducible:

```bash
npm run optimize:images
```

Su implementación vive en `scripts/optimize-images.mjs` y usa `sharp` para:

- rotar correctamente según EXIF;
- normalizar a sRGB;
- reducir dimensiones cuando la fuente excede lo necesario;
- convertir a WebP;
- mantener `alphaQuality: 100` para preservar bordes y fondos transparentes;
- usar calidades de 86–92 según el tipo de activo.

Se optimizaron los grupos activos de:

- current speakers;
- past speakers;
- crew;
- galería del evento;
- logo principal;
- posters de fondos animados;
- retrato en blanco y negro de Aubrey para la Home.

Resultado medido durante la auditoría para esa selección activa: aproximadamente **25 MB → 3.1 MB**, cerca de un **88 % menos**. Los PNG/JPG fuente se conservaron como originales; la aplicación apunta a las versiones WebP optimizadas.

Importante: `public/` todavía contiene fuentes históricas y videos pesados. El tamaño completo de la carpeta no equivale al peso descargado por una visita.

## 4. Home estática y HTML inicial

La metadata global se trasladó a `app/layout.tsx` con una base estable de producción. Esto permitió retirar la lectura de headers desde `app/page.tsx`.

Como resultado, `/` aparece como ruta estática en el build de Next:

```text
○ /   (Static) prerendered as static content
```

Beneficios:

- HTML preparado durante el build;
- menor trabajo por request en Node;
- mejor posibilidad de caché;
- respuesta inicial más consistente;
- menos riesgo de que el servidor de aplicación se convierta en cuello de botella.

La metadata compartida mantiene:

- título `Longevity and Wellness Summit`;
- descripción del evento;
- favicon;
- Open Graph y Twitter preview con el logo sobre fondo blanco.

## 5. Limpieza del runtime heredado

La Home usa `MirroredPageView`, pero ya no ejecuta `WebflowRuntime` cuando `removeLegacyHomeSections` está activo.

También se eliminan del HTML heredado las secciones que fueron reemplazadas por componentes actuales:

- navegación antigua;
- FAQ antiguo;
- footer antiguo;
- testimonials antiguos;
- bloques Home heredados sustituidos por las secciones React actuales.

Así se evita descargar o ejecutar trabajo de jQuery, Webflow y GSAP que no aporta a la experiencia actual de la Home.

Las otras páginas espejadas pueden conservar `WebflowRuntime` si todavía lo necesitan. No debe eliminarse globalmente sin revisar esas rutas.

## 6. Estrategia actual de carga

### 6.1 Recursos críticos

Se cargan inmediatamente:

- video de fondo del hero de la Home;
- logo grande del hero, con prioridad alta;
- contenido y media del segundo bloque;
- imágenes visibles de speakers;
- imágenes del carrusel de past speakers;
- imágenes del crew.

Esto evita que “Next” muestre negro y que los fondos de tarjetas aparezcan después del contenido.

### 6.2 Recursos cercanos o inferiores

`app/deferred-media.tsx` administra videos con atributos de datos:

- `data-ageless-deferred-video="after-paint"`: se activa después del primer paint/idle, con timeout de respaldo;
- `data-ageless-deferred-video="viewport"`: se activa mediante `IntersectionObserver` antes de entrar a pantalla;
- `data-ageless-radial-reveal="true"`: se revela únicamente cuando el navegador indica que el video puede reproducirse.

El observer usa margen adelantado para iniciar recursos antes de que el usuario llegue a ellos.

Las secciones muy inferiores usan:

```css
content-visibility: auto;
contain-intrinsic-size: auto 900px;
```

Eso permite al navegador omitir temporalmente layout y pintura de contenido lejano sin desmontarlo ni impedir que sus imágenes comiencen a prepararse.

## 7. Videos

En esta etapa no se recomprimieron los videos principales. La estrategia fue mejorar cuándo y cómo se descargan:

- el fondo del hero es pequeño y se solicita de inmediato;
- el fondo de `/speakers` se activa después del primer paint;
- videos lejanos se activan por cercanía al viewport;
- recap 2024 y 2025 tienen posters WebP visibles desde el primer momento;
- los videos de “Looking Back At Ageless Experiences” intentan reproducirse al entrar en la zona anticipada;
- `play()` maneja de forma segura posibles bloqueos del navegador.

Los MP4 inspeccionados ya tenían metadata temprana (`moov` cerca del inicio), por lo que no fue necesario aplicar otra pasada de fast-start.

Si en el futuro aún hace falta reducir transferencia, la siguiente fase correcta sería generar variantes de video responsivas, no bajar indiscriminadamente la calidad del único archivo.

## 8. Revelación radial del fondo

Para evitar que un video aparezca congelado durante unos milisegundos mientras termina de prepararse, se implementó una revelación desde el centro hacia afuera en:

- el hero de la Home;
- el fondo de `/speakers`.

Flujo:

1. El video comienza oculto con opacidad cero y una máscara radial mínima.
2. `DeferredMedia` espera `canplay`, `playing` o un `readyState` suficiente.
3. Se agrega `data-ageless-reveal-ready="true"` en el siguiente frame.
4. CSS expande la máscara radial hasta cubrir el bloque y hace el fade de opacidad.

Duraciones actuales:

- opacidad: 420 ms;
- expansión radial: 1150 ms;
- curva: `cubic-bezier(0.16, 1, 0.3, 1)`.

La revelación se ejecuta una sola vez por elemento. Con `prefers-reduced-motion: reduce`, la máscara y sus transiciones se desactivan.

## 9. Estabilidad visual de carruseles y secciones

### Past speakers

Las imágenes de las tarjetas se cargan de forma eager. La intención es que pulsar “Next” solamente mueva contenido ya disponible y no inicie una descarga visible.

El carrusel avanza automáticamente cada 1 segundo mientras está visible y el hover no interrumpe la rotación. Al usar cualquiera de las flechas se pausa durante 3 segundos desde el último clic y después retoma el avance automático cada segundo.

### Segundo bloque de la Home

El fondo y las imágenes críticas dejaron de esperar un lazy loader distante. Se reservó espacio para los portales y se priorizó el contenido que aparece inmediatamente después del hero.

### Crew

Las imágenes están optimizadas a WebP y se preparan sin esperar a que el usuario llegue al título “The Ageless Crew”.

### Recaps

Los dos videos tienen posters dedicados. Esto evita paneles negros incluso antes de que la reproducción comience.

## 10. Animación del logo del hero

La animación de entrada del logo se reconstruyó en CSS y se identifica con `data-ageless-hero-logo="true"`.

- se ejecuta una sola vez al montar la Home;
- dura 680 ms;
- combina opacidad y desplazamiento vertical;
- no depende de Webflow/GSAP;
- se desactiva con `prefers-reduced-motion`.

Al quitar el runtime heredado de la Home se eliminó la posibilidad de que dos sistemas intentaran animar el mismo logo.

### Countdown del hero

Los números se dibujan con matrices geométricas 7×9 diseñadas punto por punto, sin depender del rasterizado de una fuente. Cada bolita comparte exactamente el mismo radio y separación. Al cambiar una cifra, los puntos hacen un morph corto y vuelven rápidamente a su cuadrícula perfecta; el hover y el clic conservan la deformación interactiva, pero con un resorte más rápido para recuperar inmediatamente la legibilidad. La matriz se muestra al 46% de su escala anterior para mantener esa definición con una presencia visual más delicada. Cada glifo se recorta a su ancho geométrico real y usa una separación compacta común, evitando que cifras estrechas como el 1 dejen espacios visuales excesivos. En escritorio, los cuatro bloques usan columnas iguales dentro de un ancho máximo compacto de 460 px para reducir la distancia horizontal entre Days, Hours, Minutes y Seconds; en móvil conservan el ancho adaptable.

El radio de cada punto se elevó del 32% al 42% del paso geométrico, haciendo el countdown más bold sin cambiar posiciones, proporciones ni animaciones.

### Galería de comunidad

La antigua tira horizontal bajo las estadísticas fue reemplazada por una galería vertical inspirada en la composición de Aurae: contenedor de 80 rem, encabezado editorial de dos líneas, proporción 3:4 y controles compactos. Las tarjetas se ampliaron primero un 30% y luego un 14% adicional, se eliminaron por completo sus espacios y radios para formar una cinta visual continua. Cada fotografía vive dentro de un contenedor independiente con `object-fit: cover` y se sirve desde el WebP original, sin una segunda recompresión de Next.js, para conservar la calidad existente incluso con el nuevo tamaño. Usa las diez imágenes optimizadas de Ageless, se desplaza continuamente de derecha a izquierda a una velocidad ligeramente mayor, permite avanzar o retroceder mediante flechas y respeta `prefers-reduced-motion`. El título completo usa Ageless Overused Grotesk: el texto normal usa el peso black, mientras `together` y `experience` son italic sin bold.

## 11. Scroll y navegación interna

`app/home-scroll-reset.tsx` controla dos comportamientos:

1. Entrar a la Home sin hash siempre comienza arriba.
2. Entrar con un hash, por ejemplo `/#tickets`, espera a que exista el destino y lo alinea al inicio.

El bloque de tickets se monta mediante un portal dentro de `#ageless-tuom-feature-slot`. El navegador podía intentar resolver el hash antes de que el portal y las secciones superiores terminaran de estabilizarse, dejando el primer clic cerca del footer. El segundo clic funcionaba porque el destino ya existía.

La solución actual:

- observa mutaciones hasta que aparezca el destino;
- escucha cambios de hash dentro de la misma Home;
- confirma la posición en varios puntos breves durante los primeros 900 ms;
- cancela observers y timers al cambiar o desmontar;
- mantiene `history.scrollRestoration = "manual"` mientras el controlador está activo.

Así, “Buy Tickets” debe llegar al bloque **Invest In Your Longevity / Choose Your Pass** desde el primer clic, tanto desde la Home como desde otra ruta.

## 12. Formulario Exhibit & Sponsor

El CTA `Talk to us on WhatsApp` comparte con `Submit inquiry`:

- familia Chivo Mono;
- tamaño, peso y tracking;
- alto, radio y paddings;
- iconografía Font Awesome;
- estados hover/focus.

Se agregó `white-space: nowrap` exclusivamente al texto del CTA de WhatsApp para mantenerlo en una sola línea sin cambiar su sistema tipográfico ni su distribución visual. En móvil los botones siguen ocupando una fila completa cada uno.

## 13. Caché y Nginx en producción

Nginx sirve directamente recursos estáticos desde el release activo:

- `/_next/static/`: 1 año, `immutable`;
- fuentes: 30 días + `stale-while-revalidate`;
- imágenes y videos: 7 días + `stale-while-revalidate`;
- CSS y JS públicos: 1 día + `stale-while-revalidate`.

También está activo gzip para texto, CSS, JavaScript, JSON, XML y SVG.

Los assets con nombres versionados de Next pueden cachearse un año porque cada build cambia el hash. Para archivos públicos con nombre fijo se usan periodos menores y, cuando corresponde, un query string `?v=` para invalidar versiones anteriores.

## 14. Hardening relacionado

La configuración versionada vive en `ops/hardening/` y refleja lo instalado en el VPS:

- rechazo de hosts desconocidos;
- rechazo de escaneos por IP en TLS;
- bloqueo temprano de rutas típicas de WordPress, Joomla, phpMyAdmin y PHP;
- bloqueo de archivos ocultos y búsquedas de secretos;
- rate limit general y más estricto para `/api/inquiries`;
- límite de conexiones por IP;
- timeouts conservadores;
- headers HSTS, nosniff, frame, referrer y permissions policy;
- Fail2ban para scanners;
- firewall y SSH endurecidos.

La fase pendiente opcional es colocar toda la zona web detrás del proxy de Cloudflare y permitir 80/443 únicamente desde sus rangos. Eso debe hacerse con cuidado para no alterar los registros de correo.

## 15. Flujo de desarrollo y despliegue

Flujo habitual:

```text
cambio local → validación → commit → push a GitHub → pull/build en VPS → producción
```

### Desarrollo local

```bash
npm install
npm run dev
```

### Validación mínima antes de publicar

```bash
npx eslint app/archivo-modificado.tsx
npm run build
```

Como el proyecto conserva la integración secundaria con Sites, para cambios amplios también se recomienda comprobar su compilador:

```bash
npm run lint
npx vinext build
```

Nota conocida: `npm test` todavía contiene dos pruebas del starter original de Sites. Buscan `codex-preview` y `app/_sites-preview/SkeletonPreview.tsx`, elementos que ya no forman parte de esta aplicación. El build real de Next y el de vinext pasan, pero esas pruebas heredadas deben reescribirse antes de volver a usarlas como gate de despliegue.

### Git

```bash
git status --short
git diff
git add <archivos revisados>
git commit -m "Descripción concreta"
git push origin main
```

### VPS

El servidor usa un despliegue transaccional:

```bash
ssh root@162.243.225.128 /usr/local/sbin/deploy-ageless
```

El script:

1. obtiene `main` desde GitHub;
2. instala dependencias de forma reproducible;
3. crea el build en un release nuevo;
4. cambia el enlace `current` al release terminado;
5. reinicia el servicio;
6. ejecuta una comprobación de salud.

Esto evita construir encima del release que atiende tráfico. Un fallo de build no debe reemplazar el release activo.

### Verificación posterior

```bash
curl -I https://agelessevo.com/
curl -I https://agelessevo.com/speakers
```

Además conviene probar manualmente:

- Home desde arriba;
- primer clic en Buy Tickets desde Home, speakers y agenda;
- carrusel de past speakers;
- videos recap;
- fondo radial de Home y speakers;
- modal Exhibit & Sponsor;
- Turnstile y envío real del formulario;
- responsive móvil.

## 16. Variables y secretos

Las credenciales de producción no viven en Git. El VPS usa un archivo de entorno fuera del repositorio para valores como:

- Resend;
- Cloudflare Turnstile;
- destinatario y remitente del formulario.

Reglas:

- no colocar API keys en componentes cliente;
- no escribir secretos en documentación o commits;
- no copiar el archivo de entorno al repositorio;
- rotar cualquier credencial que haya sido compartida por chat;
- verificar que solo el usuario del servicio pueda leer el archivo de entorno.

## 17. Commits principales de esta optimización

- `3846f57` — Optimize initial page load and image delivery.
- `bb4b5db` — Prioritize homepage media and stabilize carousels.
- `7d1fcb7` — Add radial video reveal transitions.
- El commit posterior a este documento incluye el CTA de WhatsApp en una sola línea, la estabilización definitiva del primer clic en tickets y esta bitácora.

## 18. Métricas observadas durante la ronda

Valores orientativos medidos en el entorno de trabajo:

- imágenes activas optimizadas: ~25 MB → ~3.1 MB;
- HTML de Home: ~50.6 KB sin comprimir / ~7.5 KB con gzip;
- JavaScript inicial después de volver a priorizar secciones críticas: ~806 KB sin comprimir;
- respuesta local caliente: alrededor de 2 ms;
- respuesta interna inicial: alrededor de 15 ms;
- respuesta interna del VPS: aproximadamente 8–12 ms.

El tiempo externo incluye DNS, conexión, TLS, distancia de red y descarga, así que no debe compararse directamente con el tiempo interno del proceso.

## 19. Decisiones que no deben revertirse por accidente

- No volver a leer headers en la Home si no es estrictamente necesario: la convertiría otra vez en dinámica.
- No activar `WebflowRuntime` en la Home sin medir el costo y comprobar que realmente haga falta.
- No convertir todos los recursos a eager: solo los visualmente críticos.
- No volver a cargar los videos recap junto al primer viewport.
- No reemplazar los WebP transparentes por JPEG.
- No borrar posters; son parte de la estabilidad visual.
- No retirar `prefers-reduced-motion` de las animaciones.
- No modificar caché de archivos públicos sin versionar el asset cuando sea necesario.
- No restringir 80/443 a Cloudflare antes de que el proxy esté completamente operativo.

## 20. Limitación secundaria de Sites

El repositorio contiene `.openai/hosting.json`, por eso existe también una integración secundaria con Sites/vinext. El espejo de código de esa plataforma no pudo actualizarse en esta ronda porque el paquete de objetos faltantes incluye media grande y el endpoint Git devuelve HTTP 413.

Esto **no afecta** `agelessevo.com`: la producción real usa GitHub + VPS + Nginx. Para habilitar también ese espejo en el futuro habría que sacar videos pesados del historial/paquete o moverlos a almacenamiento de objetos/CDN.

## 21. Próxima fase opcional

Si después de esta ronda se desea seguir mejorando:

1. medir Core Web Vitals reales con usuarios;
2. generar videos AV1/WebM y H.265 por resoluciones;
3. usar CDN/Cloudflare para media grande;
4. añadir `preconnect` solamente a orígenes externos realmente necesarios;
5. revisar y retirar activos históricos que ya no se referencian;
6. automatizar Lighthouse y pruebas de navegación en CI;
7. monitorizar errores del formulario y entregabilidad de Resend.

La prioridad debe seguir siendo la percepción real: que el contenido crítico esté listo, que nada salte y que las optimizaciones no degraden la estética.

## 22. Sistema tipográfico y galería comunitaria

- Los fragmentos rectos de los títulos principales usan peso bold.
- Los fragmentos en cursiva usan un peso medio, nunca bold, y conservan el mismo color del título; en fondos oscuros permanecen blancos.
- Esta regla se aplica a la introducción de tres años, recap, past speakers, pricing, sponsors, crew y galería comunitaria.
- La galería ahora se titula “You Have The Power to Live Well, Age Less.”, con “The Power” y “Live Well” en cursiva sin bold; “You Have”, “to” y “Age Less” permanecen rectos y bold. Un espaciado óptico adicional separa “Power” de “to”.
- El título de la galería conserva exactamente dos líneas mediante saltos explícitos y escala tipográfica responsive.
- Sus controles reutilizan el tratamiento circular negro, borde claro, sombra y hover verde de “The Ageless Crew”.
- `swap.webp` usa un encuadre específico para mostrar mejor a la mujer situada a la derecha, sin recortar ni recomprimir el archivo original.
- En “health meets the future”, `health` permanece recto y bold; en “Our Partners”, `Our` permanece recto y bold y `Partners` queda italic sin bold, ambos conservando el color original de la sección.
