import type React from "react";

// The <xr-logo-intro> custom element is defined by public/xr-logo-intro.js.
// Declare it so TSX/React accepts it as an intrinsic element.
declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      "xr-logo-intro": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};
