# iam

## Variables de entorno

La app requiere las siguientes variables de entorno para funcionar
(validadas con `requireEnv` en tiempo de ejecución; si falta alguna, la ruta
que la necesita falla al arrancar):

- `IAM_API_URL`
- `IAM_APPLICATION_NAME`
- `IAM_TARGET_APPLICATION_NAME`

## Cómo obtener cada una

### `IAM_API_URL`

URL desde la que este frontend puede alcanzar a `iam-api` (Service dentro
del cluster, o su URL pública si corre fuera).

### `IAM_APPLICATION_NAME`

Debe ser exactamente el mismo valor configurado como `IAM_APPLICATION_NAME`
en `iam-api`. Se usa al hacer login para pedir un token emitido para la
aplicación "iam".

### `IAM_TARGET_APPLICATION_NAME`

Nombre de la aplicación destino a la que apunta el login. Se envía en el
header `x-target-application` junto con `x-application-name` (la aplicación
origen).
