const defaultAppName = "Hafalku";

function readAppName(value: string | undefined) {
  const name = value?.trim();
  return name || defaultAppName;
}

export const appConfig = {
  name: readAppName(import.meta.env.VITE_APP_NAME),
  environment: import.meta.env.MODE,
} as const;
