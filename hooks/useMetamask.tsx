import React, { useEffect, type PropsWithChildren } from "react";

type ConnectAction = { type: "connect"; wallet: string; balance: string, introPassed: boolean; advancedPassed: boolean };
type DisconnectAction = { type: "disconnect" };
type PageLoadedAction = { type: "pageLoaded"; isMetamaskInstalled: boolean, wallet: string, balance: string };
type LoadingAction = { type: "loading" };

type Action =
  | ConnectAction
  | DisconnectAction
  | PageLoadedAction
  | LoadingAction;

type Dispatch = (action: Action) => void;

type Status = "loading" | "idle" | "pageNotLoaded";

type State = {
  wallet: string | null;
  isMetamaskInstalled: boolean;
  status: Status;
  balance: string | null;
  introPassed: boolean | false;
  advancedPassed: boolean | false;
};

const initialState: State = {
  wallet: null,
  isMetamaskInstalled: false,
  status: "loading",
  balance: null,
  introPassed: false,
  advancedPassed: false
} as const;

function metamaskReducer(state: State, action: Action): State {
  switch (action.type) {
    case "connect": {
      const { wallet, balance, introPassed, advancedPassed } = action;
      return { ...state, wallet, balance, introPassed, advancedPassed, status: "idle" };
    }
    case "disconnect": {
      window.localStorage.removeItem("metamaskState");
      if (typeof window.ethereum !== undefined) {
        window.ethereum.removeAllListeners(["accountsChanged"]);
      }
      return { ...state, wallet: null, balance: null };
    }
    case "pageLoaded": {
      const { isMetamaskInstalled } = action;
      return { ...state, isMetamaskInstalled, status: "idle" };
    }
    case "loading": {
      return { ...state, status: "loading" };
    }
    default: {
      throw new Error("Unhandled action type");
    }
  }
}

const MetamaskContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function MetamaskProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = React.useReducer(metamaskReducer, initialState);
  const value = { state, dispatch };

  useEffect(() => {
    if (typeof window !== undefined) {
      // start by checking if window.ethereum is present, indicating a wallet extension
      const ethereumProviderInjected = typeof window.ethereum !== "undefined";
      // this could be other wallets so we can verify if we are dealing with metamask
      // using the boolean constructor to be explecit and not let this be used as a falsy value (optional)
      const isMetamaskInstalled =
        ethereumProviderInjected && Boolean(window.ethereum.isMetaMask);

      dispatch({ type: "pageLoaded", isMetamaskInstalled, wallet: '', balance: '' });
    }
  }, []);

  return (
    <MetamaskContext.Provider value={value}>
      {children}
    </MetamaskContext.Provider>
  );
}

function useMetamask() {
  const context = React.useContext(MetamaskContext);
  if (context === undefined) {
    throw new Error("useMetamask must be used within a MetamaskProvider");
  }
  return context;
}

export { MetamaskProvider, useMetamask };