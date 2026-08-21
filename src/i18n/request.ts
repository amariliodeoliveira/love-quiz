import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const importedMessages = await import("../../messages/en.json");
  const messages = importedMessages.default;

  return { locale: "en", messages };
});
