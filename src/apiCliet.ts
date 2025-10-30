import { Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { TalService } from "@buf/mawhub_tal.bufbuild_es/tal/v1/tal_service_pb";

const transport = createConnectTransport({
  baseUrl: "http://192.168.100.40:9090",
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: "include", // 👈 inject credentials here
    });
  },
  useHttpGet: true,
});

export const apiClient: Client<typeof TalService> = createClient(
  TalService,
  transport,
);
