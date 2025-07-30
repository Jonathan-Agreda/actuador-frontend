export interface Gateway {
  alias: string;
  ip: string;
  estado: "ok" | "caido" | "reiniciando";
}

export interface Relays {
  releMotor1: boolean;
  releMotor2: boolean;
  releGateway: boolean;
  releValvula: boolean;
}

export interface Actuador {
  id: string;
  alias: string;
  ip: string;
  latitud: number;
  longitud: number;
  estado: "online" | "offline";
  motorEncendido: boolean;
  relays: Relays;
  estadoGateway: "ok" | "caido" | "reiniciando";
  gateway: Gateway;
}
