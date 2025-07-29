export const getLoraIcon = (estado: "online" | "offline") =>
  `/icons/lora-${estado}.svg`;

export const getGatewayIcon = (estado: boolean) =>
  `/icons/gateway-${estado ? "online" : "offline"}.svg`;

export const getMotorIcon = (encendido: boolean) =>
  `/icons/motor-${encendido ? "on" : "off"}.svg`;

export const getRelayIcon = (activo: boolean) =>
  `/icons/relay-${activo ? "on" : "off"}.svg`;
