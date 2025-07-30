export const getLoraIcon = (estado: "online" | "offline") =>
  `/icons/lora-${estado}.svg`;

export const getGatewayIcon = (
  estado: "ok" | "caido" | "reiniciando"
): string => {
  if (estado === "ok") return "/icons/gateway-online.svg";
  if (estado === "caido") return "/icons/gateway-offline.svg";
  return "/icons/gateway-yellow.svg"; // reiniciando
};

export const getMotorIcon = (encendido: boolean) =>
  `/icons/motor-${encendido ? "on" : "off"}.svg`;

export const getRelayIcon = (activo: boolean) =>
  `/icons/relay-${activo ? "on" : "off"}.svg`;
