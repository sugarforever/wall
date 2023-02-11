import { ethers } from "ethers";
import { useMetamask } from "./useMetamask";

export const useListen = () => {
    const { dispatch } = useMetamask();

    return () => {
        window.ethereum.on("accountsChanged", async (newAccounts: string[]) => {
            if (newAccounts.length > 0) {
                // uppon receiving a new wallet, we'll request again the balance to synchronize the UI.
                const newBalance = await window.ethereum!.request({
                    method: "eth_getBalance",
                    params: [newAccounts[0], "latest"],
                });

                const [firstAccount] = newAccounts;
                const provider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/51f732adc1b443ad9b1f34fb65b9aaad')
                const abi = [
                    "function balanceOf(address,uint256) view returns (uint256)",
                ]
                const contractAddress = '0xDF9C19ceAdf7e4A9db07A57Fc0bFA246938e3BCA'
                const contract = new ethers.Contract(contractAddress, abi, provider)
                const wtfIntroTransaction = await contract.balanceOf(firstAccount, 0) // WTF Solidity Intro Pass
                const wtfAdvancedTransaction = await contract.balanceOf(firstAccount, 1) // WTF Solidity Advanced Pass 
                const { _introHex } = wtfIntroTransaction
                const { _advancedHex } = wtfAdvancedTransaction

                dispatch({
                    type: "connect",
                    wallet: newAccounts[0],
                    balance: newBalance,
                    introPassed: _introHex > 0,
                    advancedPassed: _advancedHex > 0
                });
            } else {
                // if the length is 0, then the user has disconnected from the wallet UI
                dispatch({ type: "disconnect" });
            }
        });
    };
};
