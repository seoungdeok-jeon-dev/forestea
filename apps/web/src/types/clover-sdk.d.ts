interface CloverElementStyle {
  body?: {
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: string;
    color?: string;
    margin?: string;
    padding?: string;
  };
  input?: {
    fontSize?: string;
    lineHeight?: string;
    height?: string;
    color?: string;
    margin?: string;
    padding?: string;
  };
}

interface CloverElement {
  mount(selector: string): void;
  unmount(): void;
  addEventListener(
    type: "change" | "blur",
    handler: (event: { errors?: Record<string, { error?: string }> }) => void,
  ): void;
}

interface CloverElements {
  create(type: string, styles?: CloverElementStyle): CloverElement;
}

interface CloverCreateTokenResult {
  token?: string;
  errors?: Record<string, string>;
}

interface CloverInstance {
  elements(): CloverElements;
  createToken(): Promise<CloverCreateTokenResult>;
}

interface CloverConstructor {
  new (
    apiAccessKey: string,
    options?: { merchantId?: string; locale?: string },
  ): CloverInstance;
}

interface Window {
  Clover?: CloverConstructor;
}
