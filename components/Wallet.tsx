import { ethers } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { useMetamask } from "../hooks/useMetamask";
import { Loading } from "./Loading";

export default function Wallet() {
    const {
        dispatch,
        state: { status, isMetamaskInstalled, wallet, balance, introPassed, advancedPassed },
    } = useMetamask();

    const showInstallMetamask = status !== "pageNotLoaded" && !isMetamaskInstalled;
    const showConnectButton = status !== "pageNotLoaded" && isMetamaskInstalled && !wallet;

    const handleConnect = async () => {
        dispatch({ type: "loading" });
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
            const balance = await window.ethereum!.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
            });
            const [firstAccount] = accounts;
            const provider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/51f732adc1b443ad9b1f34fb65b9aaad')
            const abi = [
                "function balanceOf(address,uint256) view returns (uint256)",
            ]
            const contractAddress = '0xDF9C19ceAdf7e4A9db07A57Fc0bFA246938e3BCA'
            const contract = new ethers.Contract(contractAddress, abi, provider)
            const wtfIntroTransaction = await contract.balanceOf(firstAccount, 0) // WTF Solidity Intro Pass
            const wtfAdvancedTransaction = await contract.balanceOf(firstAccount, 1) // WTF Solidity Advanced Pass 
            const { _hex: introHex } = wtfIntroTransaction
            const { _hex: advancedHex } = wtfAdvancedTransaction

            dispatch({ 
                type: "connect", 
                wallet: firstAccount, 
                balance, 
                introPassed: parseInt(introHex, 16) > 0, 
                advancedPassed: parseInt(advancedHex, 16) > 0 
            });
        }
    };

    return (
        <div className="bg-truffle">
            <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    <span className="block">This is Your Wall</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-white">
                    Connect with MetaMask and Stick Your NFT on the Wall
                </p>

                {wallet && (
                    <div className=" px-4 py-5 sm:px-6">
                        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                            <div className="ml-4 mt-4">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium leading-6 text-white">
                                            Address: <span>{wallet}</span>
                                        </h3>
                                        <p className="text-sm text-white">
                                            Balance: <span>{balance}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {wallet && introPassed && (
                    <div className=" px-4 py-5 sm:px-6">
                        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                            <div className="ml-4 mt-4">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium leading-6 text-white">
                                            WTF Solidity Intro Pass (Test)
                                        </h3>
                                        <div className="text-sm text-white">
                                            <img
                                                alt="WTF Solidity Intro Pass (Test)"
                                                srcSet="https://gateway.ipfs.io/ipfs/QmaVBkNVSVMtXriFZG4YfwP5q8WaWeJNWxFywFK3YVAYvR"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {wallet && advancedPassed && (
                    <div className=" px-4 py-5 sm:px-6">
                        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                            <div className="ml-4 mt-4">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium leading-6 text-white">
                                            WTF Solidity Advanced Pass (Test)
                                        </h3>
                                        <div className="text-sm text-white">
                                            <img
                                                alt="WTF Solidity Advanced Pass (Test)"
                                                srcSet="https://gateway.ipfs.io/ipfs/QmeVLGY4oTnj2VMmkSXtKucjTaN6i5dXGaRBpf6WzRmDHW"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showConnectButton && (
                    <button
                        onClick={handleConnect}
                        className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
                    >
                        {status === "loading" ? <Loading /> : "Connect Wallet"}
                    </button>
                )}

                {showInstallMetamask && (
                    <Link href="https://metamask.io/" target="_blank">
                        <a className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto">
                            Connect Wallet
                        </a>
                    </Link>
                )}
            </div>
        </div>
    );
}