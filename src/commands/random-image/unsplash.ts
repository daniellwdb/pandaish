import { createApi } from "unsplash-js";
import { config } from "../../config.js";

export const unsplash = createApi({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  accessKey: config.get("unsplashAccessKey")!,
  fetch,
  apiUrl: "https://api.unsplash.com/",
});
