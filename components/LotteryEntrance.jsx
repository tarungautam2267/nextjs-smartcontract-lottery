import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId = parseInt(chainIdHex)
  const [entranceFee, setEntranceFee] = useState("0")
  const [numPlayers, setNumPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0")

  const raffleaddress =
    chainId in contractAddresses ? contractAddresses[chainId] : null
  console.log(raffleaddress)

  const dispatch = useNotification()

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleaddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  })
  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleaddress,
    functionName: "getEntranceFee",
    params: {},
  })
  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleaddress,
    functionName: "getNumberOfPlayers",
    params: {},
  })
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleaddress,
    functionName: "getRecentWinner",
    params: {},
  })
  async function updateui() {
    const entranceFee1 = (await getEntranceFee()).toString()
    const numPlayers1 = (await getNumberOfPlayers()).toString()
    const recentWinner1 = await getRecentWinner()

    setEntranceFee(entranceFee1)
    setNumPlayers(numPlayers1)
    setRecentWinner(recentWinner1)

    console.log(entranceFee)
  }
  useEffect(() => {
    if (isWeb3Enabled) {
      updateui()
    }
  }, [isWeb3Enabled])

  const handleSuccess = async function (tx) {
    await tx.wait(1)
    handleNewNotification(tx)
    updateui()
  }

  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction Complete",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    })
  }

  return (
    <div className="p-5 ">
      {raffleaddress ? (
        <div>
          <button
            className="bg-orange-500 hover:bg-orange-800 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async function () {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <div className="py-3">
            Entrance Fee : {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </div>
          <div>Players: {numPlayers}</div>
          <div className="py-3">Recent Winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No Raffle Address Detected</div>
      )}
    </div>
  )
}
